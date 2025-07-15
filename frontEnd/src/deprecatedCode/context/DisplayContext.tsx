import { createContext } from 'preact/compat'
import type { Dispatch, SetStateAction } from 'preact/compat'
import type {
  BarData,
  PentagramaState,
  SelectedNote
} from '../interfaces/PentagramaInterface'

export const DisplayPentagramaContext = createContext<{
  mode: number
  setMode: Dispatch<SetStateAction<number>>
  selectedBar: number
  setSelectedBar: Dispatch<SetStateAction<number>>
  scrollLeft: number
  setScrollLeft: Dispatch<SetStateAction<number>>
  allPentagramsData: PentagramaState[]
  setAllPentagramsData: (data: PentagramaState[]) => void
  updatePentagramBars: (pentagramId: string, newBars: BarData[]) => void
  visibleUpdate: boolean
  setVisibleUpdate: Dispatch<SetStateAction<boolean>>
  selectNote: SelectedNote | null
  setSelectNote: Dispatch<SetStateAction<SelectedNote | null>>
  noteDuration: number
  setNoteDuration: Dispatch<SetStateAction<number>>
} | null>(null)
