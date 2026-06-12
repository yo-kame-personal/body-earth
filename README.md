# BODY EARTH — 人体版 Google Earth (MVP)

ズームすると 皮膚 → 筋肉 → 骨格・内臓 へと潜っていく、Webベースの3Dインタラクティブアプリ。

## 起動

```bash
npm install
npm run dev
```

## 操作

- **ホイール / ピンチ**: 体内へ潜る（深度が変化しレイヤーがクロスフェード）
- **ドラッグ**: 回転
- **部位クリック**: 解説パネル表示
- **下部スライダー**: 深度を直接指定
- URLパラメータ `?depth=0.7` で初期深度を指定可能（デバッグ用）

## スタック

React 19 / Vite / TypeScript / @react-three/fiber / @react-three/drei / zustand

開発引き継ぎ情報は [CONTEXT.md](./CONTEXT.md) を参照。
