import { getBottom, getTop } from '../../data/dressup'
import { ARM, BODY_Z, garmentProfile, LEG } from '../../lib/bodyShape'
import { layerOpacity } from '../../lib/depth'
import { useBodyStore } from '../../store'
import { DecorPart } from '../DecorPart'

// 服は素体（SkinLayer）と同じ体型定数を使い、体に沿うシェルとして重ねる。
const ORDER = 3 // 皮膚(2)の上、顔(5)の下
const Z: [number, number, number] = [1, 1, BODY_Z]

function Top({ opacity }: { opacity: number }) {
  const top = useBodyStore((s) => getTop(s.topId))
  if (top.id === 'none') return null
  const mat = { roughness: top.roughness ?? 0.7, metalness: top.metalness ?? 0 }
  const long = top.sleeve === 'long'
  // 長袖の上着は丈を腰まで、それ以外はウエスト丈
  const hem = long ? -0.28 : -0.02
  // 上着はpad大きめ(0.045)。ボトムスの腰(pad0.03)と半径をずらしチラつき(z-fighting)を防ぐ
  const body = garmentProfile(hem, 1.02, 0.045)

  return (
    <group>
      {/* 胴（体に沿う筒シェル） */}
      <DecorPart color={top.color} opacity={opacity} scale={Z} renderOrder={ORDER} {...mat}>
        <latheGeometry args={[body, 48]} />
      </DecorPart>
      {/* 袖 */}
      {top.sleeve !== 'none' &&
        [-1, 1].map((side) => (
          <group key={side}>
            <DecorPart
              color={top.color}
              opacity={opacity}
              position={[side * ARM.x, long ? ARM.upper.y : ARM.upper.y + 0.07, 0]}
              renderOrder={ORDER}
              {...mat}
            >
              <capsuleGeometry args={[ARM.upper.r + 0.03, long ? ARM.upper.len : 0.24, 8, 16]} />
            </DecorPart>
            {long && (
              <DecorPart
                color={top.color}
                opacity={opacity}
                position={[side * ARM.x, ARM.fore.y, 0]}
                renderOrder={ORDER}
                {...mat}
              >
                <capsuleGeometry args={[ARM.fore.r + 0.028, ARM.fore.len, 8, 16]} />
              </DecorPart>
            )}
          </group>
        ))}
    </group>
  )
}

function Bottom({ opacity }: { opacity: number }) {
  const bottom = useBodyStore((s) => getBottom(s.bottomId))
  if (bottom.id === 'none') return null
  const roughness = bottom.roughness ?? 0.75

  // スカートは腰から広がる円錐シェル
  if (bottom.type === 'skirt') {
    return (
      <DecorPart
        color={bottom.color}
        opacity={opacity}
        position={[0, -0.28, 0]}
        scale={[1, 1, 0.82]}
        renderOrder={ORDER}
        roughness={roughness}
      >
        <cylinderGeometry args={[0.27, 0.54, 0.62, 28, 1, true]} />
      </DecorPart>
    )
  }

  // パンツ系: 腰シェル＋脚
  const shorts = bottom.type === 'shorts'
  // 腰のpadは上着(0.045)より小さく(0.03)＝上着の内側に入れてチラつき防止
  const hip = garmentProfile(-0.4, 0.06, 0.03)
  return (
    <group>
      <DecorPart color={bottom.color} opacity={opacity} scale={Z} renderOrder={ORDER} roughness={roughness}>
        <latheGeometry args={[hip, 48]} />
      </DecorPart>
      {[-1, 1].map((side) => (
        <group key={side}>
          <DecorPart
            color={bottom.color}
            opacity={opacity}
            position={[side * LEG.x, shorts ? LEG.thigh.y + 0.1 : LEG.thigh.y, 0]}
            renderOrder={ORDER}
            roughness={roughness}
          >
            <capsuleGeometry args={[LEG.thigh.r + 0.03, shorts ? 0.3 : LEG.thigh.len, 8, 16]} />
          </DecorPart>
          {!shorts && (
            <DecorPart
              color={bottom.color}
              opacity={opacity}
              position={[side * LEG.x, LEG.shin.y, 0]}
              renderOrder={ORDER}
              roughness={roughness}
            >
              <capsuleGeometry args={[LEG.shin.r + 0.028, LEG.shin.len, 8, 16]} />
            </DecorPart>
          )}
        </group>
      ))}
    </group>
  )
}

export function ClothingLayer() {
  const opacity = useBodyStore((s) => layerOpacity('skin', s.depth))
  if (opacity <= 0.02) return null

  return (
    <group>
      <Top opacity={opacity} />
      <Bottom opacity={opacity} />
    </group>
  )
}
