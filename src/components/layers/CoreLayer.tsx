import { ModelLayer } from './ModelLayer'

/**
 * 深部レイヤー（骨格＋内臓）。どちらも Z-Anatomy 由来の実glbモデル。
 * 同じ原点・スケール（足元y≈0/頭頂y≈1.7）で書き出されているため、
 * 骨格と内臓は同一の position/scale で解剖学的に整合する。
 * どちらも layer="core" なので depth カーブ（0.55→0.8 でフェードイン）を共有する。
 */
export function CoreLayer() {
  return (
    <group>
      {/* 骨格: Z-Anatomy「関節学(Arthrology)」 CC BY 4.0 */}
      <ModelLayer src="/models/skeleton.glb" layer="core" position={[0, -1.62, 0]} scale={1.95} />
      {/* 内臓: Z-Anatomy「内臓学(Splanchnology)」 CC BY-SA 4.0 */}
      <ModelLayer src="/models/viscera.glb" layer="core" position={[0, -1.62, 0]} scale={1.95} />
    </group>
  )
}
