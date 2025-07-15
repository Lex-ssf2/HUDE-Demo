// src/MainScore.tsx

import { useState, useEffect, useMemo } from 'preact/hooks'
import { VerticalPentagram } from './components/VerticalPentagram'
import { MainScoreContext } from './context/DisplayContext'
import {
  type SelectedNote,
  type VerticalBarData,
  type BarData
} from './constants/types'
import { CIRCLE_RADIUS, IDEAL_SPACING } from './constants/constants'

export function MainScore() {
  const [maxPentagram, setMaxPentagram] = useState<number>(3)
  const [maxBar, setMaxBar] = useState<number>(2)
  const [mode, setMode] = useState<number>(0)
  const [currentNoteSize, setCurrentNoteSize] = useState(1)
  const [selectedNote, setSelectedNote] = useState<SelectedNote>({
    barIndex: -1,
    noteIndex: -1,
    currentPentagram: -1
  })

  const [maxHeight, setMaxHeight] = useState<number[][]>(() =>
    Array(maxPentagram).fill([0, 0])
  )
  const [maxHeightPerBar, setMaxHeightPerBar] = useState<number[][][]>(() => {
    const initialHeightPerBar: number[][][] = []
    for (let p = 0; p < maxPentagram; p++) {
      initialHeightPerBar[p] = []
      for (let b = 0; b < maxBar; b++) {
        initialHeightPerBar[p][b] = [0, 0]
      }
    }
    return initialHeightPerBar
  })

  const [allPentagramsData, setAllPentagramsData] = useState<VerticalBarData[]>(
    () => {
      const initialData: VerticalBarData[] = []
      for (let barIndex = 0; barIndex < maxBar; barIndex++) {
        const barContent: BarData[] = []
        for (
          let pentagramIndex = 0;
          pentagramIndex < maxPentagram;
          pentagramIndex++
        ) {
          barContent.push({ currentNotes: [] })
        }
        initialData.push({ allBar: barContent })
      }
      return initialData
    }
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
              return prevBar?.allBar[pentagramIndex] || { currentNotes: [] }
            }
          )
          return { allBar: newBarContent }
        }
      )
      return newAllPentagramsData
    })

    setMaxHeight(() => Array(maxPentagram).fill([0, 0]))

    setMaxHeightPerBar(() => {
      const newHeightPerBar: number[][][] = []
      for (let p = 0; p < maxPentagram; p++) {
        newHeightPerBar[p] = []
        for (let b = 0; b < maxBar; b++) {
          newHeightPerBar[p][b] = [0, 0]
        }
      }
      return newHeightPerBar
    })
  }, [maxPentagram, maxBar])

  useEffect(() => {
    const newMaxHeight: number[][] = Array(maxPentagram)
      .fill(null)
      .map(() => [Infinity, -Infinity])

    let needsUpdate = false
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
          needsUpdate = true
        }
      }
    }

    if (
      needsUpdate &&
      JSON.stringify(newMaxHeight) !== JSON.stringify(maxHeight)
    ) {
      const finalizedMaxHeight = newMaxHeight.map((range) => [
        range[0] === Infinity ? 0 : range[0],
        range[1] === -Infinity ? 0 : range[1]
      ])
      setMaxHeight(finalizedMaxHeight)
    }
  }, [maxHeightPerBar, maxPentagram, maxBar, maxHeight])
  useEffect(() => {
    if (
      selectedNote.barIndex === -1 ||
      selectedNote.noteIndex === -1 ||
      selectedNote.currentPentagram === -1
    ) {
      return
    }

    const tmpAllBars = [...allPentagramsData]
    const currentPentagramNotes =
      tmpAllBars[selectedNote.barIndex]?.allBar[selectedNote.currentPentagram]
        ?.currentNotes

    if (!currentPentagramNotes) {
      console.warn(
        `Notes for bar ${selectedNote.barIndex}, pentagram ${selectedNote.currentPentagram} not found.`
      )
      return
    }

    let updatedNotes = [...currentPentagramNotes]
    const actualNote = updatedNotes[selectedNote.noteIndex]

    if (!actualNote) {
      console.warn(`Note at position ${selectedNote.noteIndex} not found.`)
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (mode === 0) {
        let newCy = actualNote.cy
        switch (event.key) {
          case 'ArrowUp':
            newCy -= 10
            break
          case 'ArrowDown':
            newCy += 10
            break
          default:
            return
        }
        const updatedNote = { ...actualNote, cy: newCy }
        updatedNotes[selectedNote.noteIndex] = updatedNote
        tmpAllBars[selectedNote.barIndex].allBar[
          selectedNote.currentPentagram
        ].currentNotes = updatedNotes
        setAllPentagramsData(tmpAllBars)
      }
    }

    if (mode === 2) {
      updatedNotes.splice(selectedNote.noteIndex, 1)
      let lastSize = 1
      let tmpSize = 0
      for (let i = 0; i < updatedNotes.length; i++) {
        tmpSize += (CIRCLE_RADIUS + IDEAL_SPACING) * lastSize
        lastSize = updatedNotes[i].actualSize
        updatedNotes[i].cx = tmpSize
      }
      tmpAllBars[selectedNote.barIndex].allBar[
        selectedNote.currentPentagram
      ].currentNotes = updatedNotes
      setAllPentagramsData(tmpAllBars)
      setSelectedNote({ barIndex: -1, noteIndex: -1, currentPentagram: -1 })
    } else {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [
    selectedNote,
    allPentagramsData,
    mode,
    setAllPentagramsData,
    setSelectedNote
  ])

  const barUniqueIds = useMemo(() => {
    const ids: string[] = []
    for (let i = 0; i < maxBar; i++) {
      ids.push(`bar-${i}`)
    }
    return ids
  }, [maxBar])

  const memoizedBarBoxes = useMemo(() => {
    return barUniqueIds.map((id, i) => (
      <VerticalPentagram key={id} indexBar={i} />
    ))
  }, [barUniqueIds])

  return (
    <MainScoreContext.Provider
      value={{
        maxHeight,
        setMaxHeightPerBar,
        maxPentagram,
        setMaxPentagram,
        maxBar,
        setMaxBar,
        allPentagramsData,
        setAllPentagramsData,
        mode,
        setMode,
        currentNoteSize,
        setCurrentNoteSize,
        selectedNote,
        setSelectedNote
      }}
    >
      <div>
        <button onClick={() => setMaxPentagram((prev) => prev + 1)}>
          Pentagrama++
        </button>
        <button
          onClick={() => setMaxPentagram((prev) => Math.max(prev - 1, 1))}
        >
          Pentagrama--
        </button>
        <button onClick={() => setMaxBar((prev) => prev + 1)}>Bar++</button>
        <button onClick={() => setMaxBar((prev) => Math.max(prev - 1, 1))}>
          Bar--
        </button>
        <button onClick={() => setMode(0)}>Select</button>
        <button onClick={() => setMode(1)}>Add</button>
        <button
          onClick={() => {
            setMode(2)
            setSelectedNote({
              barIndex: -1,
              noteIndex: -1,
              currentPentagram: -1
            })
          }}
        >
          Remove
        </button>
        <button onClick={() => setCurrentNoteSize(1)}>Note Size 1</button>
        <button onClick={() => setCurrentNoteSize(2)}>Note Size 2</button>
        <button onClick={() => setCurrentNoteSize(4)}>Note Size 3</button>
      </div>
      <section
        style={{
          display: 'flex',
          border: '1px solid blue',
          height: '100%',
          width: '100%'
        }}
      >
        {memoizedBarBoxes}
      </section>
    </MainScoreContext.Provider>
  )
}
