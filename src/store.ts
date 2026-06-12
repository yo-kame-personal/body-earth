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

interface BodyState {
  /** 0 = 体表（皮膚）、1 = 最深部（骨格・内臓） */
  depth: number
  selectedId: string | null
  /** 断面表示モード（体の前半分をクリップ） */
  clip: boolean
  setDepth: (depth: number) => void
  select: (id: string | null) => void
  toggleClip: () => void
}

export const useBodyStore = create<BodyState>((set) => ({
  depth: initialDepth(),
  selectedId: null,
  clip: initialClip(),
  setDepth: (depth) => set({ depth: Math.min(1, Math.max(0, depth)) }),
  select: (id) => set({ selectedId: id }),
  toggleClip: () => set((s) => ({ clip: !s.clip })),
}))
