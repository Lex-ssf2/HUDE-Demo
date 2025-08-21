import { useState, useEffect } from 'preact/hooks'
import type { VerticalBarData } from '../interface/BarInterface'
import {
  createInitialPentagramsData,
  createInitialMaxHeight,
  createInitialMaxHeightPerBar
} from '../utils/PentagramInitializer'

export function usePentagramsData(maxPentagram: number, maxBar: number) {
  const [allPentagramsData, setAllPentagramsData] = useState<VerticalBarData[]>(
    () => createInitialPentagramsData(maxBar, maxPentagram)
  )
  const [maxHeight, setMaxHeight] = useState<number[][]>(() =>
    createInitialMaxHeight(maxPentagram)
  )
  const [maxHeightPerBar, setMaxHeightPerBar] = useState<number[][][]>(() =>
    createInitialMaxHeightPerBar(maxPentagram, maxBar)
  )

  useEffect(() => {
    setAllPentagramsData((prevData) => {
      const newAllPentagramsData = Array.from(
        { length: maxBar },
        (_, barIndex) => {
          const prevBar = prevData[barIndex]
          const newBarContent = Array.from(
            { length: maxPentagram },
            (_, pentagramIndex) => {
              return (
                prevBar.allBar[pentagramIndex] ?? {
                  currentNotes: [],
                  claveIndex: 0,
                  claveVisible: false
                }
              )
            }
          )
          return {
            allBar: newBarContent,
            clefVisible: prevBar?.clefVisible ?? false
          }
        }
      )
      return newAllPentagramsData
    })
    setMaxHeight(() => createInitialMaxHeight(maxPentagram))
    setMaxHeightPerBar((oldMaxHeightBar) => {
      const copyHeight = [...oldMaxHeightBar]
      const newHeightPerBar: number[][][] = []
      for (let p = 0; p < maxPentagram; p++) {
        newHeightPerBar[p] = []
        for (let b = 0; b < maxBar; b++) {
          if (copyHeight[p] && copyHeight[p][b])
            newHeightPerBar[p][b] = copyHeight[p][b]
          else newHeightPerBar[p][b] = [0, 0]
        }
      }
      return newHeightPerBar
    })
  }, [maxPentagram, maxBar])

  useEffect(() => {
    const newMaxHeight: number[][] = Array(maxPentagram)
      .fill(null)
      .map(() => [Infinity, -Infinity])

    for (let p = 0; p < maxPentagram; p++) {
      for (let b = 0; b < maxBar; b++) {
        const currentMinY = maxHeightPerBar[p]?.[b]?.[0]
        const currentMaxY = maxHeightPerBar[p]?.[b]?.[1]

        if (
          typeof currentMinY === 'number' &&
          typeof currentMaxY === 'number' &&
          !isNaN(currentMinY) &&
          !isNaN(currentMaxY)
        ) {
          newMaxHeight[p][0] = Math.min(newMaxHeight[p][0], currentMinY)
          newMaxHeight[p][1] = Math.max(newMaxHeight[p][1], currentMaxY)
        }
      }
    }

    if (JSON.stringify(newMaxHeight) !== JSON.stringify(maxHeight)) {
      const finalizedMaxHeight = newMaxHeight.map((range) => [
        range[0] === Infinity ? 0 : range[0],
        range[1] === -Infinity ? 0 : range[1]
      ])
      setMaxHeight(finalizedMaxHeight)
    }
  }, [maxHeightPerBar, maxPentagram, maxBar, maxHeight])

  return {
    allPentagramsData,
    setAllPentagramsData,
    maxHeight,
    setMaxHeightPerBar,
    maxHeightPerBar
  }
}
