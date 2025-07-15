import { createContext } from 'preact/compat'
import type { Dispatch, SetStateAction } from 'preact/compat'
import type { SelectedNote, VerticalBarData } from '../interface/BarInterface'

export const DisplayVerticalBarContext = createContext<{
  svgViewboxWidth: number
  svgViewboxHeight: number
  setSvgViewboxHeight: Dispatch<SetStateAction<number>>
} | null>(null)

export const MainScoreContext = createContext<{
  maxHeight: number[][]
  setMaxHeightPerBar: Dispatch<SetStateAction<number[][][]>>
  maxPentagram: number
  maxBar: number
  allPentagramsData: VerticalBarData[]
  setAllPentagramsData: (data: VerticalBarData[]) => void
  mode: number
  currentNoteSize: number
  setCurrentNoteSize: Dispatch<SetStateAction<number>>
  selectedNote: SelectedNote
  setSelectedNote: Dispatch<SetStateAction<SelectedNote>>
} | null>(null)
