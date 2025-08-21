import type { VerticalBarData, BarData } from '../interface/BarInterface'

export function createInitialMaxHeight(maxPentagram: number) {
  return Array(maxPentagram).fill([0, 0])
}

export function createInitialMaxHeightPerBar(
  maxPentagram: number,
  maxBar: number
) {
  const initialHeightPerBar: number[][][] = []
  for (let p = 0; p < maxPentagram; p++) {
    initialHeightPerBar[p] = []
    for (let b = 0; b < maxBar; b++) {
      initialHeightPerBar[p][b] = [0, 0]
    }
  }
  return initialHeightPerBar
}

export function createInitialPentagramsData(
  maxBar: number,
  maxPentagram: number
) {
  const initialData: VerticalBarData[] = []
  for (let barIndex = 0; barIndex < maxBar; barIndex++) {
    const barContent: BarData[] = []
    for (
      let pentagramIndex = 0;
      pentagramIndex < maxPentagram;
      pentagramIndex++
    ) {
      barContent.push({
        currentNotes: [],
        claveIndex: 0,
        claveVisible: false
      })
    }
    initialData.push({ allBar: barContent, clefVisible: false })
  }
  return initialData
}
