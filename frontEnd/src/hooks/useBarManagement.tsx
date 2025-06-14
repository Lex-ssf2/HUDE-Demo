import { useEffect, useState } from 'preact/hooks'
import { useContext } from 'preact/hooks'
import { DisplayPentagramaContext } from '../context/DisplayContext'
import { DISPLAY_MODE } from '../enums/Mode'
import type { BarData } from '../interfaces/PentagramaInterface'

/**
 * Custom hook to manage the insertion and removal of bars based on context mode.
 * It initializes with `initialBar` (if provided) or a default empty bar.
 *
 * @param initialBar Optional. An array of initial BarData to populate the pentagram.
 * @returns [bars, setBars] - The array of bar data and its setter.
 */
export function useBarManagement(initialBar?: BarData[]) {
  const [bars, setBars] = useState<BarData[]>(
    initialBar && initialBar.length > 0
      ? initialBar
      : [{ id: `bar-${Date.now()}-initial`, notes: [] }]
  )
  const contexto = useContext(DisplayPentagramaContext)

  if (!contexto) {
    console.error(
      'useBarManagement must be used within a DisplayPentagramaContext.Provider'
    )
    return [bars, setBars] as const
  }

  const { setSelectedBar, selectedBar, mode } = contexto

  useEffect(() => {
    if (selectedBar === -1) return

    setBars((prevBars) => {
      const tempBars = [...prevBars]
      const newBarId = `bar-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`

      if (mode === DISPLAY_MODE.REMOVE_BAR) {
        if (selectedBar >= 0 && selectedBar < tempBars.length) {
          tempBars.splice(selectedBar, 1)
        }
      } else if (mode === DISPLAY_MODE.ADD_BAR) {
        tempBars.splice(selectedBar + 1, 0, { id: newBarId, notes: [] })
      }
      return tempBars
    })
    setSelectedBar(-1) //This exist to allow clicking the same bar multiple times.
  }, [selectedBar, setSelectedBar, mode])

  return [bars, setBars] as const
}
