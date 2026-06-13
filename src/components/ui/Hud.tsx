export function Hud() {
  return (
    <header className="hud">
      <h1>
        BODY EARTH<span>人体版 Google Earth（MVP）</span>
      </h1>
      <p>ホイール / ピンチで潜る ・ ドラッグで回転 ・ 部位クリックで情報</p>
      {/* モデルのクレジット表記（CC BY / CC BY-SA いずれも表示が必須） */}
      <p className="credit">
        3Dモデル:{' '}
        <a href="https://sketchfab.com/Z-Anatomy" target="_blank" rel="noreferrer">
          Z-Anatomy
        </a>{' '}
        —{' '}
        <a href="https://sketchfab.com/3d-models/arthrology-a890d801336047d683d56d8bc676e894" target="_blank" rel="noreferrer">
          “Arthrology”
        </a>{' '}
        (
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
          CC BY 4.0
        </a>
        ) / “Myology” · “Splanchnology” (
        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
          CC BY-SA 4.0
        </a>
        )
      </p>
    </header>
  )
}
