# CONTEXT.md — BODY EARTH 開発引き継ぎ

> 人体版 Google Earth（Webベース3Dインタラクティブアプリ）のMVP。
> 最終更新: 2026-06-13（セッション3: Pages公開＋Fresnel＋断面＋骨格を実モデル化(Step A)＋モデルのFresnel/断面対応まで完了）

## 1. 現在のステータス

**MVP完成・全主要動作を検証済み・GitHub Pages公開済み。**

- **公開URL: https://yo-kame-personal.github.io/body-earth/**
- リポジトリ: https://github.com/yo-kame-personal/body-earth （mainへのpushで自動デプロイ）
- `npm run build` 成功（TypeScriptエラーなし）
- 検証済みの動作（headless Playwright + スクショ目視。公開URLでも確認済み）:
  - depth=0 / 0.5 / 1 のレイヤー表示とクロスフェード ✓
  - depth=1: MIN_DISTANCE=3.4 で骨格・内臓が頭蓋骨込みで収まる構図 ✓
  - クリック→InfoPanel表示（皮膚・心臓）、×ボタンで閉じる ✓
  - スライダー→カメラ距離のイージング（中間値を経由して収束） ✓
  - ホイールズーム→depth同期の回帰なし ✓
  - レイヤー遷移中のFresnel縁発光（depth=0.3/0.65で発光、0/1で消灯） ✓
  - 断面表示モード（「断面」トグル / `?clip=1`。回り込むと断面、OFFで通常描画に復帰） ✓
  - **骨格レイヤーは実3Dモデル**（Z-Anatomy「関節学」glb）に差し替え済み。depth=0/0.65/1で検証＋公開URLでも確認 ✓
  - 骨格モデルもFresnel縁発光・断面clipに反応（BodyPartと挙動統一済み） ✓
- ローカル起動方法: `cd ~/Desktop/dev/body-earth && npm run dev`

## 2. 技術スタックとアーキテクチャ

- **React 19 + Vite + TypeScript + @react-three/fiber (Three.js) + @react-three/drei + zustand**
- アセットは**ハイブリッド**: 骨格は実glbモデル（Z-Anatomy）、筋肉・皮膚・内臓は**プリミティブ（capsule/sphere/cylinder/torus）によるプロシージャルなモック**

### コアコンセプト: 「深度(depth)」による統一制御

```
depth: 0.0 ───────── 0.4 ───────── 0.8 ───── 1.0
        皮膚          筋肉          骨格・内臓
```

