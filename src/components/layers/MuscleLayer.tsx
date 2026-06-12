import { layerOpacity } from '../../lib/depth'
import { useBodyStore } from '../../store'
import { BodyPart } from '../BodyPart'

const MUSCLE = '#b03a31'
const MUSCLE_DARK = '#962f28'
const ORDER = 1

export function MuscleLayer() {
  const opacity = useBodyStore((s) => layerOpacity('muscle', s.depth))

  return (
    <group>
      {/* 頭部（表情筋） */}
      <BodyPart partId="muscle-face" color={MUSCLE_DARK} opacity={opacity} renderOrder={ORDER} position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.31, 32, 32]} />
      </BodyPart>
      <BodyPart partId="muscle-face" color={MUSCLE_DARK} opacity={opacity} renderOrder={ORDER} position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.11, 0.15, 0.28, 24]} />
      </BodyPart>
      {/* 体幹 */}
      <BodyPart partId="muscle-torso" color={MUSCLE} opacity={opacity} renderOrder={ORDER} position={[0, 0.45, 0]} scale={[1, 1, 0.78]}>
        <capsuleGeometry args={[0.375, 0.72, 8, 24]} />
      </BodyPart>
      {/* 大胸筋 */}
      {[-1, 1].map((side) => (
        <BodyPart
          key={`chest${side}`}
          partId="muscle-chest"
          color={MUSCLE}
          opacity={opacity}
          renderOrder={ORDER}
          position={[side * 0.17, 0.78, 0.24]}
          scale={[1, 0.8, 0.55]}
        >
          <sphereGeometry args={[0.18, 24, 24]} />
        </BodyPart>
      ))}
      {/* 腹直筋 */}
      <BodyPart partId="muscle-abs" color={MUSCLE} opacity={opacity} renderOrder={ORDER} position={[0, 0.32, 0.27]} scale={[1, 1, 0.5]}>
        <capsuleGeometry args={[0.17, 0.32, 6, 16]} />
      </BodyPart>
      {/* 腕 */}
      {[-1, 1].map((side) => (
        <BodyPart
          key={`arm${side}`}
          partId="muscle-arm"
          color={MUSCLE}
          opacity={opacity}
          renderOrder={ORDER}
          position={[side * 0.58, 0.3, 0]}
          rotation={[0, 0, side * -0.12]}
        >
          <capsuleGeometry args={[0.095, 0.95, 8, 16]} />
        </BodyPart>
      ))}
      {/* 脚 */}
      {[-1, 1].map((side) => (
        <BodyPart
          key={`leg${side}`}
          partId="muscle-leg"
          color={MUSCLE}
          opacity={opacity}
          renderOrder={ORDER}
          position={[side * 0.22, -1.0, 0]}
        >
          <capsuleGeometry args={[0.135, 1.05, 8, 16]} />
        </BodyPart>
      ))}
    </group>
  )
}
