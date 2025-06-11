import { createContext } from 'preact/compat'

export const DisplayPentagramaContext = createContext<{
  mode: number
  setMode: (mode: number) => void
} | null>(null)
