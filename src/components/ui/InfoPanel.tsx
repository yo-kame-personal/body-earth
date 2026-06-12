import { PARTS } from '../../data/parts'
import { useBodyStore } from '../../store'

export function InfoPanel() {
  const selectedId = useBodyStore((s) => s.selectedId)
  const select = useBodyStore((s) => s.select)

  if (!selectedId) return null
  const part = PARTS[selectedId]
  if (!part) return null

  return (
    <aside className="info-panel">
      <button className="close" onClick={() => select(null)} aria-label="閉じる">
        ×
      </button>
      <span className={`layer-chip layer-${part.layer}`}>{part.layerLabel}</span>
      <h2>{part.name}</h2>
      <p>{part.summary}</p>
      <p className="fact">💡 {part.fact}</p>
      <p className="note">※ MVP用のダミーデータです</p>
    </aside>
  )
}
