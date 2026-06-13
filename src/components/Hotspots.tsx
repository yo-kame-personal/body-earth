import { type LayerId, layerOpacity } from '../lib/depth'
import { useBodyStore } from '../store'
import { Hotspot } from './Hotspot'

// レイヤーがこの不透明度を超えたら、その部位をクリック可能にする
const THRESH = 0.5

/**
 * 各レイヤーの主要部位に置くクリック判定球の集合。
 * 現在見えているレイヤー（depthに連動）の部位だけが表示・クリック可能になる。
 * 座標は人体モデル（足元y≈-1.6/頭頂y≈1.6付近）に合わせた近似配置。
 */
export function Hotspots() {
  const depth = useBodyStore((s) => s.depth)
  const on = (layer: LayerId) => layerOpacity(layer, depth) > THRESH

  const skin = on('skin')
  const muscle = on('muscle')
  const skeleton = on('skeleton')
  const viscera = on('viscera')

  return (
    <group>
      {/* 皮膚 */}
      <Hotspot partId="skin-head" position={[0, 1.5, 0.32]} radius={0.16} active={skin} />
      <Hotspot partId="skin-torso" position={[0, 0.55, 0.42]} radius={0.2} active={skin} />
      <Hotspot partId="skin-arm" position={[0.6, 0.25, 0.12]} radius={0.13} active={skin} />
      <Hotspot partId="skin-leg" position={[0.24, -1.05, 0.16]} radius={0.15} active={skin} />

      {/* 筋肉 */}
      <Hotspot partId="muscle-face" position={[0, 1.5, 0.28]} radius={0.14} active={muscle} />
      <Hotspot partId="muscle-chest" position={[0.18, 0.85, 0.24]} radius={0.13} active={muscle} />
      <Hotspot partId="muscle-abs" position={[0, 0.4, 0.26]} radius={0.13} active={muscle} />
      <Hotspot partId="muscle-torso" position={[0.3, 0.5, 0.16]} radius={0.12} active={muscle} />
      <Hotspot partId="muscle-arm" position={[0.6, 0.25, 0.08]} radius={0.12} active={muscle} />
      <Hotspot partId="muscle-leg" position={[0.24, -1.0, 0.12]} radius={0.14} active={muscle} />

      {/* 骨格 */}
      <Hotspot partId="bone-skull" position={[0, 1.55, 0.1]} radius={0.15} active={skeleton} />
      <Hotspot partId="bone-ribs" position={[0, 0.9, 0.12]} radius={0.16} active={skeleton} />
      <Hotspot partId="bone-spine" position={[0, 0.5, -0.1]} radius={0.1} active={skeleton} />
      <Hotspot partId="bone-pelvis" position={[0, 0.05, 0.06]} radius={0.14} active={skeleton} />
      <Hotspot partId="bone-arm" position={[0.52, 0.3, 0]} radius={0.11} active={skeleton} />
      <Hotspot partId="bone-leg" position={[0.2, -0.7, 0]} radius={0.13} active={skeleton} />

      {/* 内臓 */}
      <Hotspot partId="organ-lung" position={[0.16, 0.82, 0.05]} radius={0.13} active={viscera} />
      <Hotspot partId="organ-heart" position={[0.02, 0.85, 0.1]} radius={0.1} active={viscera} />
      <Hotspot partId="organ-liver" position={[-0.14, 0.55, 0.12]} radius={0.12} active={viscera} />
      <Hotspot partId="organ-stomach" position={[0.14, 0.5, 0.12]} radius={0.1} active={viscera} />
      <Hotspot partId="organ-gut" position={[0, 0.15, 0.14]} radius={0.16} active={viscera} />
    </group>
  )
}
