import { layerOpacity } from '../../lib/depth'
import { useBodyStore } from '../../store'
import { BodyPart } from '../BodyPart'
import { ModelLayer } from './ModelLayer'

const ORDER = 0

export function CoreLayer() {
  const opacity = useBodyStore((s) => layerOpacity('core', s.depth))

  return (
    <group>
      {/* ---- 骨格: Z-Anatomy「関節学」glb（プロシージャル骨から差し替え） ----
          モデルは足元y≈0/頭頂y≈1.7。アプリ空間に合わせscale≈1.95・y≈-1.62で配置 */}
      <ModelLayer src="/models/skeleton.glb" layer="core" position={[0, -1.62, 0]} scale={1.95} />

      {/* ---- 内臓（当面プリミティブのまま） ---- */}
      <BodyPart partId="organ-heart" color="#c0392b" opacity={opacity} renderOrder={ORDER} position={[0.06, 0.72, 0.14]} scale={[0.9, 1.15, 0.9]} roughness={0.4}>
        <sphereGeometry args={[0.15, 24, 24]} />
      </BodyPart>
      {[-1, 1].map((side) => (
        <BodyPart
          key={`lung${side}`}
          partId="organ-lung"
          color="#d98c8c"
          opacity={opacity}
          renderOrder={ORDER}
          position={[side * 0.21, 0.7, 0.02]}
          roughness={0.6}
        >
          <capsuleGeometry args={[0.12, 0.26, 6, 16]} />
        </BodyPart>
      ))}
      <BodyPart partId="organ-stomach" color="#d8956f" opacity={opacity} renderOrder={ORDER} position={[0.12, 0.28, 0.12]} scale={[1.2, 0.85, 0.8]} roughness={0.5}>
        <sphereGeometry args={[0.13, 20, 20]} />
      </BodyPart>
      <BodyPart partId="organ-liver" color="#8e3a2d" opacity={opacity} renderOrder={ORDER} position={[-0.13, 0.42, 0.12]} scale={[1.5, 0.6, 0.9]} roughness={0.5}>
        <sphereGeometry args={[0.12, 20, 20]} />
      </BodyPart>
      <BodyPart partId="organ-gut" color="#d9a066" opacity={opacity} renderOrder={ORDER} position={[0, -0.02, 0.12]} roughness={0.6}>
        <torusGeometry args={[0.16, 0.08, 12, 32]} />
      </BodyPart>
    </group>
  )
}
