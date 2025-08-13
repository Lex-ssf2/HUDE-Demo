import { useEffect } from 'preact/hooks'
import { LINE_DIFF } from '../enums/constants'
import { DISPLAY_MODE } from '../enums/mode'
import type { VerticalBarData } from '../interface/BarInterface'
import type { SelectedNote, CircleData } from '../interface/types'
import { updatePosition } from '../utils/utils'

export function useSelectedNoteHandler(
  selectedNote: SelectedNote,
  allPentagramsData: VerticalBarData[],
  setAllPentagramsData: (data: VerticalBarData[]) => void,
  mode: number,
  setSelectedNote: (note: SelectedNote) => void
) {
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
        const updatedNote: CircleData = {
          ...actualNote,
          cy: newCy
        }
        updatedNotes[selectedNote.noteIndex] = updatedNote
        tmpAllBars[selectedNote.barIndex].allBar[
          selectedNote.currentPentagram
        ].currentNotes = updatedNotes
        setAllPentagramsData(tmpAllBars)
      }
    }

    if (mode === DISPLAY_MODE.REMOVE_NOTE) {
      updatedNotes.splice(selectedNote.noteIndex, 1)
      tmpAllBars[selectedNote.barIndex].allBar[
        selectedNote.currentPentagram
      ].currentNotes = updatedNotes
      ;[
        tmpAllBars[selectedNote.barIndex].allBar[selectedNote.currentPentagram]
      ] = updatePosition({
        currentBar:
          tmpAllBars[selectedNote.barIndex].allBar[
            selectedNote.currentPentagram
          ],
        indexBar: selectedNote.barIndex
      })
      setAllPentagramsData(tmpAllBars)
      setSelectedNote({ barIndex: -1, noteIndex: -1, currentPentagram: -1 })
    } else {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [selectedNote, allPentagramsData, mode])
}
