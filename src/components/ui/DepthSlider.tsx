import { useState } from 'react'
import { activeLayerLabel, layerOpacity } from '../../lib/depth'
import { useBodyStore } from '../../store'
import { DressUpPanel } from './DressUpPanel'

export function DepthSlider() {
  const depth = useBodyStore((s) => s.depth)
  const setDepth = useBodyStore((s) => s.setDepth)
  const clip = useBodyStore((s) => s.clip)
  const toggleClip = useBodyStore((s) => s.toggleClip)
  const clipPos = useBodyStore((s) => s.clipPos)
  const setClipPos = useBodyStore((s) => s.setClipPos)

  // きせかえは皮膚が見える深度のときだけ操作可能
  const skinVisible = layerOpacity('skin', depth) >= 0.3
  const [dressOpen, setDressOpen] = useState(false)
  const showDress = skinVisible && dressOpen

  return (
    <div className="depth-slider">
      {showDress && <DressUpPanel />}
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
        {skinVisible && (
          <button
            className={`clip-toggle${dressOpen ? ' on' : ''}`}
            onClick={() => setDressOpen((v) => !v)}
            aria-pressed={dressOpen}
          >
            きせかえ
          </button>
        )}
        <button
          className={`clip-toggle${clip ? ' on' : ''}`}
          onClick={toggleClip}
          aria-pressed={clip}
        >
          断面 {clip ? 'ON' : 'OFF'}
        </button>
      </div>
      {clip && (
        <div className="clip-slider">
          <div className="clip-slider-labels">
            <span>手前</span>
            <span>断面の位置</span>
            <span>奥</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={clipPos}
            onChange={(e) => setClipPos(Number(e.target.value))}
            aria-label="断面の位置スライダー"
          />
        </div>
      )}
    </div>
  )
}
