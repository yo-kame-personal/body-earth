import { layerOpacity } from '../../lib/depth'
import { useBodyStore } from '../../store'
import { BodyPart } from '../BodyPart'

const BONE = '#e8e2d2'
const ORDER = 0

const SPINE_YS = Array.from({ length: 9 }, (_, i) => 1.0 - i * 0.16)
const RIB_YS = [0.88, 0.71, 0.54, 0.37]

export function CoreLayer() {
  const opacity = useBodyStore((s) => layerOpacity('core', s.depth))

  return (
    <group>
      {/* ---- 骨格 ---- */}
      <BodyPart partId="bone-skull" color={BONE} opacity={opacity} renderOrder={ORDER} position={[0, 1.45, 0]} roughness={0.5}>
        <sphereGeometry args={[0.27, 28, 28]} />
      </BodyPart>
      {SPINE_YS.map((y) => (
        <BodyPart key={`spine${y}`} partId="bone-spine" color={BONE} opacity={opacity} renderOrder={ORDER} position={[0, y, -0.08]} roughness={0.5}>
          <cylinderGeometry args={[0.06, 0.06, 0.09, 12]} />
        </BodyPart>
      ))}
      {RIB_YS.map((y, i) => (
        <BodyPart
          key={`rib${y}`}
          partId="bone-ribs"
          color={BONE}
          opacity={opacity}
          renderOrder={ORDER}
          position={[0, y, 0.0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1, 0.7, 1]}
          roughness={0.5}
        >
          <torusGeometry args={[0.3 - i * 0.015, 0.035, 10, 32]} />
        </BodyPart>
      ))}
      <BodyPart
        partId="bone-pelvis"
        color={BONE}
        opacity={opacity}
        renderOrder={ORDER}
        position={[0, -0.42, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1, 0.75, 1]}
        roughness={0.5}
      >
        <torusGeometry args={[0.23, 0.07, 10, 32]} />
      </BodyPart>
      {[-1, 1].map((side) => (
        <BodyPart
          key={`armbone${side}`}
          partId="bone-arm"
          color={BONE}
          opacity={opacity}
          renderOrder={ORDER}
          position={[side * 0.58, 0.3, 0]}
          rotation={[0, 0, side * -0.12]}
          roughness={0.5}
        >
          <cylinderGeometry args={[0.04, 0.04, 1.05, 12]} />
        </BodyPart>
      ))}
      {[-1, 1].map((side) => (
        <BodyPart
          key={`legbone${side}`}
          partId="bone-leg"
          color={BONE}
          opacity={opacity}
          renderOrder={ORDER}
          position={[side * 0.22, -1.0, 0]}
          roughness={0.5}
        >
          <cylinderGeometry args={[0.05, 0.05, 1.2, 12]} />
        </BodyPart>
      ))}

      {/* ---- 内臓 ---- */}
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
