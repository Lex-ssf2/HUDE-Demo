import type { VNode } from 'preact'

export interface LineElement {
  vnode: VNode
  y: number
}
export interface NoteData {
  id: string
  x: number
  y: number
  actualSize: number
  noteName: string
  noteNumber: number
  currentClassId: string
  duration: number
}
export interface BarData {
  id: string
  notes: NoteData[]
  naturalWidth?: number
}
export interface PentagramaState {
  id: string
  bars: BarData[]
}

export interface SelectedNote {
  barIndex: number
  noteIndex: number
  note: NoteData
  currentPentagram: string
}
