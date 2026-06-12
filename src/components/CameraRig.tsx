import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import {
  MAX_DISTANCE,
  MIN_DISTANCE,
  depthToDistance,
  distanceToDepth,
} from '../lib/depth'
import { useBodyStore } from '../store'

/**
 * ズーム（カメラ距離）と深度(depth)の双方向同期。
 * - ホイールズーム → OrbitControlsのonChange → depthを更新
 * - スライダー操作 → depthの変化を監視 → カメラ距離を合わせる
 */
export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null)
  const camera = useThree((s) => s.camera)
  const depth = useBodyStore((s) => s.depth)
  const setDepth = useBodyStore((s) => s.setDepth)

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const current = camera.position.distanceTo(c.target)
    const wanted = depthToDistance(depth)
    // 誤差が小さいうちは触らない（無限ループ防止）
    if (Math.abs(current - wanted) < 0.01) return
    const dir = camera.position.clone().sub(c.target).normalize()
    camera.position.copy(c.target).addScaledVector(dir, wanted)
    c.update()
  }, [depth, camera])

  return (
    <OrbitControls
      ref={controls}
      target={[0, 0.2, 0]}
      enablePan={false}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      zoomSpeed={0.7}
      onChange={() => {
        const c = controls.current
        if (!c) return
        setDepth(distanceToDepth(camera.position.distanceTo(c.target)))
      }}
    />
  )
}
