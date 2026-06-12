import { layerOpacity } from '../../lib/depth'
import { useBodyStore } from '../../store'
import { BodyPart } from '../BodyPart'

const SKIN = '#e3a98c'
const ORDER = 2 // 透明描画は内側から外側の順にしたいので、皮膚は最後に描く

export function SkinLayer() {
  const opacity = useBodyStore((s) => layerOpacity('skin', s.depth))

  return (
    <group>
      {/* 頭・首 */}
      <BodyPart partId="skin-head" color={SKIN} opacity={opacity} renderOrder={ORDER} position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.34, 32, 32]} />
      </BodyPart>
      <BodyPart partId="skin-head" color={SKIN} opacity={opacity} renderOrder={ORDER} position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.13, 0.17, 0.28, 24]} />
      </BodyPart>
      {/* 胴体 */}
      <BodyPart partId="skin-torso" color={SKIN} opacity={opacity} renderOrder={ORDER} position={[0, 0.45, 0]} scale={[1, 1, 0.78]}>
        <capsuleGeometry args={[0.42, 0.75, 8, 24]} />
      </BodyPart>
      {/* 腕 */}
      {[-1, 1].map((side) => (
        <BodyPart
          key={`arm${side}`}
          partId="skin-arm"
          color={SKIN}
          opacity={opacity}
          renderOrder={ORDER}
          position={[side * 0.58, 0.3, 0]}
          rotation={[0, 0, side * -0.12]}
        >
          <capsuleGeometry args={[0.115, 1.0, 8, 16]} />
        </BodyPart>
      ))}
      {/* 脚 */}
      {[-1, 1].map((side) => (
        <BodyPart
          key={`leg${side}`}
          partId="skin-leg"
          color={SKIN}
          opacity={opacity}
          renderOrder={ORDER}
          position={[side * 0.22, -1.0, 0]}
        >
          <capsuleGeometry args={[0.16, 1.1, 8, 16]} />
        </BodyPart>
      ))}
      {/* 足 */}
      {[-1, 1].map((side) => (
        <BodyPart
          key={`foot${side}`}
          partId="skin-leg"
          color={SKIN}
          opacity={opacity}
          renderOrder={ORDER}
          position={[side * 0.22, -1.72, 0.1]}
          scale={[1, 0.45, 1.7]}
        >
          <sphereGeometry args={[0.14, 20, 20]} />
        </BodyPart>
      ))}
    </group>
  )
}
