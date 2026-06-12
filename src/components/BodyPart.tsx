import type { ThreeEvent } from '@react-three/fiber'
import { useMemo, useState, type ReactNode } from 'react'
import type { WebGLProgramParametersWithUniforms } from 'three'
import { useBodyStore } from '../store'

// これ未満の不透明度の層はクリックを奥の層へ通す
const CLICKABLE_MIN_OPACITY = 0.35

// クロスフェード中(半透明)ほど強くなる縁発光。o=0/1ではゼロでホログラム感を出す
function rimStrength(opacity: number): number {
  return 4 * opacity * (1 - opacity) * 1.4
}

interface BodyPartProps {
  partId: string
  color: string
  opacity: number
  children: ReactNode
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
  renderOrder?: number
  roughness?: number
}

export function BodyPart({
  partId,
  color,
  opacity,
  children,
  position,
  rotation,
  scale,
  renderOrder = 0,
  roughness = 0.7,
}: BodyPartProps) {
  const select = useBodyStore((s) => s.select)
  const selected = useBodyStore((s) => s.selectedId === partId)
  const [hovered, setHovered] = useState(false)
  const interactive = opacity >= CLICKABLE_MIN_OPACITY

  // Fresnel縁発光のuniform。同じ注入コードを共有するためGPUプログラムは
  // 全パーツで1つにキャッシュされ、uniformだけマテリアル毎に独立する
  const rimUniform = useMemo(() => ({ value: 0 }), [])
  rimUniform.value = rimStrength(opacity)

  const injectRim = useMemo(
    () => (shader: WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uRim = rimUniform
      shader.fragmentShader = shader.fragmentShader
        .replace(
          'void main() {',
          'uniform float uRim;\nconst vec3 RIM_COLOR = vec3(0.48, 0.84, 1.0);\nvoid main() {',
        )
        .replace(
          '#include <opaque_fragment>',
          [
            'float rimFresnel = pow( 1.0 - saturate( dot( normalize( vNormal ), normalize( vViewPosition ) ) ), 2.5 );',
            'outgoingLight += RIM_COLOR * rimFresnel * uRim;',
            '#include <opaque_fragment>',
          ].join('\n'),
        )
    },
    [rimUniform],
  )

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive) return
    e.stopPropagation()
    select(partId)
  }

  return (
    <mesh
      visible={opacity > 0.02}
      position={position}
      rotation={rotation}
      scale={scale}
      renderOrder={renderOrder}
      onClick={handleClick}
      onPointerOver={(e) => {
        if (!interactive) return
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {children}
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        transparent
        opacity={opacity}
        onBeforeCompile={injectRim}
        depthWrite={opacity > 0.95}
        emissive={selected || hovered ? '#ffffff' : '#000000'}
        emissiveIntensity={selected ? 0.3 : hovered ? 0.12 : 0}
      />
    </mesh>
  )
}
