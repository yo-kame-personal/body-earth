import type { ThreeEvent } from '@react-three/fiber'
import { useState } from 'react'
import { useBodyStore } from '../store'

interface HotspotProps {
  partId: string
  position: [number, number, number]
  radius?: number
  /** そのレイヤーが今見えている深度か。falseなら非表示・クリック不可 */
  active: boolean
}

/**
 * 部位クリック用の判定球。実モデル(glb)はメッシュ名が連番で部位判定に使えないため、
 * 主要部位の位置にこの球を置き、クリック→InfoPanel表示のトリガーにする。
 * 常時うっすら青く光って「クリックできる」ことを示し、hover/選択で明るくなる。
 * renderOrder+depthTest:false で常に手前に出し、奥の部位でも掴めるようにする。
 */
export function Hotspot({ partId, position, radius = 0.15, active }: HotspotProps) {
  const select = useBodyStore((s) => s.select)
  const selected = useBodyStore((s) => s.selectedId === partId)
  const [hovered, setHovered] = useState(false)
  if (!active) return null

  return (
    <mesh
      position={position}
      renderOrder={10}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        select(partId)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial
        color="#6fd9ff"
        transparent
        opacity={hovered || selected ? 0.5 : 0.16}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}
