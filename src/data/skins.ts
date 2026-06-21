// 皮膚レイヤー(depth=0)の「着せ替え」プリセット。
// meshStandardMaterial のパラメータを差し替えるだけで様々な質感を表現する。
// 1スキン=データ1件。ここに追加すれば SkinPicker のボタンも自動で増える。

export interface Skin {
  id: string
  /** UI表示名 */
  label: string
  /** スウォッチ（ボタンの色見本）。だいたい color と同じでよい */
  swatch: string
  /** 本体の色 */
  color: string
  /** 表面のざらつき（0=つるつる / 1=ざらざら） */
  roughness: number
  /** 金属感（0=非金属 / 1=金属）。省略時0 */
  metalness?: number
  /** 自己発光色。光らせたいスキン用。省略時は発光なし */
  emissive?: string
  /** 自己発光の強さ。省略時0 */
  emissiveIntensity?: number
  /** 不透明度の倍率（1=そのまま / 小さいほど透ける）。ガラス系用。省略時1 */
  opacityScale?: number
}

export const SKINS: Skin[] = [
  { id: 'normal', label: 'ノーマル', swatch: '#e3a98c', color: '#e3a98c', roughness: 0.7 },
  { id: 'gold', label: 'ゴールド像', swatch: '#ffce4d', color: '#ffce4d', roughness: 0.25, metalness: 1.0 },
  { id: 'robot', label: 'メタルロボ', swatch: '#b8c0cc', color: '#b8c0cc', roughness: 0.35, metalness: 0.9 },
  { id: 'zombie', label: 'ゾンビ', swatch: '#7da06a', color: '#7da06a', roughness: 0.85 },
  { id: 'glass', label: '透明人間', swatch: '#bcd6e6', color: '#bcd6e6', roughness: 0.15, opacityScale: 0.45 },
  { id: 'holo', label: 'ホログラム', swatch: '#4fd6ff', color: '#4fd6ff', roughness: 0.4, emissive: '#2bb8ff', emissiveIntensity: 0.6 },
  { id: 'marble', label: '大理石像', swatch: '#ece9e0', color: '#ece9e0', roughness: 0.4 },
  { id: 'candy', label: 'キャンディ', swatch: '#ff6fae', color: '#ff6fae', roughness: 0.3, emissive: '#ff2e88', emissiveIntensity: 0.4 },
]

export const DEFAULT_SKIN_ID = 'normal'

export function getSkin(id: string): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0]
}
