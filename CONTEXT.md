# CONTEXT.md — BODY EARTH 開発引き継ぎ

> 人体版 Google Earth（Webベース3Dインタラクティブアプリ）のMVP。
> 最終更新: 2026-06-14（セッション6: muscle-torso Hotspot追加で21部位整合＋断面位置スライダー＋断面中raycast抑制）

## 1. 現在のステータス

**MVP完成・GitHub Pages公開済み。皮膚→筋肉→骨格→内臓の4段階で潜れる。主要部位はクリックで解説表示。**

- **公開URL: https://yo-kame-personal.github.io/body-earth/**
- リポジトリ: https://github.com/yo-kame-personal/body-earth （mainへのpushで自動デプロイ）
- `npm run build` 成功（TypeScriptエラーなし）
- 検証済み（headless Playwright + スクショ目視）:
  - **深度4段階**: 皮膚(0) → 筋肉(0.5) → 骨格(0.75) → 内臓(1.0)。最深部では骨格がフェードアウトし内臓だけが残る ✓
  - 骨格・内臓・筋肉が実3Dモデル（Z-Anatomy）。皮膚のみプリミティブ ✓
  - 内臓は骨格を除去した「内臓のみ」モデル（骨に邪魔されず見える）✓
  - **部位クリック→InfoPanel**: Hotspot（クリック判定球）経由。21部位すべてにHotspotがあり1:1対応（前回欠落のmuscle-torsoを追加）。クリック動作を実証 ✓
  - **断面位置スライダー**: 断面ON時に「手前↔奥」で切る深さ(clipPos)を連続調整。深いカットで頭蓋/肋骨/骨盤の断面のみ残る ✓
  - **断面中のraycast抑制**: 切り取られた手前側のHotspotは非表示・クリック不可。深いカットでは背中側の脊椎のみ残る ✓
  - Fresnel縁発光・断面clip・クロスフェード ✓
- ローカル起動: `cd ~/Desktop/dev/body-earth && npm run dev`

## 2. 技術スタックとアーキテクチャ

- **React 19 + Vite + TypeScript + @react-three/fiber + @react-three/drei + zustand**
- アセット: 骨格・内臓・筋肉は実glb（Z-Anatomy）、皮膚のみプリミティブ

### コアコンセプト: 深度(depth 0..1)による4段階制御

```
depth: 0 ──── 0.3 ──── 0.5 ──── 0.75 ──── 1.0
       皮膚    (遷移)   筋肉      骨格      内臓
```

- `src/store.ts` — zustand。`depth`/`selectedId`/`clip`/`clipPos`。URLの`?depth=`/`?clip=1`/`?clipPos=`で初期値指定可
- `src/lib/depth.ts` — **最重要**。`LayerId = 'skin'|'muscle'|'skeleton'|'viscera'`（4レイヤー）。`CURVES`が各層の台形不透明度カーブ。骨格[0.55,0.72,0.82,0.94]は最深(1.0)で0になり、内臓[0.7,0.9,9,10]だけが残るのがポイント。`activeLayerLabel`も4段階
- `src/lib/layerMaterial.ts` — レイヤー共通マテリアル（Fresnel/clip）。BodyPartとModelLayerで共有。`clipConstant(clipPos)`が断面の切る深さ(0..1)→クリップ平面constant(world z)変換。`CLIP_PLANES[0].constant`は共有でScene内ClipControllerが書き換え（frameloop=alwaysで即反映）
- `src/components/layers/ModelLayer.tsx` — glbを1レイヤーとして読み込み、depth連動opacity＋Fresnel＋clip＋renderOrder。props: src/layer/position/rotation/scale/renderOrder
- `src/components/layers/`:
  - `CoreLayer.tsx` — 骨格(skeleton.glb, layer="skeleton")＋内臓(viscera.glb, layer="viscera")の2つのModelLayer。renderOrder=0
  - `MuscleLayer.tsx` — 筋肉(muscle.glb, layer="muscle", renderOrder=1)
  - `SkinLayer.tsx` — 皮膚（プリミティブ, renderOrder=2）
