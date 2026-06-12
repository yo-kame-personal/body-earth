# 3Dモデル置き換え調査メモ（プロシージャル → 実モデル）

> 調査日: 2026-06-13（セッション3）
> 目的: 現在のプリミティブモックを、フリーの実人体3Dモデルへ置き換える際の選択肢と方針を整理する。

## 背景・前提

- BODY EARTHは静的サイト（GitHub Pages配信）。現状バンドルは約1.1MB（three.js本体）。
- **配信サイズが最大の制約**。数百MB級の解剖データをそのまま載せるのは非現実的。
- コアコンセプト「深度(depth 0〜1)で皮膚→筋肉→骨格・内臓をクロスフェード」を維持できることが必須。
  → モデルは最低限 **3レイヤー（皮膚 / 筋肉 / 骨格・内臓）に分割**できる形である必要がある。

## 候補の比較

### 1. BodyParts3D（大元のデータセット）
- 提供: DBCLS（東大）/ Anatomography。https://lifesciencedb.jp/bp3d
- ライセンス: **CC BY-SA 2.1 Japan**（表示＋継承）
- 形式: **OBJ**。パーツ数 **1,523**。サイズ **127MB（低ポリ）/ 521MB（高品質）**
- 評価: 解剖学的に正確で網羅的だが、**粒度が細かすぎ・容量が大きすぎ**。1500超のパーツを手作業で3レイヤーへグルーピングするコストが高い。Webにそのままは不可。

### 2. Z-Anatomy（BodyParts3D由来の整備版）★本命
- 提供: Lluís Vinent / Gauthier Kervyn。https://github.com/Z-Anatomy 、www.z-anatomy.com
- ライセンス: **CC BY-SA 4.0**（表示＋継承）
- 形式: 主に **.blend**（Blenderプロジェクト）。Unity版プロジェクトもあり。
  - GitHub: `Models-of-human-anatomy`（男性モデル）, `Blender-addons`, `Unity-app_Z-Anatomy`
  - **Sketchfabに209個の個別ダウンロード可能モデル**あり（心臓・肺・肝臓・胸郭・骨など、構造ごと）
- 評価: BodyParts3Dを**レイヤー構造（皮膚/筋肉/血管/神経/骨格）に整理済み**で、本プロジェクトのdepth概念と相性が良い。**ただしWeb形式(glTF)の既製配布は無く、自前でエクスポートが必要**。

### 3. その他
- ZygoteBody（旧Google Body）: ビューア。データ自体は商用ライセンスで再配布不可。**不採用**。
- Sketchfab上の単発CC0モデル: 品質・分割がバラバラ。レイヤー統一が困難。**補助的**。

## ライセンス上の注意（重要）
- BodyParts3D / Z-Anatomy いずれも **CC BY-SA（継承）**。
  - **表示義務**: クレジット表記が必須（アプリ内のクレジット欄＋リポジトリのNOTICE）。
  - **継承義務**: モデルの改変物（デシメート・再エクスポート版）は**同じCC BY-SAで配布**する必要がある。
    → モデルファイルにはライセンス文を同梱。**ソースコード(MIT等)とモデル(CC BY-SA)はライセンスを分けて管理**するのが安全。

## 推奨方針

**Z-Anatomyを源泉に、Blenderで「3レイヤーの軽量glb」を自作する**のが本命。手順案:

1. Z-Anatomyの.blendを入手し、Blenderで開く
2. 既存レイヤーから代表構造だけ残す（例: 皮膚シェル / 主要筋肉数個 / 骨格＋主要臓器）。**Decimateで大幅にポリ削減**
3. 3つのコレクションにまとめ、**Draco圧縮glbで3ファイル（skin.glb / muscle.glb / core.glb）** にエクスポート。各数百KB〜2MB目標、合計5MB以内を上限目安
4. three.js側: `GLTFLoader + DRACOLoader`（デコーダは1インスタンス再利用）。Suspense+進捗表示でlazy load
5. 既存の`depth`→`layerOpacity`カーブはそのまま流用し、プリミティブの代わりにロードしたglbシーンにopacity/clipを適用
6. クレジット表記とモデル用LICENSEを追加

