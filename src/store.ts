import { create } from 'zustand'
import { DEFAULT_SKIN_ID, SKINS } from './data/skins'
import {
  BOTTOMS,
  DEFAULT_BOTTOM_ID,
  DEFAULT_FACE_ID,
  DEFAULT_TOP_ID,
  FACES,
  TOPS,
} from './data/dressup'

// URLの ?depth=0.7 で初期深度を指定できる（デバッグ・検証用）
function initialDepth(): number {
  const raw = new URLSearchParams(window.location.search).get('depth')
  if (raw === null) return 0
  const d = Number(raw)
  return Number.isFinite(d) ? Math.min(1, Math.max(0, d)) : 0
}

// URLの ?clip=1 で断面表示を初期ONにできる（デバッグ・検証用）
function initialClip(): boolean {
  return new URLSearchParams(window.location.search).get('clip') === '1'
}

// URLの ?clipPos=0.5 で断面の切る深さ(0..1)を指定できる（デバッグ・検証用）
function initialClipPos(): number {
  const raw = new URLSearchParams(window.location.search).get('clipPos')
  if (raw === null) return 0.5
  const v = Number(raw)
  return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.5
}

// URLの ?skin=gold で皮膚スキンの初期値を指定できる（共有・検証用）
function initialSkinId(): string {
  const raw = new URLSearchParams(window.location.search).get('skin')
  return raw && SKINS.some((s) => s.id === raw) ? raw : DEFAULT_SKIN_ID
}

// URLの ?face= / ?top= / ?bottom= できせかえの初期値を指定できる（共有・検証用）
function initialId(param: string, ids: { id: string }[], fallback: string): string {
  const raw = new URLSearchParams(window.location.search).get(param)
  return raw && ids.some((x) => x.id === raw) ? raw : fallback
}

interface BodyState {
  /** 0 = 体表（皮膚）、1 = 最深部（骨格・内臓） */
  depth: number
  selectedId: string | null
  /** 断面表示モード（体をクリップ平面で切る） */
  clip: boolean
  /** 断面の切る深さ 0=手前だけ薄く / 1=背中側まで深く */
  clipPos: number
  /** 皮膚レイヤーの着せ替えスキンID（src/data/skins.ts） */
  skinId: string
  /** きせかえ: 顔ID / トップスID / ボトムスID（src/data/dressup.ts） */
  faceId: string
  topId: string
  bottomId: string
  setDepth: (depth: number) => void
  select: (id: string | null) => void
  toggleClip: () => void
  setClipPos: (clipPos: number) => void
  setSkin: (skinId: string) => void
  setFace: (faceId: string) => void
  setTop: (topId: string) => void
  setBottom: (bottomId: string) => void
}

export const useBodyStore = create<BodyState>((set) => ({
  depth: initialDepth(),
  selectedId: null,
  clip: initialClip(),
  clipPos: initialClipPos(),
  skinId: initialSkinId(),
  faceId: initialId('face', FACES, DEFAULT_FACE_ID),
  topId: initialId('top', TOPS, DEFAULT_TOP_ID),
  bottomId: initialId('bottom', BOTTOMS, DEFAULT_BOTTOM_ID),
  setDepth: (depth) => set({ depth: Math.min(1, Math.max(0, depth)) }),
  select: (id) => set({ selectedId: id }),
  toggleClip: () => set((s) => ({ clip: !s.clip })),
  setClipPos: (clipPos) => set({ clipPos: Math.min(1, Math.max(0, clipPos)) }),
  setSkin: (skinId) => set({ skinId }),
  setFace: (faceId) => set({ faceId }),
  setTop: (topId) => set({ topId }),
  setBottom: (bottomId) => set({ bottomId }),
}))
