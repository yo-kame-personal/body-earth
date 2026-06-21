import { type ReactNode } from 'react'
import { DoubleSide, FrontSide } from 'three'
import { CLIP_PLANES } from '../lib/layerMaterial'
import { useBodyStore } from '../store'

// きせかえの装飾（顔パーツ・服）用の、クリック判定を持たないメッシュ。
// 皮膚レイヤーと同じ opacity でフェードし、断面(clip)にも追従する。
interface DecorPartProps {
  color: string
  opacity: number
  children: ReactNode
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
  roughness?: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
  renderOrder?: number
}

export function DecorPart({
  color,
  opacity,
  children,
  position,
  rotation,
  scale,
  roughness = 0.6,
  metalness = 0,
  emissive = '#000000',
  emissiveIntensity = 0,
  renderOrder = 5,
}: DecorPartProps) {
  const clip = useBodyStore((s) => s.clip)
  if (opacity <= 0.02) return null

  return (
    <mesh position={position} rotation={rotation} scale={scale} renderOrder={renderOrder}>
      {children}
      <meshStandardMaterial
        key={clip ? 'clip' : 'plain'}
        color={color}
        roughness={roughness}
        metalness={metalness}
        transparent
        opacity={opacity}
        side={clip ? DoubleSide : FrontSide}
        clippingPlanes={clip ? CLIP_PLANES : null}
        depthWrite={opacity > 0.95}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  )
}
