import { getFace, type EyeStyle, type MouthStyle } from '../../data/dressup'
import { HEAD as HEAD_DEF } from '../../lib/bodyShape'
import { layerOpacity } from '../../lib/depth'
import { useBodyStore } from '../../store'
import { DecorPart } from '../DecorPart'

// 頭の中心（bodyShape.HEAD に合わせる）
const HEAD: [number, number, number] = [0, HEAD_DEF.y, 0]
const DARK = '#23272f'
const EYE_X = 0.11
const EYE_Y = 0.06
const FRONT_Z = 0.29 // 頭の前面（半径0.32の表面付近）

function Eye({ style, side, opacity }: { style: EyeStyle; side: -1 | 1; opacity: number }) {
  const pos: [number, number, number] = [side * EYE_X, EYE_Y, FRONT_Z]
  switch (style) {
    case 'wide':
      return (
        <>
          <DecorPart color="#f4f4f6" opacity={opacity} position={pos}>
            <sphereGeometry args={[0.052, 16, 16]} />
          </DecorPart>
          <DecorPart color={DARK} opacity={opacity} position={[pos[0], pos[1], pos[2] + 0.03]}>
            <sphereGeometry args={[0.026, 12, 12]} />
          </DecorPart>
        </>
      )
    case 'happy': // 細めの弧（にっこり閉じ目）
      return (
        <DecorPart color={DARK} opacity={opacity} position={pos} scale={[1, 0.42, 1]}>
          <sphereGeometry args={[0.045, 16, 16]} />
        </DecorPart>
      )
    case 'sleepy': // 横一文字
      return (
        <DecorPart color={DARK} opacity={opacity} position={pos}>
          <boxGeometry args={[0.09, 0.014, 0.02]} />
        </DecorPart>
      )
    case 'robot': // 光る四角い目
      return (
        <DecorPart
          color="#0a2a33"
          opacity={opacity}
          position={pos}
          emissive="#39d0ff"
          emissiveIntensity={0.9}
        >
          <boxGeometry args={[0.05, 0.05, 0.03]} />
        </DecorPart>
      )
    default: // 'dot'
      return (
        <DecorPart color={DARK} opacity={opacity} position={pos}>
          <sphereGeometry args={[0.036, 16, 16]} />
        </DecorPart>
      )
  }
}

function Mouth({ style, opacity }: { style: MouthStyle; opacity: number }) {
  switch (style) {
    case 'smile': // 上向きの弧（U字）
      return (
        <DecorPart color={DARK} opacity={opacity} position={[0, -0.08, FRONT_Z]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.075, 0.013, 8, 24, Math.PI]} />
        </DecorPart>
      )
    case 'open': // 驚きのO
      return (
        <DecorPart color={DARK} opacity={opacity} position={[0, -0.11, FRONT_Z]}>
          <torusGeometry args={[0.04, 0.016, 10, 20]} />
        </DecorPart>
      )
    case 'grin': // 大きな口
      return (
        <DecorPart color={DARK} opacity={opacity} position={[0, -0.11, FRONT_Z]}>
          <boxGeometry args={[0.15, 0.032, 0.02]} />
        </DecorPart>
      )
    default: // 'neutral'
      return (
        <DecorPart color={DARK} opacity={opacity} position={[0, -0.11, FRONT_Z]}>
          <boxGeometry args={[0.1, 0.014, 0.02]} />
        </DecorPart>
      )
  }
}

function Accessory({ kind, opacity }: { kind: string; opacity: number }) {
  if (kind === 'sunglasses') {
    return (
      <DecorPart
        color="#15171c"
        opacity={opacity}
        position={[0, EYE_Y + 0.005, FRONT_Z + 0.02]}
        roughness={0.3}
        metalness={0.4}
      >
        <boxGeometry args={[0.3, 0.075, 0.04]} />
      </DecorPart>
    )
  }
  if (kind === 'glasses') {
    return (
      <>
        {[-1, 1].map((side) => (
          <DecorPart
            key={side}
            color="#2a2e36"
            opacity={opacity}
            position={[side * EYE_X, EYE_Y, FRONT_Z + 0.02]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.052, 0.008, 8, 20]} />
          </DecorPart>
        ))}
        <DecorPart color="#2a2e36" opacity={opacity} position={[0, EYE_Y, FRONT_Z + 0.02]}>
          <boxGeometry args={[0.06, 0.01, 0.01]} />
        </DecorPart>
      </>
    )
  }
  if (kind === 'blush') {
    return (
      <>
        {[-1, 1].map((side) => (
          <DecorPart
            key={side}
            color="#ff9bb0"
            opacity={opacity * 0.7}
            position={[side * 0.19, -0.02, FRONT_Z - 0.02]}
            scale={[1, 0.6, 0.4]}
          >
            <sphereGeometry args={[0.05, 16, 16]} />
          </DecorPart>
        ))}
      </>
    )
  }
  return null
}

export function FaceLayer() {
  const opacity = useBodyStore((s) => layerOpacity('skin', s.depth))
  const face = useBodyStore((s) => getFace(s.faceId))

  if (face.id === 'none' || opacity <= 0.02) return null

  return (
    <group position={HEAD}>
      <Eye style={face.eye} side={-1} opacity={opacity} />
      <Eye style={face.eye} side={1} opacity={opacity} />
      <Mouth style={face.mouth} opacity={opacity} />
      <Accessory kind={face.accessory ?? 'none'} opacity={opacity} />
    </group>
  )
}
