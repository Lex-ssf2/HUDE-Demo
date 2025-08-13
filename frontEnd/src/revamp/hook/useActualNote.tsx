import { useState, useEffect } from 'preact/hooks'
import type { VerticalBarData } from '../interface/BarInterface'
import type { SelectedNote, ActualNote, CircleData } from '../interface/types'
import { getNoteInfo } from '../utils/utils'

export function useActualNote(
  selectedNote: SelectedNote,
  allPentagramsData: VerticalBarData[]
) {
  const [actualNote, setActualNote] = useState<ActualNote | null>(null)
  useEffect(() => {
    if (
      allPentagramsData[selectedNote.barIndex] === undefined ||
      allPentagramsData[selectedNote.barIndex].allBar[
        selectedNote.currentPentagram
      ] === undefined
    )
      return
    const currentNote: CircleData =
      allPentagramsData[selectedNote.barIndex].allBar[
        selectedNote.currentPentagram
      ].currentNotes[selectedNote.noteIndex]
    if (currentNote === undefined) return
    const actualNote: ActualNote = { name: 'Z', midiValue: -1, scale: 5 }
    ;[actualNote.name, actualNote.scale, actualNote.midiValue] = getNoteInfo({
      currentBar:
        allPentagramsData[selectedNote.barIndex].allBar[
          selectedNote.currentPentagram
        ],
      currentNote: currentNote
    })
    setActualNote(actualNote)
  }, [selectedNote, allPentagramsData])
  return actualNote
}
