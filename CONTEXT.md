# CONTEXT.md — BODY EARTH 開発引き継ぎ

> 人体版 Google Earth（Webベース3Dインタラクティブアプリ）のMVP。
> 最終更新: 2026-06-13（セッション2終了時）

## 1. 現在のステータス

**MVP完成・全主要動作を検証済み・git管理開始。**

- `npm run build` 成功（TypeScriptエラーなし）
- 検証済みの動作（headless Playwright + スクショ目視）:
  - depth=0 / 0.5 / 1 のレイヤー表示とクロスフェード ✓
  - depth=1: MIN_DISTANCE=3.4 で骨格・内臓が頭蓋骨込みで収まる構図 ✓
  - クリック→InfoPanel表示（皮膚・心臓）、×ボタンで閉じる ✓
  - スライダー→カメラ距離のイージング（中間値を経由して収束） ✓
  - ホイールズーム→depth同期の回帰なし ✓
- git初期化済み・mainブランチ2コミット（user.emailはnoreplyに設定済み）
- 起動方法: `cd ~/Desktop/dev/body-earth && npm run dev`

## 2. 技術スタックとアーキテクチャ

- **React 19 + Vite + TypeScript + @react-three/fiber (Three.js) + @react-three/drei + zustand**
- アセットは外部3Dモデル不使用。**全てプリミティブ（capsule/sphere/cylinder/torus）によるプロシージャルなモック**

### コアコンセプト: 「深度(depth)」による統一制御

```
depth: 0.0 ───────── 0.4 ───────── 0.8 ───── 1.0
        皮膚          筋肉          骨格・内臓
```

- `src/store.ts` — zustandストア。`depth`(0〜1)と`selectedId`だけが全状態。URLの`?depth=0.7`で初期深度指定可（デバッグ用）
- `src/lib/depth.ts` — **最重要ファイル**。カメラ距離↔深度の変換と、レイヤーごとの不透明度カーブ（台形関数`trapezoid`）。`CURVES`定数を調整すれば遷移タイミングを変えられる。MIN_DISTANCE=3.4 / MAX_DISTANCE=7
- `src/components/CameraRig.tsx` — 双方向同期＋イージング。スライダー由来のdepth変化は`MathUtils.damp`（λ=6）で目標距離へ滑らかに移動、ユーザーがホイール/ドラッグを始めたら`start`イベントで即中断。ホイールは`enableDamping`(0.08)の慣性。カメラ操作由来かスライダー由来かはepsilon(0.02)で判別
- `src/components/BodyPart.tsx` — 全パーツ共通のメッシュラッパー。不透明度0.35未満の層はクリックを奥の層へ通す（`stopPropagation`しない）のがミソ
- `src/components/layers/` — SkinLayer / MuscleLayer / CoreLayer。renderOrderは内側0→外側2で透明描画の破綻を抑制
- `src/data/parts.ts` — 部位ID→ダミー解説データ（21部位）。InfoPanelが参照
- `scripts/verify-click.mjs` / `scripts/verify-easing.mjs` — headless検証スクリプト（devサーバー起動が前提）

## 3. 既知の課題・未解決事項

1. 透明レイヤーの重なりで描画アーティファクトが出る可能性（depthWriteをopacity>0.95でしか有効にしない簡易方式のため）
2. バンドルが約1.1MB（three.js本体）。警告が出るが動作には無問題
3. 足元(feet)とtorso下端の接続など、プロポーションの粗さ多数（モックなので許容）
4. depth=1で頭蓋骨の最上部がわずかに見切れる（許容範囲と判断。気になるならMIN_DISTANCE微増 or カメラtargetのy調整）

## 4. 次セッションでやること（優先順）

1. 公開: GitHub Pages
   - `vite.config.ts`に`base: '/body-earth/'`追加
   - GitHubリポジトリ作成→push（user.emailはnoreply設定済み）
   - 他プロジェクト（park-games等）と同じ公開手順が使える
2. 体験の質向上（残りの候補）:
   - レイヤー遷移にFresnel風の縁発光シェーダー（ホログラム感）
   - `clippingPlanes`による断面表示モード
3. 中期: フリーのglTF人体モデル（例: Z-Anatomy、BodyParts3D）への置き換え調査

## 5. 検証用メモ

- 検証スクリプト: `node scripts/verify-click.mjs` / `node scripts/verify-easing.mjs`（要devサーバー）
- 深度別スクショ例: `npx playwright screenshot --viewport-size=1280,800 --wait-for-timeout=4000 "http://localhost:5173/?depth=1" out.png`
- previewサーバ: `npm run preview -- --port 4399`