- `src/store.ts` — zustandストア。`depth`(0〜1)と`selectedId`だけが全状態。URLの`?depth=0.7`で初期深度指定可（デバッグ用）
- `src/lib/depth.ts` — **最重要ファイル**。カメラ距離↔深度の変換と、レイヤーごとの不透明度カーブ（台形関数`trapezoid`）。`CURVES`定数を調整すれば遷移タイミングを変えられる。MIN_DISTANCE=3.4 / MAX_DISTANCE=7
- `src/components/CameraRig.tsx` — 双方向同期＋イージング。スライダー由来のdepth変化は`MathUtils.damp`（λ=6）で目標距離へ滑らかに移動、ユーザーがホイール/ドラッグを始めたら`start`イベントで即中断。ホイールは`enableDamping`(0.08)の慣性。カメラ操作由来かスライダー由来かはepsilon(0.02)で判別
- `src/lib/layerMaterial.ts` — **レイヤー共通のマテリアル処理**（BodyPartとModelLayerで共有）。`makeRimInjector`(Fresnel縁発光のGLSL注入)/`rimStrength`(強度`4*o*(1-o)*1.4`、半透明時のみ)/`CLIP_PLANES`(断面平面 z=0)。注入コードが同一なのでGPUプログラムは共有、uniform `uRim`だけ独立（three r184で確認済み）
- `src/components/BodyPart.tsx` — プリミティブ用メッシュラッパー。不透明度0.35未満の層はクリックを奥の層へ通す（`stopPropagation`しない）のがミソ。マテリアル処理はlayerMaterialから利用
- 断面表示 — `store.clip` + DepthSliderの「断面」トグル。`Canvas gl={{localClippingEnabled:true}}`が前提。`CLIP_PLANES`(前半分カット)を適用、断面中はDoubleSide＋裏面を`diffuse*0.45`で底上げ（注入の`gl_FrontFacing`分岐）。BodyPartはマテリアルの`key`で作り直し、ModelLayerは`needsUpdate`で対応
- `src/components/layers/` — SkinLayer / MuscleLayer / CoreLayer。renderOrderは内側0→外側2で透明描画の破綻を抑制
- 実モデル — `ModelLayer.tsx`がglbをdepth連動opacityで読む（`useGLTF(url,true)`でDraco対応、Suspense内で使用）。**CoreLayerの骨格はModelLayerに置換済み**（`/models/skeleton.glb`をscale1.95/y-1.62で配置）、内臓は当面プリミティブ。Sceneにレイヤー用Suspense境界あり
- モデル変換 — Sketchfab等のglbを `assets-src/` に置き、`node scripts/optimize-model.mjs <in.glb> <name> --ratio 0.15` で simplify＋Draco＋specGloss変換し `public/models/<name>.glb` を生成。`assets-src/`は生ファイルをgitignore。クレジットは`public/models/CREDITS.md`とHUD
- `src/data/parts.ts` — 部位ID→ダミー解説データ（21部位）。InfoPanelが参照
- `scripts/verify-{click,easing,clip}.mjs` — headless検証スクリプト（devサーバー起動が前提）

## 3. 既知の課題・未解決事項

1. 透明レイヤーの重なりで描画アーティファクトが出る可能性（depthWriteをopacity>0.95でしか有効にしない簡易方式のため）
2. バンドルが約1.1MB（three.js本体）。警告が出るが動作には無問題
3. 足元(feet)とtorso下端の接続など、プロポーションの粗さ多数（モックなので許容）
4. depth=1で頭蓋骨の最上部がわずかに見切れる（許容範囲と判断。気になるならMIN_DISTANCE微増 or カメラtargetのy調整）
5. Actionsで`actions/deploy-pages@v4`にNode 20非推奨警告（v4が最新。GitHub側の更新待ちで実害なし。checkout/setup-nodeはv5に更新済み）
6. 断面のフタ（cap）なし: クリップ面は中空シェルの内壁が見える簡易方式（capはstencil描画が必要で未対応）。クリップで消えた部分もraycastには当たるため、断面モード中は見えない部位をクリック選択できてしまう

## 4. 次セッションでやること（優先順）

（スマホ実機の操作感はユーザーが確認済み 2026-06-13）

1. 実モデル化の続き（**Step A=骨格は完了。ModelLayerのFresnel/clip対応も完了**。`docs/3d-model-research.md`参照）:
   - depth=1で内臓（プリミティブ）が実骨格に対しやや大きい/雑 → 内臓のサイズ微調整 or 実モデル化（Step B: 内臓学glb。CC BY-SA注意）
   - Step B: 筋肉・皮膚も実モデル化（筋学/Myologyは CC BY-SA）。手順は確立済み（DL→optimize-model.mjs→ModelLayer）
2. 細かい改善候補: 断面位置を動かすスライダー、断面モード中のraycast抑制、部位データの充実（ダミー→実データ）

## 5. 検証用メモ

- 検証スクリプト: `node scripts/verify-{click,easing,clip}.mjs`（要devサーバー。base設定によりURLは `http://localhost:5173/body-earth/`）
- 深度別スクショ例: `npx playwright screenshot --viewport-size=1280,800 --wait-for-timeout=4000 "http://localhost:5173/?depth=1" out.png`
- previewサーバ: `npm run preview -- --port 4399`
