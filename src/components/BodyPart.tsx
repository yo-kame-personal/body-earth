import type { ThreeEvent } from '@react-three/fiber'
import { useMemo, useState, type ReactNode } from 'react'
import { DoubleSide, FrontSide, Plane, Vector3 } from 'three'
import type { WebGLProgramParametersWithUniforms } from 'three'
import { useBodyStore } from '../store'

// これ未満の不透明度の層はクリックを奥の層へ通す
const CLICKABLE_MIN_OPACITY = 0.35

// 断面表示: 世界座標z>0（体の前半分）をクリップする固定平面
const CLIP_PLANES = [new Plane(new Vector3(0, 0, -1), 0)]

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
  const clip = useBodyStore((s) => s.clip)
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
            // 裏面=断面モードで見える内壁。光が届かず真っ黒になるのでパーツ色で底上げ
            'if ( ! gl_FrontFacing ) outgoingLight += diffuse * 0.45;',
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
      {/* keyでclip切替時にマテリアルを作り直し、side/clippingPlanesの
          変更に伴うシェーダー再コンパイル管理をthreeに任せる */}
      <meshStandardMaterial
        key={clip ? 'clip' : 'plain'}
        color={color}
        roughness={roughness}
        transparent
        opacity={opacity}
        side={clip ? DoubleSide : FrontSide}
        clippingPlanes={clip ? CLIP_PLANES : null}
        onBeforeCompile={injectRim}
        depthWrite={opacity > 0.95}
        emissive={selected || hovered ? '#ffffff' : '#000000'}
        emissiveIntensity={selected ? 0.3 : hovered ? 0.12 : 0}
      />
    </mesh>
  )
}
