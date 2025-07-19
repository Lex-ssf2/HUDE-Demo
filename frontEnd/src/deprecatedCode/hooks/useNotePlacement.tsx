import { useCallback } from 'preact/hooks'
import type { RefObject } from 'preact'
import type {
  LineElement,
  BarData,
  NoteData
} from '../interfaces/PentagramaInterface'
import { noteSize } from '../home'
import { allPosibleNotes } from '../../revamp/enums/Notes'

/**
 * Custom hook for handling the logic of placing a new note on a bar.
 * @param allLines An array of LineElement for calculating closest Y position.
 * @param pentagramRef Ref to the main pentagram container.
 * @param barsContainerRef Ref to the scrollable bars container.
 * @param setBars Setter function for the bars state.
 * @returns A useCallback-wrapped function to handle note placement.
 */

export function useNotePlacement(
  allLines: LineElement[],
  pentagramRef: RefObject<HTMLElement>,
  barsContainerRef: RefObject<HTMLElement>,
  setBars: (updater: (prevBars: BarData[]) => BarData[]) => void
) {
  const addNoteToBar = useCallback(
    (barId: string, noteDuration: number, event: MouseEvent) => {
      if (!pentagramRef.current || !barsContainerRef.current) return

      const pentagramRect = pentagramRef.current.getBoundingClientRect()
      const clickedBarRect = (
        event.currentTarget as HTMLElement
      ).getBoundingClientRect()

      const actualClickXRelativeToBar = event.clientX - clickedBarRect.left
      const actualClickYGlobalToPentagram = event.clientY - pentagramRect.top

      let closestY: number = 0
      let minDistance = Infinity

      allLines.forEach((lineData) => {
        const lineY = lineData.y
        const spaceY = lineData.y + noteSize / 2 // A pentagram has 5 lines and 4 spaces
        ;[lineY, spaceY].forEach((y) => {
          const distance = Math.abs(actualClickYGlobalToPentagram - y)
          if (distance < minDistance) {
            minDistance = distance
            closestY = y
          }
        })
      })
      const actualNoteNumber =
        ((allLines[allLines.length - 1].y - closestY) / noteSize) * 2 + 1

      const actualNoteName = actualNoteNumber % allPosibleNotes.length

      console.log(allPosibleNotes[actualNoteName])
      const newNote: NoteData = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        x: actualClickXRelativeToBar,
        y: closestY,
        actualSize: (1 / noteDuration) * 100, // WIP,
        noteName: allPosibleNotes[actualNoteName],
        noteNumber: actualNoteNumber,
        currentClassId: 'nota',
        duration: noteDuration
      }

      setBars((prevBars) =>
        prevBars.map((bar) =>
          bar.id === barId ? { ...bar, notes: [...bar.notes, newNote] } : bar
        )
      )
    },
    [allLines, pentagramRef, barsContainerRef, setBars]
  )

  return addNoteToBar
}
