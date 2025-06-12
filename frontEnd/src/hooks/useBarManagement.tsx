import { useEffect, useState } from 'preact/hooks'
import { useContext } from 'preact/hooks'
import { DisplayPentagramaContext } from '../context/DisplayContext'
import { DISPLAY_MODE } from '../enums/Mode'
import type { BarData } from '../interfaces/PentagramaInterface'

/**
 * Custom hook to insert or remove bars based on context mode.
 * @returns [bars, setBars] - The array of bar data and its setter.
 */
export function useBarManagement() {
  const [bars, setBars] = useState<BarData[]>([])
  const contexto = useContext(DisplayPentagramaContext)

  if (!contexto) {
    console.error(
      'useBarManagement must be used within a DisplayPentagramaContext.Provider'
    )
    return [bars, setBars] as const
  }

  const { extraBar, setExtraBar, mode } = contexto

  useEffect(() => {
    if (extraBar === -1) return

    setBars((prevBars) => {
      const tempBars = [...prevBars]
      const newBarId = `bar-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`

      if (mode === DISPLAY_MODE.REMOVE_BAR) {
        if (extraBar >= 0 && extraBar < tempBars.length) {
          tempBars.splice(extraBar, 1)
        }
      } else {
        tempBars.splice(extraBar + 1, 0, { id: newBarId, notes: [] })
      }
      return tempBars
    })

    setExtraBar(-1) // Reset the trigger clicking the same dumb bar and allow "cascade"
  }, [extraBar, setExtraBar, mode])

  return [bars, setBars] as const
}
