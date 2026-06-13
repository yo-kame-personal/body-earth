# CONTEXT.md — BODY EARTH 開発引き継ぎ

> 人体版 Google Earth（Webベース3Dインタラクティブアプリ）のMVP。
> 最終更新: 2026-06-13（セッション4: 内臓・筋肉を実3Dモデル化(Step B)＋metal/rough変換でマテリアル正常化まで完了）

## 1. 現在のステータス

**MVP完成・全主要動作を検証済み・GitHub Pages公開済み。骨格／内臓／筋肉が実3Dモデル、皮膚のみプロシージャル。**

- **公開URL: https://yo-kame-personal.github.io/body-earth/**
- リポジトリ: https://github.com/yo-kame-personal/body-earth （mainへのpushで自動デプロイ）
- `npm run build` 成功（TypeScriptエラーなし。バンドル約1.17MB / gzip 325KB）
- 検証済みの動作（headless Playwright + スクショ目視）:
  - depth=0.3 / 0.5 / 0.65 / 1 のレイヤー表示とクロスフェード ✓
  - depth=1: 骨格の胸郭・腹腔に内臓が解剖学的に正しく収まる構図 ✓
  - スライダー→カメラ距離のイージング、ホイールズーム→depth同期 ✓
  - レイヤー遷移中のFresnel縁発光（depth=0.65で発光）✓
  - 断面表示モード（「断面」トグル / `?clip=1`）— 骨格・内臓・筋肉すべて断面に反応 ✓
  - **骨格・内臓・筋肉が実3Dモデル**（Z-Anatomy: Arthrology / Splanchnology / Myology）✓
  - 3モデルともmetal/rough変換済みで色が正確（内臓は 心臓=赤 / 肝臓=赤茶 / 腸=ピンク 等）✓
  - 3モデルともFresnel縁発光・断面clip・renderOrderに対応（BodyPartと挙動統一）✓
- ローカル起動方法: `cd ~/Desktop/dev/body-earth && npm run dev`

## 2. 技術スタックとアーキテクチャ

- **React 19 + Vite + TypeScript + @react-three/fiber (Three.js) + @react-three/drei + zustand**
- アセット: **骨格・内臓・筋肉は実glbモデル（Z-Anatomy）、皮膚のみプリミティブ**（capsule/sphere等のプロシージャルなモック）

### コアコンセプト: 「深度(depth)」による統一制御

```
depth: 0.0 ───────── 0.4 ───────── 0.8 ───── 1.0
        皮膚          筋肉          骨格・内臓
```

- `src/store.ts` — zustandストア。`depth`(0〜1)/`selectedId`/`clip`が全状態。URLの`?depth=0.7`/`?clip=1`で初期値指定可（デバッグ用）
- `src/lib/depth.ts` — **最重要**。カメラ距離↔深度の変換とレイヤーごとの不透明度カーブ（台形`trapezoid`）。`CURVES`定数で遷移タイミングを調整。MIN_DISTANCE=3.4 / MAX_DISTANCE=7。core(骨格内臓)は[0.55,0.8,9,10]でdepth=1まで全開維持
- `src/components/CameraRig.tsx` — 双方向同期＋イージング（前セッションから変更なし）。スライダー由来は`MathUtils.damp`、カメラ操作由来は`start`で即中断、epsilon(0.02)で判別
- `src/lib/layerMaterial.ts` — **レイヤー共通マテリアル処理**（BodyPartとModelLayerで共有）。`makeRimInjector`(Fresnel縁発光GLSL注入)/`rimStrength`(半透明時のみ)/`CLIP_PLANES`(断面平面 z=0)
- `src/components/BodyPart.tsx` — プリミティブ用メッシュラッパー（**現在は皮膚レイヤーのみが使用**）。不透明度0.35未満はクリックを奥へ通す
- `src/components/layers/ModelLayer.tsx` — **glbを1レイヤーとして読むコンポーネント**。depth連動opacity＋Fresnel＋断面clip＋renderOrderに対応。`useGLTF(url,true)`でDraco対応、必ずSuspense内で使用。props: `src/layer/position/rotation/scale/renderOrder`
- `src/components/layers/` 構成（renderOrderは内側0→外側2で透明描画の破綻を抑制）:
  - `CoreLayer.tsx` — 骨格(skeleton.glb)＋内臓(viscera.glb)の2つのModelLayer。どちらも layer="core" / position[0,-1.62,0] / scale1.95 / renderOrder=0
  - `MuscleLayer.tsx` — 筋肉(muscle.glb)のModelLayer。layer="muscle" / 同position・scale / renderOrder=1
  - `SkinLayer.tsx` — 皮膚（プリミティブのまま）。renderOrder=2
