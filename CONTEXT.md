# CONTEXT.md — BODY EARTH 開発引き継ぎ

> 人体版 Google Earth（Webベース3Dインタラクティブアプリ）のMVP。
> 最終更新: 2026-06-12（セッション1終了時）

## 1. 現在のステータス

**MVP基盤は完成・動作確認済み。**

- `npm run build` 成功（TypeScriptエラーなし）
- Playwright headlessスクリーンショットで以下を目視確認済み:
  - depth=0: 皮膚レイヤー（肌色の人型）が表示 ✓
  - depth=0.5: 筋肉レイヤー（大胸筋・腹直筋つき）にクロスフェード ✓
  - depth=1: 骨格・内臓レイヤー表示 ✓（ただし下記の課題1参照）
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
- `src/lib/depth.ts` — **最重要ファイル**。カメラ距離↔深度の変換と、レイヤーごとの不透明度カーブ（台形関数`trapezoid`）。`CURVES`定数を調整すれば遷移タイミングを変えられる
- `src/components/CameraRig.tsx` — ホイールズーム（OrbitControls）→depth、スライダー→カメラ距離の**双方向同期**。無限ループはepsilon(0.01)ガードで防止
- `src/components/BodyPart.tsx` — 全パーツ共通のメッシュラッパー。不透明度0.35未満の層はクリックを奥の層へ通す（`stopPropagation`しない）のがミソ
- `src/components/layers/` — SkinLayer / MuscleLayer / CoreLayer。renderOrderは内側0→外側2で透明描画の破綻を抑制
- `src/data/parts.ts` — 部位ID→ダミー解説データ（21部位）。InfoPanelが参照

## 3. 既知の課題・未解決事項

1. **depth=1でカメラが寄りすぎる問題への対処が未検証**: スクショで判明し`MIN_DISTANCE`を1.4→2.2に変更・ビルドは通したが、**変更後のスクリーンショット確認をしていない**。まずここの目視確認から
2. **クリック→InfoPanel表示が実機未検証**: ロジックは実装済みだがheadlessでのクリックテスト未実施
3. 透明レイヤーの重なりで描画アーティファクトが出る可能性（depthWriteをopacity>0.95でしか有効にしない簡易方式のため）
4. バンドルが約1.1MB（three.js本体）。警告が出るが動作には無問題
5. **git未初期化・未コミット**
6. 足元(feet)とtorso下端の接続など、プロポーションの粗さ多数（モックなので許容）

## 4. 次セッションで真っ先にやること（優先順）

1. `npm run dev` → ブラウザで depth=1 のカメラ距離を目視確認（必要なら`MIN_DISTANCE`再調整）
2. クリック→InfoPanelの動作確認（Playwrightは devDependencies 導入済み。`npx playwright screenshot --viewport-size=1280,800 "http://localhost:5173/?depth=1" out.png` が使える）
3. `git init` + 初回コミット（push時はnoreplyメール設定を忘れずに — 他プロジェクトと同様）
4. 体験の質向上（どれか一つ）:
   - レイヤー遷移にFresnel風の縁発光シェーダー（ホログラム感）
   - `clippingPlanes`による断面表示モード
   - ズーム時のイージング（lerpでカメラ距離を滑らかに）
5. 中期: フリーのglTF人体モデル（例: Z-Anatomy、BodyParts3D）への置き換え調査
6. 公開: GitHub Pages（`vite.config.ts`に`base: '/body-earth/'`追加が必要）

## 5. 検証用メモ

- 深度別スクショ: `/tmp/be-d0.png`, `/tmp/be-d05.png`, `/tmp/be-d1.png`（d1は`MIN_DISTANCE`変更前のもの）
- previewサーバ: `npm run preview -- --port 4399`
