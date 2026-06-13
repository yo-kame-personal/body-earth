import { useGLTF } from '@react-three/drei'
import { useLayoutEffect, useMemo } from 'react'
import { DoubleSide, FrontSide, Mesh, MeshStandardMaterial } from 'three'
import { type LayerId, layerOpacity } from '../../lib/depth'
import { CLIP_PLANES, makeRimInjector, rimStrength } from '../../lib/layerMaterial'
import { useBodyStore } from '../../store'

interface ModelLayerProps {
  /** public/models/ 配下のglbパス（例: '/models/skeleton.glb'。baseは自動付与） */
  src: string
  /** depthカーブのどのレイヤーとして不透明度を制御するか */
  layer: LayerId
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
  /** 透明描画順。内側ほど小さく（骨格内臓0→筋肉1→皮膚2）。既定0 */
  renderOrder?: number
}

/**
 * glbモデルを1レイヤーとして読み込み、depthに連動した不透明度でフェードさせる。
 * BodyPart（プリミティブ）と同じFresnel縁発光・断面clipを共有マテリアル処理で適用する。
 * 必ず <Suspense> の内側で使うこと（ロード中はサスペンドする）。
 */
export function ModelLayer({ src, layer, position, rotation, scale, renderOrder = 0 }: ModelLayerProps) {
  // 第2引数trueでDraco対応（drei既定のCDNデコーダを使用）
  const { scene } = useGLTF(import.meta.env.BASE_URL.replace(/\/$/, '') + src, true)
  const opacity = useBodyStore((s) => layerOpacity(layer, s.depth))
  const clip = useBodyStore((s) => s.clip)

  // レイヤー内の全マテリアルで共有する縁発光強度のuniform
  const rimUniform = useMemo(() => ({ value: 0 }), [])
  rimUniform.value = rimStrength(opacity)

  // 共有キャッシュを汚さないよう、シーンとマテリアルを複製して独立させる。
  // 複製時にFresnel注入を仕込む（注入は全マテリアル同一でプログラム共有）
  const cloned = useMemo(() => {
    const inject = makeRimInjector(rimUniform)
    const root = scene.clone(true)
    root.traverse((obj) => {
      if (obj instanceof Mesh) {
        const m = (obj.material as MeshStandardMaterial).clone()
        m.transparent = true
        m.onBeforeCompile = inject
        obj.material = m
        obj.renderOrder = renderOrder
      }
    })
    return root
  }, [scene, rimUniform, renderOrder])

  // depth変化のたびに不透明度と表示可否を更新
  useLayoutEffect(() => {
    cloned.traverse((obj) => {
      if (obj instanceof Mesh) {
        const m = obj.material as MeshStandardMaterial
        m.opacity = opacity
        m.depthWrite = opacity > 0.95
        obj.visible = opacity > 0.02
      }
    })
  }, [cloned, opacity])

  // 断面トグルに連動。side変更はシェーダー再コンパイルが要るのでneedsUpdate
  useLayoutEffect(() => {
    cloned.traverse((obj) => {
      if (obj instanceof Mesh) {
        const m = obj.material as MeshStandardMaterial
        m.side = clip ? DoubleSide : FrontSide
        m.clippingPlanes = clip ? CLIP_PLANES : null
        m.needsUpdate = true
      }
    })
  }, [cloned, clip])

  return <primitive object={cloned} position={position} rotation={rotation} scale={scale} />
}
