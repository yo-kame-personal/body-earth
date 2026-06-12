import { Stars } from '@react-three/drei'
import { CameraRig } from './CameraRig'
import { CoreLayer } from './layers/CoreLayer'
import { MuscleLayer } from './layers/MuscleLayer'
import { SkinLayer } from './layers/SkinLayer'

export function Scene() {
  return (
    <>
      <color attach="background" args={['#070b14']} />
      <hemisphereLight args={['#cfd8ff', '#1a1410', 0.7]} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#8fb0ff" />
      <Stars radius={60} depth={30} count={2500} factor={3} fade speed={0.5} />
      <group>
        <CoreLayer />
        <MuscleLayer />
        <SkinLayer />
      </group>
      <CameraRig />
    </>
  )
}
