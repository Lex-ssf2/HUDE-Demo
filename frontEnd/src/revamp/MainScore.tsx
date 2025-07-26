import { useState, useEffect, useMemo } from 'preact/hooks'
import { VerticalPentagram } from './components/VerticalPentagram'
import { MainScoreContext } from './context/DisplayContext'
import {
  type SelectedNote,
  type VerticalBarData,
  type BarData
} from './interface/types'
import { DISPLAY_MODE } from './enums/mode'
import {
  CIRCLE_RADIUS,
  LINE_DIFF,
  MAX_NOTE_SIZE,
  START_BAR_COUNT,
  START_PENTAGRAM_COUNT
} from './enums/constants'
import {
  ALL_POSIBLE_NOTES,
  MIDI_BASE_VALUE,
  NOTE_DURATION,
  SEMITONE_DIFF
} from './enums/Notes'

/**
 *
 * MainScore is just the full music scoreSheet
 *
 */

export function MainScore() {
  const [maxPentagram, setMaxPentagram] = useState<number>(
    START_PENTAGRAM_COUNT
  )
  const [maxBar, setMaxBar] = useState<number>(START_BAR_COUNT)
  const [mode, setMode] = useState<number>(DISPLAY_MODE.SELECT_NOTE)
  const [currentNoteSize, setCurrentNoteSize] = useState(1)
  const [selectedNote, setSelectedNote] = useState<SelectedNote>({
    barIndex: -1,
    noteIndex: -1,
    currentPentagram: -1
  })
  //This is to make all Bar the same size in X Pentagram
  const [maxHeight, setMaxHeight] = useState<number[][]>(() =>
    Array(maxPentagram).fill([0, 0])
  )
  //Comparing all Bar size to keep the maximum between pentagram
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
  //Initializes new bars and pentagram
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
    //Resets removed bars
    setMaxHeight(() => Array(maxPentagram).fill([0, 0]))
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

  //Checks maxHeight per bar
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

  //Handles selected note
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
      if (mode === DISPLAY_MODE.SELECT_NOTE) {
        /*
        IMPORTANTE AÑADIR INFO DE LA CLAVE QUE TIENE LA BARRA
        */
        let newCy = actualNote.cy
        switch (event.key) {
          case 'ArrowUp':
            newCy -= LINE_DIFF / 2
            break
          case 'ArrowDown':
            newCy += LINE_DIFF / 2
            break
          default:
            return
        }
        const GSecondLine = 5
        const difference = ALL_POSIBLE_NOTES.length - GSecondLine
        const startNumScale = 5
        const noteIndex =
          (ALL_POSIBLE_NOTES.length +
            GSecondLine -
            (newCy % ALL_POSIBLE_NOTES.length)) %
          ALL_POSIBLE_NOTES.length
        const actualNoteName = ALL_POSIBLE_NOTES[noteIndex]
        const scaleNum =
          startNumScale + Math.floor((GSecondLine - difference - newCy / 8) / 7)
        //console.log(scaleNum)
        const midiValue =
          MIDI_BASE_VALUE[noteIndex] + (scaleNum - 1) * SEMITONE_DIFF
        const updatedNote = {
          ...actualNote,
          cy: newCy,
          midiValue,
          scaleNum,
          noteName: actualNoteName
        }
        //console.log(updatedNote)
        updatedNotes[selectedNote.noteIndex] = updatedNote
        tmpAllBars[selectedNote.barIndex].allBar[
          selectedNote.currentPentagram
        ].currentNotes = updatedNotes
        setAllPentagramsData(tmpAllBars)
      }
    }

    if (mode === DISPLAY_MODE.REMOVE_NOTE) {
      updatedNotes.splice(selectedNote.noteIndex, 1)
      let lastSize = 1
      let tmpSize = CIRCLE_RADIUS + 10
      for (let i = 0; i < updatedNotes.length; i++) {
        lastSize = updatedNotes[i].noteDuration
        updatedNotes[i].cx = tmpSize
        tmpSize += MAX_NOTE_SIZE / lastSize + CIRCLE_RADIUS
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
  //console.log(allPentagramsData)
  const sendCurrentData = async () => {
    try {
      const response = await fetch('http://172.16.0.6:5555/revision/echojson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(allPentagramsData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: VerticalBarData[] = await response.json()
      setAllPentagramsData(data)
      console.log('Data fetched and state updated successfully:', data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  return (
    <MainScoreContext.Provider
      value={{
        maxHeight,
        setMaxHeightPerBar,
        maxPentagram,
        maxBar,
        setMaxBar,
        allPentagramsData,
        setAllPentagramsData,
        mode,
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
        <button onClick={() => setMode(DISPLAY_MODE.ADD_BAR)}>Bar++</button>
        <button onClick={() => setMode(DISPLAY_MODE.REMOVE_BAR)}>Bar--</button>
        <button onClick={() => setMode(DISPLAY_MODE.SELECT_NOTE)}>
          Select
        </button>
        <button onClick={() => setMode(DISPLAY_MODE.ADD_NOTE)}>Add</button>
        <button
          onClick={() => {
            setMode(DISPLAY_MODE.REMOVE_NOTE)
            setSelectedNote({
              barIndex: -1,
              noteIndex: -1,
              currentPentagram: -1
            })
          }}
        >
          Remove
        </button>
        <button onClick={() => setCurrentNoteSize(NOTE_DURATION.NEGRA)}>
          Negra
        </button>
        <button onClick={() => setCurrentNoteSize(NOTE_DURATION.BLANCA)}>
          Blanca
        </button>
        <button onClick={() => setCurrentNoteSize(NOTE_DURATION.REDONDA)}>
          Redonda
        </button>
        <button onClick={sendCurrentData}>Fetching</button>
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
