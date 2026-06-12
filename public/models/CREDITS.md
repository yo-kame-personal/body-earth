# 3Dモデルのクレジットとライセンス

## skeleton.glb（骨格レイヤー）

- 原題: **"Arthrology"** by **Z-Anatomy**
- 出典: https://sketchfab.com/3d-models/arthrology-a890d801336047d683d56d8bc676e894
- ライセンス: **CC BY 4.0**（https://creativecommons.org/licenses/by/4.0/ ）
- 改変: 本プロジェクトでは `gltf-transform` による simplify（頂点約114万→約40万）＋Draco圧縮＋
  specGloss→metalRough変換を施している（`scripts/optimize-model.mjs`）。元データはBodyParts3D由来。

CC BY 4.0は**表示（クレジット）**を条件に商用含め自由に利用・改変・再配布できる。
継承(ShareAlike)義務はない。クレジットはアプリ画面（HUD）にも表示している。
