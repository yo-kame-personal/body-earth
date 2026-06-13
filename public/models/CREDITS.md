# 3Dモデルのクレジットとライセンス

すべて **Z-Anatomy**（BodyParts3D由来の解剖モデル）を利用している。
Sketchfab: https://sketchfab.com/Z-Anatomy

いずれも `scripts/optimize-model.mjs` で次の加工を施している:
**metal/rough変換**（specGloss→metalRough）＋ **simplify**（meshoptimizer）＋ **Draco圧縮** ＋ **WebPテクスチャ圧縮**。

## skeleton.glb（骨格レイヤー）

- 原題: **"Arthrology"** by **Z-Anatomy**
- 出典: https://sketchfab.com/3d-models/arthrology-a890d801336047d683d56d8bc676e894
- ライセンス: **CC BY 4.0**（https://creativecommons.org/licenses/by/4.0/ ）
- CC BY 4.0は**表示（クレジット）**を条件に商用含め自由に利用・改変・再配布できる。継承(ShareAlike)義務はない。

## viscera.glb（内臓レイヤー）

- 原題: **"Splanchnology"（内臓学）** by **Z-Anatomy**
- 出典: https://sketchfab.com/Z-Anatomy （Splanchnology モデル）
- ライセンス: **CC BY-SA 4.0**（https://creativecommons.org/licenses/by-sa/4.0/ ）

## muscle.glb（筋肉レイヤー）

- 原題: **"Myology"（筋学）** by **Z-Anatomy**
- 出典: https://sketchfab.com/Z-Anatomy （Myology モデル）
- ライセンス: **CC BY-SA 4.0**（https://creativecommons.org/licenses/by-sa/4.0/ ）

## CC BY-SA 4.0（継承）の注意

viscera / muscle は **ShareAlike（継承）** ライセンス。これらの改変版（本リポジトリの軽量glb）を
再配布する場合は **同じ CC BY-SA 4.0** で提供する必要がある。
そのため **モデル(CC BY / CC BY-SA)とソースコード(MIT等)はライセンスを分けて管理** している。
クレジットはアプリ画面（HUD）にも常時表示している。