- `src/components/Hotspot.tsx` / `Hotspots.tsx` — **部位クリック用の判定球**。実モデルはメッシュ名が連番(Object_N)でクリック判定に使えないため、主要部位の座標に見えない球を置きクリック→`select(partId)`→InfoPanel。常時うっすら青く光り、対応レイヤーが見えている深度(layerOpacity>0.5)のときだけ表示・クリック可。`Hotspots.tsx`内の`SPOTS`配列(id/pos/r/layer)が全21部位の配置の一次データ＝parts.tsと1:1。断面ON時は`pos.z > cut+半径`（切り取られた手前側）を抑制。Sceneで`<Hotspots/>`を配置（Suspense外）
- `src/data/parts.ts` — 部位ID→解説（21部位）。layerは skin/muscle/skeleton/viscera。Hotspots.tsxのSPOTSとIDが1:1対応
- `src/components/ui/` — DepthSlider（4段階ラベル＋断面トグル＋断面ON時の位置スライダー）/ Hud（クレジット）/ InfoPanel（layer-chipは index.css の layer-skin/muscle/skeleton/viscera）

### モデル変換パイプライン（重要）
- Z-Anatomyの**glbは累積レイヤー構造**: 内臓学(Splanchnology)モデルには位置参照用に骨格が同梱されている（ノード名が "Z-Anatomy-Layers1-7"）。そのまま使うと骨格レイヤーを消しても骨が残る
- そのため内臓は2段階で生成:
  1. `node scripts/extract-viscera.mjs` — splanchnologyからarthrology(骨格)と共通メッシュを除去し`assets-src/viscera-only.glb`（内臓のみ）を生成
  2. `node scripts/optimize-model.mjs assets-src/viscera-only.glb viscera --ratio 0.12` — metal/rough変換＋simplify＋Draco＋WebP
- 骨格・筋肉は直接 optimize-model.mjs（`arthrology→skeleton` / `myology→muscle`）
- 現在: skeleton.glb(0.89MB) / viscera.glb(0.29MB) / muscle.glb(2.48MB)、合計約3.66MB
- クレジット: `public/models/CREDITS.md`＋HUD（Arthrology=CC BY 4.0 / Myology・Splanchnology=CC BY-SA 4.0）

## 3. 既知の課題・未解決事項

1. ホットスポット座標は人体モデルに合わせた**近似**。完璧な位置合わせはしていない（クリックで概ね正しい部位が出る程度）。モデルを回すと裏側の部位を手前の点で拾う場合あり（depthTest:falseのため）。**未解決**
2. 筋肉(myology)も累積モデルの可能性大。ただしdepth=0.5では筋肉が骨を覆うので骨は見えず実害なし（必要なら内臓と同様にextractで骨除去可能）
3. 透明レイヤーの重なりアーティファクト（depthWriteはopacity>0.95のみ）。renderOrderで緩和
4. 皮膚はプリミティブのまま（実モデル未導入）。プロポーションが粗い
5. 脳は未収録（Z-AnatomyのNeurology系が別途必要）。ユーザーと相談の上、今回は見送り
6. 断面のフタ(cap)なし。断面中もモデルメッシュのraycastは当たる（部位選択はHotspot経由のため実害は限定的。Hotspot側は断面で抑制済み）

## 4. 次セッションでやること（優先順）

1. ホットスポット座標の微調整（回転時に裏側を手前で拾う問題＝depthTest:false由来。カメラ向きでの裏面cullなど）。※部位データparts.tsは21部位の確定解説で整備済み
2. 皮膚の実モデル化（Step Bの残り。皮膚モデルのDLが要る）
3. 脳・神経の追加（NeurologyモデルのDL→extract-viscera同様に骨格除去→レイヤー追加）
4. （完了）断面位置スライダー・断面中のraycast抑制 → セッション6で実装済み

## 5. 検証用メモ

- URLは `http://localhost:5173/body-earth/`（base設定あり）
- 深度別スクショ: `npx playwright screenshot --viewport-size=1280,800 --wait-for-timeout=7000 "http://localhost:5173/body-earth/?depth=1" out.png`（実モデルのロードに数秒、timeout 7000推奨）
- 深度の目安: 0=皮膚 / 0.5=筋肉 / 0.75=骨格 / 1.0=内臓
- 断面: URLに`&clip=1`。切る深さは`&clipPos=`（0=手前だけ薄く / 0.5=前半分 / 1=背中側まで深く）
- 検証スクリプト: `scripts/verify-{click,easing,clip}.mjs`（要devサーバー）
