// カメラ距離 <-> 深度(0..1) の変換と、レイヤーごとの不透明度カーブ

export const MIN_DISTANCE = 3.4
export const MAX_DISTANCE = 7

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

export function distanceToDepth(distance: number): number {
  return clamp01((MAX_DISTANCE - distance) / (MAX_DISTANCE - MIN_DISTANCE))
}

export function depthToDistance(depth: number): number {
  return MAX_DISTANCE - clamp01(depth) * (MAX_DISTANCE - MIN_DISTANCE)
}

/** 台形カーブ: a→b でフェードイン、c→e でフェードアウト */
export function trapezoid(d: number, a: number, b: number, c: number, e: number): number {
  const rise = b > a ? (d - a) / (b - a) : 1
  const fall = e > c ? (e - d) / (e - c) : 1
  return clamp01(Math.min(rise, fall))
}

export type LayerId = 'skin' | 'muscle' | 'skeleton' | 'viscera'

// 各レイヤーの [フェードイン開始, 完了, フェードアウト開始, 完了]
// 皮膚 → 筋肉 → 骨格 → 内臓 の4段階。骨格と内臓を別レイヤーに分け、
// 最深部(depth=1)では骨格がフェードアウトして内臓だけが残る
// （骨格に邪魔されず内臓を見られるようにするため）。
const CURVES: Record<LayerId, [number, number, number, number]> = {
  skin: [-1, 0, 0.12, 0.32],
  muscle: [0.18, 0.38, 0.5, 0.68],
  skeleton: [0.55, 0.72, 0.82, 0.94],
  viscera: [0.7, 0.9, 9, 10],
}

export function layerOpacity(layer: LayerId, depth: number): number {
  const [a, b, c, e] = CURVES[layer]
  return trapezoid(depth, a, b, c, e)
}

export function activeLayerLabel(depth: number): string {
  if (depth < 0.28) return '皮膚'
  if (depth < 0.52) return '筋肉'
  if (depth < 0.8) return '骨格'
  return '内臓'
}
