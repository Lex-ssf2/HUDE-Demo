import { useState } from 'preact/hooks'
import { MainScoreContext } from './context/DisplayContext'
import type { SelectedNote } from './interface/types'
import { DISPLAY_MODE } from './enums/mode'
import { START_BAR_COUNT, START_PENTAGRAM_COUNT } from './enums/constants'
import { MenuButtons } from './components/MenuButtons'
import { usePentagramsData } from './hook/usePentagramsData'
import { useSelectedNoteHandler } from './utils/useSelectedNoteHandler'
import { useActualNote } from './hook/useActualNote'
import { useBarUniqueIds } from './hook/useBarUniqueIds'
import { useMemoizedBarBoxes } from './hook/useMemoizedBarBoxes'
import { useInitialScale } from './utils/useInitialScale'

/**
 *
 * MainScore is just the full music scoreSheet
 *
 */
export function MainScore() {
  const [maxPentagram, setMaxPentagram] = useState<number>(
    START_PENTAGRAM_COUNT
  )
  const [initialScale, setInitialScale] = useState(0)
  const [currentScale, setCurrentScale] = useState(1)
  const [maxBar, setMaxBar] = useState<number>(START_BAR_COUNT)
  const [mode, setMode] = useState<number>(DISPLAY_MODE.SELECT_NOTE)
  const [currentNoteSize, setCurrentNoteSize] = useState(1)
  const [selectedNote, setSelectedNote] = useState<SelectedNote>({
    barIndex: -1,
    noteIndex: -1,
    currentPentagram: -1
  })

  const {
    allPentagramsData,
    setAllPentagramsData,
    maxHeight,
    setMaxHeightPerBar
  } = usePentagramsData(maxPentagram, maxBar)

  useSelectedNoteHandler(
    selectedNote,
    allPentagramsData,
    setAllPentagramsData,
    mode,
    setSelectedNote
  )

  const actualNote = useActualNote(selectedNote, allPentagramsData)

  useInitialScale(setInitialScale)

  const barUniqueIds = useBarUniqueIds(maxBar)
  const memoizedBarBoxes = useMemoizedBarBoxes(barUniqueIds)

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
        setSelectedNote,
        setCurrentScale
      }}
    >
      <MenuButtons actualNote={actualNote} />
      <section
        style={{
          display: 'flex',
          width: 'auto',
          transform: `scale(${initialScale * currentScale})`,
          transformOrigin: 'top left'
        }}
      >
        {memoizedBarBoxes}
      </section>
    </MainScoreContext.Provider>
  )
}
