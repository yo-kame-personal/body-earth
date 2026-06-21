import { ARM, BODY_Z, HEAD, LEG, NECK, TRUNK_PROFILE } from '../../lib/bodyShape'
import { layerOpacity } from '../../lib/depth'
import { getSkin } from '../../data/skins'
import { useBodyStore } from '../../store'
import { BodyPart } from '../BodyPart'

const ORDER = 2 // 透明描画は内側から外側の順にしたいので、皮膚は最後に描く

export function SkinLayer() {
  const opacity = useBodyStore((s) => layerOpacity('skin', s.depth))
  const skin = useBodyStore((s) => getSkin(s.skinId))

  // 全パーツ共通の見た目（選択中スキン）
  const look = {
    color: skin.color,
    roughness: skin.roughness,
    metalness: skin.metalness ?? 0,
    baseEmissive: skin.emissive,
    baseEmissiveIntensity: skin.emissiveIntensity,
    opacity: opacity * (skin.opacityScale ?? 1),
    renderOrder: ORDER,
  }

  return (
    <group>
      {/* 頭 */}
      <BodyPart partId="skin-head" {...look} position={[0, HEAD.y, 0]}>
        <sphereGeometry args={[HEAD.r, 32, 32]} />
      </BodyPart>
      {/* 首 */}
      <BodyPart partId="skin-head" {...look} position={[0, NECK.y, 0]}>
        <cylinderGeometry args={[NECK.r, NECK.r + 0.02, NECK.h, 24]} />
      </BodyPart>
      {/* 胴体（lathe＝なめらかに括れた回転体、前後を平たく） */}
      <BodyPart partId="skin-torso" {...look} scale={[1, 1, BODY_Z]}>
        <latheGeometry args={[TRUNK_PROFILE, 48]} />
      </BodyPart>

      {/* 腕（上腕＋前腕＋手） */}
      {[-1, 1].map((side) => (
        <group key={`arm${side}`}>
          <BodyPart partId="skin-arm" {...look} position={[side * ARM.x, ARM.upper.y, 0]}>
            <capsuleGeometry args={[ARM.upper.r, ARM.upper.len, 8, 16]} />
          </BodyPart>
          <BodyPart partId="skin-arm" {...look} position={[side * ARM.x, ARM.fore.y, 0]}>
            <capsuleGeometry args={[ARM.fore.r, ARM.fore.len, 8, 16]} />
          </BodyPart>
          <BodyPart partId="skin-arm" {...look} position={[side * ARM.x, ARM.hand.y, 0]} scale={[1, 1.1, 0.8]}>
            <sphereGeometry args={[ARM.hand.r, 20, 20]} />
          </BodyPart>
        </group>
      ))}

      {/* 脚（太もも＋すね＋足） */}
      {[-1, 1].map((side) => (
        <group key={`leg${side}`}>
          <BodyPart partId="skin-leg" {...look} position={[side * LEG.x, LEG.thigh.y, 0]}>
            <capsuleGeometry args={[LEG.thigh.r, LEG.thigh.len, 8, 16]} />
          </BodyPart>
          <BodyPart partId="skin-leg" {...look} position={[side * LEG.x, LEG.shin.y, 0]}>
            <capsuleGeometry args={[LEG.shin.r, LEG.shin.len, 8, 16]} />
          </BodyPart>
          <BodyPart
            partId="skin-leg"
            {...look}
            position={[side * LEG.x, LEG.foot.y, LEG.foot.z]}
            scale={[1, 0.5, 1.7]}
          >
            <sphereGeometry args={[0.12, 20, 20]} />
          </BodyPart>
        </group>
      ))}
    </group>
  )
}
