import type { VerticalBarData } from './BarInterface'

export interface CircleData {
  id: number
  cy: number
  cx: number
  /*noteName: string
  midiValue: number*/
  noteDuration: number
  //scaleNum: number
  status: string
}

export interface SelectedNote {
  barIndex: number
  noteIndex: number
  currentPentagram: number
}

export interface ActualNote {
  name: string
  scale: number
  midiValue: number
}

export interface SvgMovableBoxProps {
  onCircleAdded: (noteList: CircleData[]) => void
  onCircleClicked: (barId: number, pentagramId: number, noteId: number) => void
  indexPentagram: number
  indexBar: number
}

export interface VerticalPentagramProps {
  indexBar: number
}

export interface UpdateWidthProps {
  maxPentagram: number
  indexBar: number
  allPentagramsData: VerticalBarData[]
}
