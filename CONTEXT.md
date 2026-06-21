# CONTEXT.md — BODY EARTH 開発引き継ぎ

> 人体版 Google Earth（Webベース3Dインタラクティブアプリ）のMVP。
> 最終更新: 2026-06-14（セッション9: 素体を「かわいい等身キャラ」に作り直し＝lathe胴体＋関節手足＋手足。服も体に沿わせ精度向上）

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
  - **きせかえ（コーデ）**: 部位別に自由に組合せ。4スロット=顔/トップス/ボトムス/肌。
    - 肌スキン8種（ノーマル/ゴールド像/メタルロボ/ゾンビ/透明人間/ホログラム/大理石像/キャンディ）。`?skin=gold`等
    - 顔は**立体パーツ**（目・口・小物を3Dメッシュで頭に配置）10種。表情=目/口の形＋小物(サングラス/メガネ/ほっぺ)。`?face=cool`等
    - トップス7種（なし/Tシャツ/パーカー/スーツ/白衣/宇宙服/タンク、袖=なし/短/長）。`?top=hoodie`
    - ボトムス5種（なし/ロングパンツ/ジーンズ/ハーフパンツ/スカート）。`?bottom=jeans`
    - 服は素体（皮膚）に体に沿うメッシュを重ねる方式。顔・服は皮膚と同じopacityでフェード＝深く潜ると消える
    - UI: 深度スライダーのパネル内「きせかえ」ボタンで4スロット展開（皮膚が見える深度のみ）。スマホで重なりなしを確認 ✓
  - **素体を等身キャラに刷新（セッション9）**: 旧=球+カプセルの塊で「再現精度がいまいち」とユーザー指摘→かわいい等身キャラに振り切る方針。胴体をlathe(回転体)でなめらかに括れさせ、関節のある腕(上腕+前腕+手)・脚(太もも+すね+足)に。`src/lib/bodyShape.ts`に体型を一元化しSkin/Clothing/Faceで共有。服も同じ体型に沿うlatheシェル＋カプセル袖で「服らしく」。スクショ確認: 素体/パーカー+ジーンズ/Tシャツ+ハーフパンツ/潜行時(0.5筋肉・1.0内臓)も正常 ✓
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
  - `SkinLayer.tsx` — 素体（等身キャラ, renderOrder=2）。胴=lathe(TRUNK_PROFILE)、腕=上腕+前腕+手、脚=太もも+すね+足。`bodyShape.ts`の定数を使用。アクティブskinの`look`を全パーツに展開
  - `ClothingLayer.tsx` — 服（renderOrder=3）。`bodyShape`のgarmentProfile(体に沿うlatheシェル)＋カプセル袖/脚。Top=胴シェル+袖(短/長) / Bottom=腰シェル+脚(パンツ/ショート)orスカート円錐。上着pad0.045>腰pad0.03で重なりのz-fighting回避。topId/bottomId連動
  - `FaceLayer.tsx` — 顔の立体パーツ（renderOrder=5）。頭中心(bodyShape.HEAD)にEye×2/Mouth/Accessoryを配置。目=dot/wide/happy/sleepy/robot、口=smile/neutral/open/grin、小物=サングラス/メガネ/ほっぺ。faceId連動
