import { create } from 'zustand'

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

interface BodyState {
  /** 0 = 体表（皮膚）、1 = 最深部（骨格・内臓） */
  depth: number
  selectedId: string | null
  /** 断面表示モード（体をクリップ平面で切る） */
  clip: boolean
  /** 断面の切る深さ 0=手前だけ薄く / 1=背中側まで深く */
  clipPos: number
  setDepth: (depth: number) => void
  select: (id: string | null) => void
  toggleClip: () => void
  setClipPos: (clipPos: number) => void
}

export const useBodyStore = create<BodyState>((set) => ({
  depth: initialDepth(),
  selectedId: null,
  clip: initialClip(),
  clipPos: initialClipPos(),
  setDepth: (depth) => set({ depth: Math.min(1, Math.max(0, depth)) }),
  select: (id) => set({ selectedId: id }),
  toggleClip: () => set((s) => ({ clip: !s.clip })),
  setClipPos: (clipPos) => set({ clipPos: Math.min(1, Math.max(0, clipPos)) }),
}))
