import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import { DepthSlider } from './components/ui/DepthSlider'
import { Hud } from './components/ui/Hud'
import { InfoPanel } from './components/ui/InfoPanel'
import { depthToDistance } from './lib/depth'
import { useBodyStore } from './store'

export default function App() {
  const initialDepth = useBodyStore.getState().depth
  return (
    <div className="app">
      <Canvas
        camera={{ position: [0, 0.6, depthToDistance(initialDepth)], fov: 42 }}
        dpr={[1, 2]}
        gl={{ localClippingEnabled: true }}
        onPointerMissed={() => useBodyStore.getState().select(null)}
      >
        <Scene />
      </Canvas>
      <Hud />
      <DepthSlider />
      <InfoPanel />
    </div>
  )
}
