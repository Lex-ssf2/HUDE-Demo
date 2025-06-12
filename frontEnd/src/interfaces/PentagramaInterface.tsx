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
}
export interface BarData {
  id: string
  notes: NoteData[]
}
