import { useState, useRef, useEffect } from 'preact/hooks'
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
import { SplendidGrandPiano } from 'smplr'
import { getNoteInfo } from './utils/utils'
import type { VerticalBarData } from './interface/BarInterface'

/**
 *
 * MainScore is just the full music scoreSheet
 *
 */
export function MainScore() {
  const [maxPentagram, setMaxPentagram] = useState<number>(
    START_PENTAGRAM_COUNT
  )
  const [hasLoadedFile, setHasLoadedFile] = useState<boolean>(false)
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
  const [midiPlayer, setMidiPlayer] = useState<SplendidGrandPiano | null>(null)
  const [midiPlayerContext, setMidiPlayerContext] =
    useState<AudioContext | null>(null)
  useEffect(() => {
    const initPiano = async () => {
      if (!midiPlayer && !midiPlayerContext) {
        console.log('Please wait :)')
        const context = new AudioContext()
        setMidiPlayerContext(context)
        const piano = await new SplendidGrandPiano(context).load
        console.log('Piano initialized')
        setMidiPlayer(piano)
      }
    }
    initPiano()
  }, [midiPlayer])

  async function loadNotes() {
    if (!midiPlayer || !midiPlayerContext) {
      console.error('Piano not initialized')
      return
    }
    midiPlayer.stop()
    midiPlayerContext.resume()
    console.log('Loading notes...')
    const BPM = 60 / 120
    const copyPentagrams = [...allPentagramsData]
    const allBars = copyPentagrams.length
    let maxTime = 0
    for (let bar = 0; bar < allBars; bar++) {
      const currentBar: VerticalBarData = copyPentagrams[bar]
      const now = midiPlayerContext.currentTime + maxTime
      for (
        let pentagram = 0;
        pentagram < currentBar.allBar.length;
        pentagram++
      ) {
        let acum = now
        const currentPentagram = currentBar.allBar[pentagram]
        for (
          let note = 0;
          note < currentPentagram.currentNotes.length;
          note++
        ) {
          const actualNote = currentPentagram.currentNotes[note]
          const [currentNoteName, currentNoteScale] = getNoteInfo({
            currentBar: currentPentagram,
            currentNote: actualNote
          })
          midiPlayer.start({
            note: `${currentNoteName}${currentNoteScale}`,
            velocity: 80,
            time: acum,
            duration: (BPM * 4) / actualNote.noteDuration,
            onStart: () => {
              const updatePentagrams = [...allPentagramsData]

              updatePentagrams[bar].allBar[pentagram].currentNotes[
                note
              ].status = 'error'
              if (note !== 0) {
                updatePentagrams[bar].allBar[pentagram].currentNotes[
                  note - 1
                ].status = 'ok'
              } else {
                if (bar !== 0) {
                  const lastNote =
                    updatePentagrams[bar - 1].allBar[pentagram].currentNotes
                      .length - 1
                  updatePentagrams[bar - 1].allBar[pentagram].currentNotes[
                    lastNote
                  ].status = 'ok'
                  updatePentagrams[bar - 1].tickNumber++
                }
              }
              updatePentagrams[bar].tickNumber++
              setAllPentagramsData(updatePentagrams)
              console.log(
                'Playing note:',
                `${currentNoteName}${currentNoteScale}`
              )
            },
            onEnded: () => {
              const updatePentagrams = [...allPentagramsData]
              if (
                updatePentagrams[bar].allBar[pentagram].currentNotes[note]
                  .status === 'error'
              ) {
                updatePentagrams[bar].allBar[pentagram].currentNotes[
                  note
                ].status = 'ok'
                updatePentagrams[bar].tickNumber++
                setAllPentagramsData(updatePentagrams)
              }
            }
          })
          acum += (BPM * 4) / actualNote.noteDuration
        }
        acum -= midiPlayerContext.currentTime
        maxTime = Math.max(maxTime, acum)
      }
    }
  }

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
  }

  function onTouchStart(e: TouchEvent) {
    if (!e.touches || e.touches.length !== 1 || dragging.current) return
    dragging.current = true
    const touch = e.touches[0]
    lastMouse.current = { x: touch.clientX, y: touch.clientY }
  }

  function onTouchMove(e: TouchEvent) {
    if (!dragging.current || !e.touches || e.touches.length !== 1) return
    e.preventDefault()
    const touch = e.touches[0]
    const dx = touch.clientX - lastMouse.current.x
    const dy = touch.clientY - lastMouse.current.y
    setPosition((pos) => ({ x: pos.x + dx, y: pos.y + dy }))
    lastMouse.current = { x: touch.clientX, y: touch.clientY }
  }

  function onTouchEnd() {
    dragging.current = false
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
        setCurrentScale,
        hasLoadedFile,
        setHasLoadedFile
      }}
    >
      <>
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            zIndex: 1,
            width: '99%',
            height: '99%',
            pointerEvents: 'none'
          }}
        >
          <MenuButtons playMusic={loadNotes} />
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
            width: '99%',
            height: '99%',
            overflow: 'hidden'
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <section
            style={{
              display: 'flex',
              width: 'auto',
              height: 'auto',
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
