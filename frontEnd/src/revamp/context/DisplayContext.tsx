import { createContext } from 'preact/compat'
import type { Dispatch, SetStateAction } from 'preact/compat'
import type { CircleData, VerticalBarData } from '../interface/BarInterface'

export const DisplayVerticalBarContext = createContext<{
  mode: number
  setMode: Dispatch<SetStateAction<number>>
  currentNote: CircleData | null
  setCurrentNote: Dispatch<SetStateAction<CircleData | null>>
  svgViewboxWidth: number
  setSvgViewboxWidth: Dispatch<SetStateAction<number>>
  svgViewboxHeight: number
  setSvgViewboxHeight: Dispatch<SetStateAction<number>>
  currentNoteSize: number
  setCurrentNoteSize: Dispatch<SetStateAction<number>>
} | null>(null)

export const MainScoreContext = createContext<{
  maxHeight: number[][]
  setMaxHeightPerBar: Dispatch<SetStateAction<number[][][]>>
  maxPentagram: number
  setMaxPentagram: Dispatch<SetStateAction<number>>
  allPentagramsData: VerticalBarData[]
  setAllPentagramsData: (data: VerticalBarData[]) => void
} | null>(null)
