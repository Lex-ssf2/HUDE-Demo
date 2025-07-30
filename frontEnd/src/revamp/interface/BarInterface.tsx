import type { CircleData } from './types'

export interface SvgMovableBoxProps {
  onCircleAdded: (noteList: CircleData[]) => void
  id: string
  onCircleClicked: (
    indexBar: number,
    indexPentagrama: number,
    indexNote: number
  ) => void
  indexBar: number
  indexPentagram: number
}
export interface VerticalPentagramProps {
  indexBar: number
}

export interface VerticalBarData {
  allBar: BarData[]
}

export interface BarData {
  currentNotes: CircleData[]
  claveIndex: number
  claveVisible: boolean
}

export interface SelectedNote {
  barIndex: number
  noteIndex: number
  currentPentagram: number
}
