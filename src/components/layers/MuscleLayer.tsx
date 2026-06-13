import { ModelLayer } from './ModelLayer'

/**
 * 筋肉レイヤー。Z-Anatomy「筋学(Myology)」の実glbモデル（プロシージャル筋から差し替え）。
 * 骨格・内臓と同じ原点・スケール（足元y≈0/頭頂y≈1.7）で配置され解剖学的に整合する。
 * layer="muscle" で depth 中盤（0.2→0.45 でイン、0.55→0.8 でアウト）に表示。
 * renderOrder=1 で骨格内臓(0)より外・皮膚(2)より内に描画する。
 */
export function MuscleLayer() {
  return (
    <ModelLayer
      src="/models/muscle.glb"
      layer="muscle"
      position={[0, -1.62, 0]}
      scale={1.95}
      renderOrder={1}
    />
  )
}
