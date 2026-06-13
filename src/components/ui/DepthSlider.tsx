import { activeLayerLabel } from '../../lib/depth'
import { useBodyStore } from '../../store'

export function DepthSlider() {
  const depth = useBodyStore((s) => s.depth)
  const setDepth = useBodyStore((s) => s.setDepth)
  const clip = useBodyStore((s) => s.clip)
  const toggleClip = useBodyStore((s) => s.toggleClip)

  return (
    <div className="depth-slider">
      <div className="depth-labels">
        <span>皮膚</span>
        <span>筋肉</span>
        <span>骨格</span>
        <span>内臓</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={depth}
        onChange={(e) => setDepth(Number(e.target.value))}
        aria-label="深度スライダー"
      />
      <div className="depth-footer">
        <div className="depth-current">
          現在のレイヤー: {activeLayerLabel(depth)}（深度 {(depth * 100).toFixed(0)}%）
        </div>
        <button
          className={`clip-toggle${clip ? ' on' : ''}`}
          onClick={toggleClip}
          aria-pressed={clip}
        >
          断面 {clip ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  )
}
