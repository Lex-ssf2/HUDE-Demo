import { type StateUpdater } from 'preact/hooks'

export interface CircleData {
  id: number
  cy: number
  cx: number
  actualSize: number
}

export interface BarData {
  currentNotes: CircleData[]
}

export interface VerticalBarData {
  allBar: BarData[]
}

export interface SelectedNote {
  barIndex: number
  noteIndex: number
  currentPentagram: number
}

export interface SvgMovableBoxProps {
  onCircleAdded: (noteList: CircleData[]) => void
  id: string
  onCircleClicked: (barId: number, pentagramId: number, noteId: number) => void
  indexPentagram: number
  indexBar: number
}

export interface VerticalPentagramProps {
  indexBar: number
}

export interface DisplayVerticalBarContextType {
  setCurrentNote: StateUpdater<CircleData | null>
  currentNote: CircleData | null
  setSvgViewboxWidth: StateUpdater<number>
  svgViewboxWidth: number
  setSvgViewboxHeight: StateUpdater<number>
  svgViewboxHeight: number
  setCurrentNoteSize: StateUpdater<number>
  currentNoteSize: number
}

export interface MainScoreContextType {
  maxHeight: number[][]
  setMaxHeightPerBar: StateUpdater<number[][][]>
  maxPentagram: number
  setMaxPentagram: StateUpdater<number>
  maxBar: number
  setMaxBar: StateUpdater<number>
  allPentagramsData: VerticalBarData[]
  setAllPentagramsData: StateUpdater<VerticalBarData[]>
  mode: number
  setMode: StateUpdater<number>
  currentNoteSize: number
  setCurrentNoteSize: StateUpdater<number>
  selectedNote: SelectedNote
  setSelectedNote: StateUpdater<SelectedNote>
}

export interface UpdateWidthProps {
  maxPentagram: number
  indexBar: number
  allPentagramsData: VerticalBarData[]
}
