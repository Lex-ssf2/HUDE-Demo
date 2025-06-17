import { useCallback, useContext, useEffect, useRef } from 'preact/hooks'
import { ClaveSol } from '../assets/claves'
import { DisplayPentagramaContext } from '../context/DisplayContext'
import { DISPLAY_MODE } from '../enums/Mode'
import { PentagramaBar } from './PentagramaBar'

//Hooks
import { useSynchronizedScroll } from '../hooks/useSynchronizedScroll'
import { useBarManagement } from '../hooks/useBarManagement'
import { useNotePlacement } from '../hooks/useNotePlacement'
import { usePentagramLines } from '../hooks/usePentagramLines'
import { allPosibleNotes } from '../enums/Notes'

/** You know what this does */

export function Pentagrama({
  pentagramId,
  initialBars,
  barWidths // Recibimos la nueva prop de anchos de barra
}: {
  pentagramId: string
  initialBars: any[]
  barWidths: number[] // Definimos el tipo
}) {
  const pentagramRef = useRef<HTMLElement>(null)
  const barsContainerRef = useRef<HTMLElement>(null)
  const claveRef = useRef<SVGSVGElement | null>(null)

  const contexto = useContext(DisplayPentagramaContext)
  if (!contexto) return null

  const {
    mode,
    setSelectedBar,
    updatePentagramBars,
    visibleUpdate,
    selectNote,
    setSelectNote,
    noteDuration
  } = contexto

  const allLines = usePentagramLines()
  const [bars, setBars] = useBarManagement(initialBars)
  useSynchronizedScroll(barsContainerRef)

  const addNoteToBar = useNotePlacement(
    allLines,
    pentagramRef,
    barsContainerRef,
    setBars
  )

  const handleClickOnPentagram = useCallback(() => {
    if (mode !== DISPLAY_MODE.ADD_BAR) return
    if (pentagramRef.current && claveRef.current) {
      setSelectedBar(bars.length)
    }
  }, [mode, pentagramRef, claveRef, setSelectedBar, bars.length])

  const handleClickOnBar = useCallback(
    (barId: string, event: MouseEvent, currentId: number) => {
      event.stopPropagation() //To avoid calling multiple functions :p

      if (mode === DISPLAY_MODE.ADD_BAR || mode === DISPLAY_MODE.REMOVE_BAR) {
        setSelectedBar(currentId)
        return
      }
      if (mode === DISPLAY_MODE.ADD_NOTE && addNoteToBar != null) {
        addNoteToBar(barId, noteDuration, event)
        return
      }
    },
    [mode, setSelectedBar, addNoteToBar, noteDuration]
  )
  const handleClickOnNote = useCallback(
    (event: MouseEvent, noteIndex: number, barIndex: number) => {
      if (mode === DISPLAY_MODE.SELECT || mode === DISPLAY_MODE.REMOVE_NOTE) {
        event.stopPropagation()
        setSelectNote({
          barIndex,
          noteIndex,
          note: bars[barIndex].notes[noteIndex],
          currentPentagram: pentagramId
        })
        console.log('Nota seleccionada:', bars[barIndex].notes[noteIndex])
      }
    },
    [mode, bars]
  )
  useEffect(() => {
    if (selectNote && mode === DISPLAY_MODE.REMOVE_NOTE) {
      const { barIndex, noteIndex, currentPentagram } = selectNote
      if (currentPentagram != pentagramId) return
      const copyBars = [...bars]
      copyBars[barIndex].notes?.splice(noteIndex, 1)
      setBars(copyBars)
      setSelectNote(null)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectNote && mode === DISPLAY_MODE.SELECT) {
        const { barIndex, noteIndex, note, currentPentagram } = selectNote
        if (currentPentagram != pentagramId) return
        const copyBars = [...bars]
        let anteriorIndex
        let tmpNote
        let indexByNote
        if (copyBars[barIndex].notes[noteIndex])
          switch (event.key) {
            case 'ArrowUp':
              copyBars[barIndex].notes[noteIndex].y = (note.y || 0) - 10
              indexByNote = allPosibleNotes.indexOf(
                copyBars[barIndex].notes[noteIndex].noteName
              )
              copyBars[barIndex].notes[noteIndex].noteName =
                allPosibleNotes[(indexByNote + 1) % allPosibleNotes.length]
              copyBars[barIndex].notes[noteIndex].noteNumber++
              setBars(copyBars)
              setSelectNote({
                barIndex,
                noteIndex,
                note: copyBars[barIndex].notes[noteIndex],
                currentPentagram
              })
              break
            case 'ArrowDown':
              copyBars[barIndex].notes[noteIndex].y = (note.y || 0) + 10
              indexByNote = allPosibleNotes.indexOf(
                copyBars[barIndex].notes[noteIndex].noteName
              )
              copyBars[barIndex].notes[noteIndex].noteName =
                allPosibleNotes[
                  (indexByNote - 1 + allPosibleNotes.length) %
                    allPosibleNotes.length
                ]
              copyBars[barIndex].notes[noteIndex].noteNumber--
              setBars(copyBars)
              setSelectNote({
                barIndex,
                noteIndex,
                note: copyBars[barIndex].notes[noteIndex],
                currentPentagram
              })
              break
            case 'ArrowLeft':
              anteriorIndex = Math.max(noteIndex - 1, 0)
              tmpNote = copyBars[barIndex].notes[anteriorIndex]
              copyBars[barIndex].notes[anteriorIndex] =
                copyBars[barIndex].notes[noteIndex]
              copyBars[barIndex].notes[noteIndex] = tmpNote
              setSelectNote({
                barIndex,
                noteIndex: anteriorIndex,
                note: copyBars[barIndex].notes[anteriorIndex],
                currentPentagram
              })
              setBars(copyBars)
              break
            case 'ArrowRight':
              anteriorIndex = Math.min(
                noteIndex + 1,
                copyBars[barIndex].notes.length - 1
              )
              tmpNote = copyBars[barIndex].notes[anteriorIndex]
              copyBars[barIndex].notes[anteriorIndex] =
                copyBars[barIndex].notes[noteIndex]
              copyBars[barIndex].notes[noteIndex] = tmpNote
              setSelectNote({
                barIndex,
                noteIndex: anteriorIndex,
                note: copyBars[barIndex].notes[anteriorIndex],
                currentPentagram
              })
              setBars(copyBars)
              break
            default:
              break
          }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectNote, bars, mode, setBars])
  useEffect(() => {
    updatePentagramBars(pentagramId, bars)
  }, [bars, pentagramId, visibleUpdate])

  const claveFullSize =
    claveRef.current && pentagramRef.current
      ? claveRef.current.getBoundingClientRect().x -
        pentagramRef.current.getBoundingClientRect().x +
        claveRef.current.getBoundingClientRect().width
      : 0

  return (
    <section
      className="pentagrama"
      onClick={handleClickOnPentagram}
      ref={pentagramRef}
    >
      <ClaveSol refProps={claveRef} />
      {allLines.map((lineData) => lineData.vnode)}
      <section
        ref={barsContainerRef}
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          flexShrink: 0,
          flexGrow: 1,
          marginLeft: `${claveFullSize}px`
        }}
      >
        {bars.map((barData, index) => (
          <PentagramaBar
            key={barData.id}
            barData={barData}
            index={index}
            onClick={handleClickOnBar}
            noteHandler={handleClickOnNote}
            // Pasamos el ancho específico para esta barra
            barWidth={barWidths[index] || 200}
          />
        ))}
      </section>
    </section>
  )
}
