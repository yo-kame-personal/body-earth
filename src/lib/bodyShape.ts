// かわいい等身キャラの体型を一元管理する。
// 胴体はlathe（回転体）でなめらかに括れさせ、手足・頭の配置も定数化。
// SkinLayer（素体）・ClothingLayer（服）・FaceLayer（顔）が同じ値を参照してズレを防ぐ。
import { Vector2 } from 'three'

/** 前後の平たさ（断面を楕円にして人体っぽく） */
export const BODY_Z = 0.72

// 胴体の輪郭 [y(高さ), r(半径)] を下→上に。間は線形補間でなめらかに繋ぐ。
const TRUNK_KEYS: [number, number][] = [
  [-0.42, 0.03], // 股下（ほぼ閉じる）
  [-0.32, 0.21],
  [-0.18, 0.275], // 腰（ヒップ）
  [-0.02, 0.255],
  [0.2, 0.205], // ウエスト（くびれ）
  [0.45, 0.235],
  [0.72, 0.285], // 胸
  [0.9, 0.275], // 肩
  [1.0, 0.18],
  [1.08, 0.06], // 首の付け根
]

/** 任意の高さyでの胴体半径（線形補間） */
export function radiusAt(y: number): number {
  const k = TRUNK_KEYS
  if (y <= k[0][0]) return k[0][1]
  if (y >= k[k.length - 1][0]) return k[k.length - 1][1]
  for (let i = 0; i < k.length - 1; i++) {
    const [y0, r0] = k[i]
    const [y1, r1] = k[i + 1]
    if (y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0)
  }
  return k[k.length - 1][1]
}

/** 素体の胴体プロファイル（両端がほぼ閉じた立体） */
export const TRUNK_PROFILE: Vector2[] = TRUNK_KEYS.map(([y, r]) => new Vector2(r, y))

/** 服: [botY, topY]の範囲で体に沿う、両端の開いた筒シェル（半径+pad） */
export function garmentProfile(botY: number, topY: number, pad: number, steps = 14): Vector2[] {
  const pts: Vector2[] = []
  for (let i = 0; i <= steps; i++) {
    const y = botY + ((topY - botY) * i) / steps
    pts.push(new Vector2(radiusAt(y) + pad, y))
  }
  return pts
}

// 頭・首・手足の配置（素体と服で共有）
export const HEAD = { y: 1.45, r: 0.32 }
export const NECK = { y: 1.17, r: 0.1, h: 0.16 }
export const ARM = {
  x: 0.34,
  upper: { y: 0.66, len: 0.42, r: 0.092 },
  fore: { y: 0.18, len: 0.4, r: 0.08 },
  hand: { y: -0.1, r: 0.1 },
}
export const LEG = {
  x: 0.145,
  thigh: { y: -0.6, len: 0.52, r: 0.145 },
  shin: { y: -1.2, len: 0.52, r: 0.112 },
  foot: { y: -1.66, z: 0.07 },
}
