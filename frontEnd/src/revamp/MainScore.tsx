import { useState, useRef } from 'preact/hooks'
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
  const [position, setPosition] = useState({ x: 0, y: 0 })

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

  const dragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })

  function onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return // solo click izquierdo
    dragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    setPosition((pos) => ({ x: pos.x + dx, y: pos.y + dy }))
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }

  function onMouseUp() {
    dragging.current = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

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
      <>
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            zIndex: 1,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <MenuButtons />
          {selectedNote.currentPentagram !== -1 &&
            mode === DISPLAY_MODE.SELECT_NOTE && (
              <aside
                style={{
                  width: '20%',
                  height: '100%',
                  backgroundColor: 'rgb(202, 202, 202)',
                  borderTopRightRadius: '2%',
                  borderBottomRightRadius: '2%',
                  pointerEvents: 'auto',
                  wordBreak: 'break-all'
                }}
              >
                {' Selected Note: '}
                {actualNote?.name}
                {actualNote?.scale}
                <br />
                {'Midi Value: '}
                {actualNote?.midiValue}
                <br />
                {'Note Info: '}
                {JSON.stringify(
                  allPentagramsData[selectedNote.barIndex].allBar[
                    selectedNote.currentPentagram
                  ].currentNotes[selectedNote.noteIndex].errors ?? ['No errors']
                )}
              </aside>
            )}
        </section>
        <section
          style={{
            position: 'absolute',
            cursor: dragging.current ? 'grabbing' : 'grab',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden'
          }}
          onMouseDown={onMouseDown}
        >
          <section
            style={{
              display: 'flex',
              width: 'auto',
              left: `calc(${position.x}px + 5%)`,
              top: `calc(20% + ${position.y}px)`,
              position: 'relative',
              transform: `scale(${initialScale * currentScale})`,
              transformOrigin: 'top left'
            }}
          >
            {memoizedBarBoxes}
          </section>
        </section>
      </>
    </MainScoreContext.Provider>
  )
}
