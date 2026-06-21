// きせかえ（コーデ）の部位別アイテム定義。
// 顔(立体パーツ) / トップス / ボトムス の3スロット。肌の質感は src/data/skins.ts が担当。
// 1アイテム=1データ。配列に足すだけでUIのボタンも自動で増える。

// ---- 顔（表情・小物） ----
export type EyeStyle = 'dot' | 'wide' | 'happy' | 'sleepy' | 'robot'
export type MouthStyle = 'smile' | 'neutral' | 'open' | 'grin'
export type FaceAccessory = 'none' | 'sunglasses' | 'glasses' | 'blush'

export interface Face {
  id: string
  /** ボタンに出す絵文字 */
  emoji: string
  /** 表示名 */
  label: string
  eye: EyeStyle
  mouth: MouthStyle
  accessory?: FaceAccessory
}

export const FACES: Face[] = [
  { id: 'smile', emoji: '😊', label: 'にこにこ', eye: 'happy', mouth: 'smile' },
  { id: 'plain', emoji: '😐', label: 'すまし', eye: 'dot', mouth: 'neutral' },
  { id: 'surprise', emoji: '😮', label: 'びっくり', eye: 'wide', mouth: 'open' },
  { id: 'grin', emoji: '😁', label: 'にやり', eye: 'dot', mouth: 'grin' },
  { id: 'cool', emoji: '😎', label: 'クール', eye: 'dot', mouth: 'neutral', accessory: 'sunglasses' },
  { id: 'nerd', emoji: '🤓', label: 'メガネ', eye: 'dot', mouth: 'smile', accessory: 'glasses' },
  { id: 'cute', emoji: '🥰', label: 'ほっぺ', eye: 'happy', mouth: 'smile', accessory: 'blush' },
  { id: 'sleepy', emoji: '😴', label: 'ねむい', eye: 'sleepy', mouth: 'neutral' },
  { id: 'robot', emoji: '🤖', label: 'ロボ', eye: 'robot', mouth: 'neutral' },
  { id: 'none', emoji: '⚪️', label: 'なし', eye: 'dot', mouth: 'neutral' }, // 何も描かない
]

// ---- トップス ----
export type Sleeve = 'none' | 'short' | 'long'

export interface Top {
  id: string
  label: string
  /** ボタンの色見本／服の色。none のときは空 */
  color: string
  sleeve: Sleeve
  roughness?: number
  metalness?: number
}

export const TOPS: Top[] = [
  { id: 'none', label: 'なし', color: '', sleeve: 'none' },
  { id: 'tshirt', label: 'Tシャツ', color: '#4aa3df', sleeve: 'short' },
  { id: 'hoodie', label: 'パーカー', color: '#e2643c', sleeve: 'long' },
  { id: 'suit', label: 'スーツ', color: '#2b2f3a', sleeve: 'long', roughness: 0.5 },
  { id: 'doctor', label: '白衣', color: '#eef2f6', sleeve: 'long' },
  { id: 'space', label: '宇宙服', color: '#dfe6ef', sleeve: 'long', roughness: 0.35, metalness: 0.4 },
  { id: 'tank', label: 'タンク', color: '#d83a4a', sleeve: 'none' },
]

// ---- ボトムス ----
export type BottomType = 'pants' | 'shorts' | 'skirt'

export interface Bottom {
  id: string
  label: string
  color: string
  type: BottomType
  roughness?: number
}

export const BOTTOMS: Bottom[] = [
  { id: 'none', label: 'なし', color: '', type: 'pants' },
  { id: 'pants', label: 'ロングパンツ', color: '#3a4150', type: 'pants' },
  { id: 'jeans', label: 'ジーンズ', color: '#3b5a86', type: 'pants' },
  { id: 'shorts', label: 'ハーフパンツ', color: '#caa14a', type: 'shorts' },
  { id: 'skirt', label: 'スカート', color: '#e26aa0', type: 'skirt' },
]

export const DEFAULT_FACE_ID = 'smile'
export const DEFAULT_TOP_ID = 'none'
export const DEFAULT_BOTTOM_ID = 'none'

export const getFace = (id: string): Face => FACES.find((f) => f.id === id) ?? FACES[0]
export const getTop = (id: string): Top => TOPS.find((t) => t.id === id) ?? TOPS[0]
export const getBottom = (id: string): Bottom => BOTTOMS.find((b) => b.id === id) ?? BOTTOMS[0]
