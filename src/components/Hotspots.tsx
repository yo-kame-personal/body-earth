import { type LayerId, layerOpacity } from '../lib/depth'
import { clipConstant } from '../lib/layerMaterial'
import { useBodyStore } from '../store'
import { Hotspot } from './Hotspot'

// レイヤーがこの不透明度を超えたら、その部位をクリック可能にする
const THRESH = 0.5

// 各ホットスポットの配置（partId/座標/半径/所属レイヤー）。
// 断面ON時は、座標zがクリップ平面より手前（切り取られた側）の点を抑制するため
// レイヤー判定と一緒にzを参照できるようデータとして持つ。
type Spot = { id: string; pos: [number, number, number]; r: number; layer: LayerId }
const SPOTS: Spot[] = [
  // 皮膚（bodyShapeの体型に合わせた近似配置）
  { id: 'skin-head', pos: [0, 1.5, 0.26], r: 0.16, layer: 'skin' },
  { id: 'skin-torso', pos: [0, 0.6, 0.2], r: 0.2, layer: 'skin' },
  { id: 'skin-arm', pos: [0.36, 0.4, 0.1], r: 0.12, layer: 'skin' },
  { id: 'skin-leg', pos: [0.15, -1.0, 0.12], r: 0.14, layer: 'skin' },
  // 筋肉
  { id: 'muscle-face', pos: [0, 1.5, 0.28], r: 0.14, layer: 'muscle' },
  { id: 'muscle-chest', pos: [0.18, 0.85, 0.24], r: 0.13, layer: 'muscle' },
  { id: 'muscle-abs', pos: [0, 0.4, 0.26], r: 0.13, layer: 'muscle' },
  { id: 'muscle-torso', pos: [0.3, 0.5, 0.16], r: 0.12, layer: 'muscle' },
  { id: 'muscle-arm', pos: [0.6, 0.25, 0.08], r: 0.12, layer: 'muscle' },
  { id: 'muscle-leg', pos: [0.24, -1.0, 0.12], r: 0.14, layer: 'muscle' },
  // 骨格
  { id: 'bone-skull', pos: [0, 1.55, 0.1], r: 0.15, layer: 'skeleton' },
  { id: 'bone-ribs', pos: [0, 0.9, 0.12], r: 0.16, layer: 'skeleton' },
  { id: 'bone-spine', pos: [0, 0.5, -0.1], r: 0.1, layer: 'skeleton' },
  { id: 'bone-pelvis', pos: [0, 0.05, 0.06], r: 0.14, layer: 'skeleton' },
  { id: 'bone-arm', pos: [0.52, 0.3, 0], r: 0.11, layer: 'skeleton' },
  { id: 'bone-leg', pos: [0.2, -0.7, 0], r: 0.13, layer: 'skeleton' },
  // 内臓
  { id: 'organ-lung', pos: [0.16, 0.82, 0.05], r: 0.13, layer: 'viscera' },
  { id: 'organ-heart', pos: [0.02, 0.85, 0.1], r: 0.1, layer: 'viscera' },
  { id: 'organ-liver', pos: [-0.14, 0.55, 0.12], r: 0.12, layer: 'viscera' },
  { id: 'organ-stomach', pos: [0.14, 0.5, 0.12], r: 0.1, layer: 'viscera' },
  { id: 'organ-gut', pos: [0, 0.15, 0.14], r: 0.16, layer: 'viscera' },
]

/**
 * 各レイヤーの主要部位に置くクリック判定球の集合。
 * 現在見えているレイヤー（depthに連動）の部位だけが表示・クリック可能になる。
 * 断面ON時は、クリップ平面より手前（切り取られて消えた側）の部位を抑制する。
 * 座標は人体モデル（足元y≈-1.6/頭頂y≈1.6付近）に合わせた近似配置。
 */
export function Hotspots() {
  const depth = useBodyStore((s) => s.depth)
  const clip = useBodyStore((s) => s.clip)
  const clipPos = useBodyStore((s) => s.clipPos)

  // 断面ON時、平面（z <= cut が残る）より手前の点はカットで消えているので非表示。
  // 球の半径ぶん余裕を持たせ、断面ぎりぎりに露出する部位は残す。
  const cut = clip ? clipConstant(clipPos) : Infinity

  return (
    <group>
      {SPOTS.map((s) => {
        const visible = layerOpacity(s.layer, depth) > THRESH && s.pos[2] <= cut + s.r
        return <Hotspot key={s.id} partId={s.id} position={s.pos} radius={s.r} active={visible} />
      })}
    </group>
  )
}
