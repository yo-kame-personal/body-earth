import { ModelLayer } from './ModelLayer'

/**
 * 深部レイヤー（骨格＋内臓）。どちらも Z-Anatomy 由来の実glbモデル。
 * 同じ原点・スケール（足元y≈0/頭頂y≈1.7）で書き出されているため、
 * 骨格と内臓は同一の position/scale で解剖学的に整合する。
 * depthカーブ上は別レイヤー: 骨格(skeleton)は中〜深、内臓(viscera)は最深。
 * 最深部(depth=1)では骨格がフェードアウトし、内臓だけが残る
 * （骨格に邪魔されず内臓を見られるようにするため）。
 */
export function CoreLayer() {
  return (
    <group>
      {/* 骨格: Z-Anatomy「関節学(Arthrology)」 CC BY 4.0 */}
      <ModelLayer src="/models/skeleton.glb" layer="skeleton" position={[0, -1.62, 0]} scale={1.95} renderOrder={0} />
      {/* 内臓: Z-Anatomy「内臓学(Splanchnology)」から骨格を除去した内臓のみ CC BY-SA 4.0 */}
      <ModelLayer src="/models/viscera.glb" layer="viscera" position={[0, -1.62, 0]} scale={1.95} renderOrder={0} />
    </group>
  )
}