### 段階的フォールバック
- **Step A（小さく試す）**: まず**骨格レイヤーだけ**を実モデルに差し替え（Sketchfabの骨格モデル1個をglbで）。depth=1の見栄えが一番効くため費用対効果が高い。皮膚・筋肉はプリミティブのまま当面維持。
- **Step B**: 筋肉・皮膚も順次置き換え。

## Sketchfab直DL調査結果（2026-06-13 追記）

「Blenderを使わずSketchfabからglbを直接落とせるか」を確認した結論:

- **glb直DLは可能。Blenderでの形式変換は不要。** Z-AnatomyはSketchfabに系統別モデルを公開しており（無料）、Sketchfabの「Download 3D Model」から **glTF/glb形式で取得できる**（ただしダウンロードには**無料のSketchfabアカウントでのログインが必要**）。
- **系統別モデル名（Terminologia Anatomica準拠）**:
  - Osteology=骨学（骨格）, Arthrology=関節学, Myology=筋学（筋肉）,
    Angiology=脈管学（血管）, Splanchnology=内臓学（臓器）, Neurology=神経学
- **ライセンスはモデルごとに異なる**ので都度確認が必要:
  - Arthrology → **CC BY 4.0**（表示のみ・継承不要）
  - Myology / Splanchnology → **CC BY-SA 4.0**（表示＋継承）
- **最大の問題はポリゴン数。超高精細でWebには重すぎる**:
  - Arthrology: **約180万三角形** / Splanchnology: **約200万三角形**
  - Web向きは数万〜30万三角形程度。**そのままでは確実に固まる → 軽量化(simplify)が必須**

### つまり「Blender変換」は不要だが「軽量化」は必須
ただし軽量化は**Blenderを使わずコマンドラインで自動化できる**。これが今回の最大の収穫:
- `gltf-transform`（npm。Don McCurdy作）で `weld` → `simplify`(meshoptimizer) → `draco`圧縮 を一括実行
- 例: `npx @gltf-transform/cli optimize in.glb out.glb --simplify-error 0.01 --compress draco`
- → **私(Claude)がスクリプト化して実行可能**。あなたの手作業はSketchfabからのDLのみ。

### 改訂版・最短ルート（Step A: 骨格PoC、Blender不要）
1. **あなた**: 無料Sketchfabアカウントを作成 → Osteology（骨格）モデルを **glbでダウンロード** → リポジトリの `assets-src/` に置く（手作業はこれだけ・5分）
2. **私**: `gltf-transform` で simplify＋Draco圧縮し、数百KB〜2MB級の `public/models/skeleton.glb` を生成
3. **私**: `<ModelLayer src=...>`（GLTFLoader+DRACOLoader）を実装し、depth=1の骨格プリミティブを実モデルに差し替え
4. **私**: クレジット表記とモデル用LICENSEを追加（CC BYまたはBY-SAに従う）

→ 良ければStep Aで見栄えを確認してから、筋肉・臓器・皮膚へ展開（Step B）。

## このリポジトリでの次アクション
- **Blender作業が前提**（コードだけでは完結しない）。Blenderの用意とエクスポート可否がボトルネック。
- コード側で先に準備できること（次セッション候補）:
  - `GLTFLoader/DRACOLoader`を組み込んだ`<ModelLayer src=...>`コンポーネントの試作（ダミーglbで動作確認）
  - `public/models/`配置とViteのasset取り扱い確認、`base`との整合
- 入手・変換が重いので、**まずStep A（骨格1モデル）でPoCしてから全身展開**を推奨。

## 参考リンク
- Z-Anatomy GitHub: https://github.com/Z-Anatomy
- Z-Anatomy (itch.io): https://lluisv.itch.io/z-anatomy
- Z-Anatomy Sketchfabコレクション(209モデル): https://sketchfab.com/Z-Anatomy/collections/human-anatomy-77a92b71541f4a6ab4a384ec3cf70415
- BodyParts3D (Kevin Moermanミラー): https://github.com/Kevin-Mattheus-Moerman/BodyParts3D
- three.js GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html
- three.js DRACOLoader: https://threejs.org/docs/pages/DRACOLoader.html
