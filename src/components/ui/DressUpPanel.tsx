import { BOTTOMS, FACES, TOPS } from '../../data/dressup'
import { SKINS } from '../../data/skins'
import { useBodyStore } from '../../store'

// きせかえパネル: 顔 / トップス / ボトムス / 肌 の4スロットを部位別に選ぶ。
// 深度スライダーのパネル内に展開される（レイアウト重なりを避けるため）。
export function DressUpPanel() {
  const { faceId, topId, bottomId, skinId, setFace, setTop, setBottom, setSkin } = useBodyStore()

  return (
    <div className="dress-panel">
      {/* 顔（絵文字ボタン） */}
      <div className="dress-slot">
        <span className="dress-slot-label">顔</span>
        <div className="dress-items">
          {FACES.map((f) => (
            <button
              key={f.id}
              className={`dress-chip emoji${f.id === faceId ? ' on' : ''}`}
              onClick={() => setFace(f.id)}
              aria-pressed={f.id === faceId}
              title={f.label}
            >
              {f.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* トップス */}
      <div className="dress-slot">
        <span className="dress-slot-label">トップス</span>
        <div className="dress-items">
          {TOPS.map((t) => (
            <button
              key={t.id}
              className={`dress-chip${t.id === topId ? ' on' : ''}`}
              style={t.color ? { background: t.color, color: '#1a1f2b' } : undefined}
              onClick={() => setTop(t.id)}
              aria-pressed={t.id === topId}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ボトムス */}
      <div className="dress-slot">
        <span className="dress-slot-label">ボトムス</span>
        <div className="dress-items">
          {BOTTOMS.map((b) => (
            <button
              key={b.id}
              className={`dress-chip${b.id === bottomId ? ' on' : ''}`}
              style={b.color ? { background: b.color, color: '#1a1f2b' } : undefined}
              onClick={() => setBottom(b.id)}
              aria-pressed={b.id === bottomId}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* 肌（色見本） */}
      <div className="dress-slot">
        <span className="dress-slot-label">肌</span>
        <div className="dress-items">
          {SKINS.map((s) => (
            <button
              key={s.id}
              className={`skin-swatch${s.id === skinId ? ' on' : ''}`}
              style={{ background: s.swatch }}
              onClick={() => setSkin(s.id)}
              aria-pressed={s.id === skinId}
              aria-label={s.label}
              title={s.label}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
