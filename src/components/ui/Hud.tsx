export function Hud() {
  return (
    <header className="hud">
      <h1>
        BODY EARTH<span>人体版 Google Earth（MVP）</span>
      </h1>
      <p>ホイール / ピンチで潜る ・ ドラッグで回転 ・ 部位クリックで情報</p>
      {/* CC BY 4.0: 骨格モデルのクレジット表記（ライセンス上必須） */}
      <p className="credit">
        骨格モデル:{' '}
        <a href="https://sketchfab.com/3d-models/arthrology-a890d801336047d683d56d8bc676e894" target="_blank" rel="noreferrer">
          “Arthrology”
        </a>{' '}
        by{' '}
        <a href="https://sketchfab.com/Z-Anatomy" target="_blank" rel="noreferrer">
          Z-Anatomy
        </a>{' '}
        (
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
          CC BY 4.0
        </a>
        )
      </p>
    </header>
  )
}
