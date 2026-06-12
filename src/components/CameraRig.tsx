import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { MathUtils } from 'three'
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
 *   （enableDampingで慣性つきの滑らかなズーム）
 * - スライダー操作 → 目標距離へ指数減衰(damp)でイージング移動
 */
export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null)
  const camera = useThree((s) => s.camera)
  const depth = useBodyStore((s) => s.depth)
  const setDepth = useBodyStore((s) => s.setDepth)
  // スライダー由来のアニメーション目標距離。nullなら待機
  const goal = useRef<number | null>(null)

  // depthの変化のうち、現在のカメラ距離と食い違うもの（=スライダー由来）
  // だけを目標にする。カメラ操作由来の変化はほぼ一致するので無視
  useEffect(() => {
    const c = controls.current
    if (!c) return
    const current = camera.position.distanceTo(c.target)
    const wanted = depthToDistance(depth)
    if (Math.abs(current - wanted) < 0.02) return
    goal.current = wanted
  }, [depth, camera])

  // ユーザーがホイール/ドラッグを始めたらスライダーアニメーションを中断
  useEffect(() => {
    const c = controls.current
    if (!c) return
    const cancel = () => {
      goal.current = null
    }
    c.addEventListener('start', cancel)
    return () => c.removeEventListener('start', cancel)
  }, [])

  useFrame((_, delta) => {
    const c = controls.current
    if (!c) return
    if (goal.current !== null) {
      const current = camera.position.distanceTo(c.target)
      const arrived = Math.abs(goal.current - current) < 0.005
      const next = arrived
        ? goal.current
        : MathUtils.damp(current, goal.current, 6, delta)
      const dir = camera.position.clone().sub(c.target).normalize()
      camera.position.copy(c.target).addScaledVector(dir, next)
      if (arrived) goal.current = null
    }
    // enableDampingの慣性適用にも毎フレームのupdateが必要
    c.update()
  })

  return (
    <OrbitControls
      ref={controls}
      target={[0, 0.2, 0]}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
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
