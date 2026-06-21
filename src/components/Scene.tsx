import { Stars } from '@react-three/drei'
import { Suspense, useLayoutEffect } from 'react'
import { CLIP_PLANES, clipConstant } from '../lib/layerMaterial'
import { useBodyStore } from '../store'
import { CameraRig } from './CameraRig'
import { Hotspots } from './Hotspots'
import { ClothingLayer } from './layers/ClothingLayer'
import { CoreLayer } from './layers/CoreLayer'
import { FaceLayer } from './layers/FaceLayer'
import { MuscleLayer } from './layers/MuscleLayer'
import { SkinLayer } from './layers/SkinLayer'

// 断面スライダー(clipPos)を共有クリップ平面のconstantへ反映する。
// 平面インスタンスは全レイヤーで共有されるため1か所書き換えれば全体に効く。
function ClipController() {
  const clipPos = useBodyStore((s) => s.clipPos)
  useLayoutEffect(() => {
    CLIP_PLANES[0].constant = clipConstant(clipPos)
  }, [clipPos])
  return null
}

export function Scene() {
  return (
    <>
      <color attach="background" args={['#070b14']} />
      <hemisphereLight args={['#cfd8ff', '#1a1410', 0.7]} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#8fb0ff" />
      <Stars radius={60} depth={30} count={2500} factor={3} fade speed={0.5} />
      {/* glbロード中はレイヤーをサスペンドさせる（背景・カメラは先に出る） */}
      <Suspense fallback={null}>
        <group>
          <CoreLayer />
          <MuscleLayer />
          <SkinLayer />
          <ClothingLayer />
          <FaceLayer />
        </group>
      </Suspense>
      <Hotspots />
      <CameraRig />
      <ClipController />
    </>
  )
}
