import { createContext } from 'preact/compat'
import type { Dispatch, SetStateAction } from 'preact/compat'

export const DisplayPentagramaContext = createContext<{
  mode: number
  setMode: Dispatch<SetStateAction<number>>
  selectedBar: number
  setSelectedBar: Dispatch<SetStateAction<number>>
  scrollLeft: number
  setScrollLeft: Dispatch<SetStateAction<number>>
} | null>(null)