- モデル変換 — `node scripts/optimize-model.mjs <in.glb> <name> --ratio 0.12`。**metal/rough変換（specGloss→metalRough）→ simplify(meshopt) → Draco → WebPテクスチャ** を一括。`assets-src/`に生glbを置く（gitignore）。出力は`public/models/<name>.glb`
  - 現在のモデル: skeleton.glb(1.0MB) / viscera.glb(0.78MB) / muscle.glb(2.48MB)、合計約4.3MB
  - クレジットは`public/models/CREDITS.md`とHUD（Arthrology=CC BY 4.0 / Myology・Splanchnology=CC BY-SA 4.0）
- `src/data/parts.ts` — 部位ID→ダミー解説データ（21部位）。InfoPanelが参照

## 3. 既知の課題・未解決事項

1. **実モデル(骨格/内臓/筋肉)はクリック→InfoPanel非対応**。InfoPanelが出るのはプリミティブ＝皮膚レイヤーのみ。実モデルに解説を付けるにはメッシュ名→partIdマッピングが必要（未対応）。`scripts/verify-click.mjs`も皮膚以外は当たらない点に注意
2. 透明レイヤーの重なりで描画アーティファクトが出る可能性（depthWriteをopacity>0.95でしか有効にしない簡易方式）。renderOrderで緩和済み
3. バンドルが約1.17MB（three.js本体）。警告が出るが動作には無問題
4. 皮膚プリミティブのプロポーション（腕・脚がカプセル）は実モデルの筋肉・骨格に比べ粗い。皮膚を実モデル化すれば解消
5. Actionsで`actions/deploy-pages@v4`にNode 20非推奨警告（実害なし）
6. 断面のフタ(cap)なし: クリップ面は中空シェルの内壁が見える簡易方式。断面モード中も見えない部位がraycastに当たる（クリック誤選択）。ただし現状クリック対象は皮膚のみなので影響は限定的

## 4. 次セッションでやること（優先順）

1. **皮膚の実モデル化**（Step Bの残り。`docs/3d-model-research.md`参照）:
   - Z-Anatomyに皮膚(integument)モデルがあればDL → `optimize-model.mjs`で変換 → SkinLayerをModelLayerに置換
   - 手順は確立済み（DL→変換→ModelLayer）。皮膚もCC BY-SA想定
   - 注意: 皮膚を実モデル化するとクリック対象が無くなる → 課題#1（実モデルのクリック対応）が顕在化する
2. **実モデルのクリック→InfoPanel対応**（課題#1）: glbのメッシュ名から部位を判定しInfoPanelを表示。parts.tsの実データ化とセットで
3. 細かい改善: 断面位置を動かすスライダー、断面モード中のraycast抑制

## 5. 検証用メモ

- 検証スクリプト: `node scripts/verify-{click,easing,clip}.mjs`（要devサーバー。URLは `http://localhost:5173/body-earth/`）
- 深度別スクショ例: `npx playwright screenshot --viewport-size=1280,800 --wait-for-timeout=6000 "http://localhost:5173/body-earth/?depth=1" out.png`（実モデルのロードに数秒かかるのでtimeoutは6000推奨）
- 断面表示: URLに`&clip=1`を付与（例 `?depth=1&clip=1`）
- previewサーバ: `npm run preview -- --port 4399`