- `src/lib/bodyShape.ts` — **体型の一元管理**。BODY_Z(前後の平たさ0.72)、TRUNK_KEYS/radiusAt/TRUNK_PROFILE(胴の輪郭)、garmentProfile(服用シェル)、HEAD/NECK/ARM/LEGの配置定数。Skin/Clothing/Face/Hotspotsが参照。体型を変えるならここを編集
- `src/components/DecorPart.tsx` — きせかえ装飾用の**クリック判定なし**メッシュ（顔・服で共用）。皮膚と同じopacityでフェード＋clip追従
- `src/components/Hotspot.tsx` / `Hotspots.tsx` — **部位クリック用の判定球**。実モデルはメッシュ名が連番(Object_N)でクリック判定に使えないため、主要部位の座標に見えない球を置きクリック→`select(partId)`→InfoPanel。常時うっすら青く光り、対応レイヤーが見えている深度(layerOpacity>0.5)のときだけ表示・クリック可。`Hotspots.tsx`内の`SPOTS`配列(id/pos/r/layer)が全21部位の配置の一次データ＝parts.tsと1:1。断面ON時は`pos.z > cut+半径`（切り取られた手前側）を抑制。Sceneで`<Hotspots/>`を配置（Suspense外）
- `src/data/parts.ts` — 部位ID→解説（21部位）。layerは skin/muscle/skeleton/viscera。Hotspots.tsxのSPOTSとIDが1:1対応
- `src/data/skins.ts` — **肌スキンのプリセット定義**（1スキン=データ1件のSKINS配列）。color/roughness/metalness/emissive/emissiveIntensity/opacityScale。`getSkin(id)`/`DEFAULT_SKIN_ID`
- `src/data/dressup.ts` — **きせかえ定義**（FACES/TOPS/BOTTOMS、1アイテム=1データ）。配列に足すだけでUIボタンも自動増。`getFace/getTop/getBottom`＋各DEFAULT_*_ID。デフォルト=顔smile・服なし
- `src/store.ts`に`skinId/faceId/topId/bottomId`＋setter追加（URL`?skin=/?face=/?top=/?bottom=`対応）。`BodyPart.tsx`はmetalness/baseEmissive/baseEmissiveIntensityを受け取り、hover/選択時の白発光とベース発光を合成
- `src/components/ui/` — DepthSlider（4段階ラベル＋**きせかえトグル**＋断面トグル＋断面ON時の位置スライダー）/ Hud / InfoPanel / **DressUpPanel（顔/トップス/ボトムス/肌の4スロットを横スクロール行で並べる。深度パネル内に展開、皮膚が見える深度のみ）**。※旧SkinPicker.tsxは廃止しDressUpPanelに統合

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
4. 皮膚はプリミティブのまま（実モデル未導入）。プロポーションが粗い。※セッション7-8で「リアル皮膚標本ではなくきせかえ(肌スキン+顔+服)で遊ぶ」方針に転換。実モデル化は優先度を下げた
7. 服・顔・Hotspotは`bodyShape.ts`の体型定数に依存。体型を変える場合はbodyShape.tsを直せば全部追従（セッション9で一元化済み）。アイテム追加自体は dressup.ts 配列で容易
8. 等身キャラは正面想定の作り。横/後ろから見ると顔は前面のみ、袖は単純カプセル。雰囲気重視で割り切り
5. 脳は未収録（Z-AnatomyのNeurology系が別途必要）。ユーザーと相談の上、今回は見送り
6. 断面のフタ(cap)なし。断面中もモデルメッシュのraycastは当たる（部位選択はHotspot経由のため実害は限定的。Hotspot側は断面で抑制済み）

## 4. 次セッションでやること（優先順）

1. ホットスポット座標の微調整（回転時に裏側を手前で拾う問題＝depthTest:false由来。カメラ向きでの裏面cullなど）。※部位データparts.tsは21部位の確定解説で整備済み
2. きせかえの発展（任意）: 「おまかせコーデ」プリセット（顔+服+肌の組合せを1タップ）、アイテム追加（帽子/靴/アクセ）、ガチャ/アンロックのゲーム化。アイテム追加は`src/data/dressup.ts`の配列に足すだけ
3. 脳・神経の追加（NeurologyモデルのDL→extract-viscera同様に骨格除去→レイヤー追加）
4. （完了）断面位置スライダー・断面中のraycast抑制 → セッション6
5. （完了）肌スキン着せ替え → セッション7
6. （完了）きせかえ拡張（顔・トップス・ボトムス、部位別） → セッション8
7. （完了）素体を等身キャラに刷新（lathe胴体＋関節手足、bodyShape.tsに一元化） → セッション9

## 5. 検証用メモ

- URLは `http://localhost:5173/body-earth/`（base設定あり）
- 深度別スクショ: `npx playwright screenshot --viewport-size=1280,800 --wait-for-timeout=7000 "http://localhost:5173/body-earth/?depth=1" out.png`（実モデルのロードに数秒、timeout 7000推奨）
- 深度の目安: 0=皮膚 / 0.5=筋肉 / 0.75=骨格 / 1.0=内臓
- 断面: URLに`&clip=1`。切る深さは`&clipPos=`（0=手前だけ薄く / 0.5=前半分 / 1=背中側まで深く）
- きせかえ: URLに`&skin=`(肌8種) `&face=`(smile/plain/surprise/grin/cool/nerd/cute/sleepy/robot/none) `&top=`(none/tshirt/hoodie/suit/doctor/space/tank) `&bottom=`(none/pants/jeans/shorts/skirt)。UIは深度パネル内「きせかえ」ボタン(皮膚が見える深度のみ)
- 検証スクリプト: `scripts/verify-{click,easing,clip}.mjs`（要devサーバー）。パネル操作の確認は一時mjsをプロジェクト直下に置いてplaywright実行（/tmpだとnode_modules解決不可）
