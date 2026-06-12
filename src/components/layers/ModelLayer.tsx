import { useGLTF } from '@react-three/drei'
import { useLayoutEffect, useMemo } from 'react'
import { Mesh, MeshStandardMaterial } from 'three'
import { type LayerId, layerOpacity } from '../../lib/depth'
import { useBodyStore } from '../../store'

interface ModelLayerProps {
  /** public/models/ 配下のglbパス（例: '/models/skeleton.glb'。baseは自動付与） */
  src: string
  /** depthカーブのどのレイヤーとして不透明度を制御するか */
  layer: LayerId
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
}

/**
 * glbモデルを1レイヤーとして読み込み、depthに連動した不透明度でフェードさせる。
 * 必ず <Suspense> の内側で使うこと（ロード中はサスペンドする）。
 *
 * NOTE: これはStep A用の土台。実モデル(関節学glb)を入れたら、
 * 向き/スケール/中心位置の調整と、BodyPart相当のFresnel縁発光・断面clip対応を
 * モデルのマテリアル構成を見てから追加する（現状は素のopacityフェードのみ）。
 */
export function ModelLayer({ src, layer, position, rotation, scale }: ModelLayerProps) {
  // 第2引数trueでDraco対応（drei既定のCDNデコーダを使用）
  const { scene } = useGLTF(import.meta.env.BASE_URL.replace(/\/$/, '') + src, true)
  const opacity = useBodyStore((s) => layerOpacity(layer, s.depth))

  // 共有キャッシュを汚さないよう、シーンとマテリアルを複製して独立させる
  const cloned = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((obj) => {
      if (obj instanceof Mesh) {
        const src = obj.material as MeshStandardMaterial
        const m = src.clone()
        m.transparent = true
        obj.material = m
      }
    })
    return root
  }, [scene])

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

  return <primitive object={cloned} position={position} rotation={rotation} scale={scale} />
}
