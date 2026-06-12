# assets-src — モデル素材の置き場（変換前）

Sketchfabからダウンロードした生の `.glb` / `.gltf` をここに置く。
ここのファイルは**ビルドには含めない**（gitignore対象）。
`scripts/optimize-model.mjs` で軽量化・圧縮し、`public/models/` に出力する。

## Step A: 骨格
- Z-Anatomy「関節学(Arthrology)」 https://sketchfab.com/Z-Anatomy
- ライセンス: CC BY 4.0（要クレジット）
- ここに `arthrology.glb`（DLしたファイル名のままでOK）を置く
