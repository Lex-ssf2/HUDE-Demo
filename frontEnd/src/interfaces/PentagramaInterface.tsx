import type { VNode } from 'preact'

export interface LineElement {
  vnode: VNode
  y: number
}
export interface BarData {
  id: string
  x: number
}
export interface NoteData {
  id: string
  x: number
  y: number
}
export interface BarData {
  id: string
  x: number
  notes: NoteData[]
}
