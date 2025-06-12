import { useCallback, useContext, useRef } from 'preact/hooks'
import { ClaveSol } from '../assets/claves'
import { DisplayPentagramaContext } from '../context/DisplayContext'
import { DISPLAY_MODE } from '../enums/Mode'
import { PentagramaBar } from './PentagramaBar'

//Hooks
import { useSynchronizedScroll } from '../hooks/useSynchronizedScroll'
import { useBarManagement } from '../hooks/useBarManagement'
import { useNotePlacement } from '../hooks/useNotePlacement'
import { usePentagramLines } from '../hooks/usePentagramLines'

/** You know what this does */

export function Pentagrama() {
  const pentagramRef = useRef<HTMLElement>(null)
  const barsContainerRef = useRef<HTMLElement>(null)
  const claveRef = useRef<SVGSVGElement | null>(null)

  const contexto = useContext(DisplayPentagramaContext)
  if (!contexto) return null

  const { mode, setExtraBar } = contexto

  const allLines = usePentagramLines()
  const [bars, setBars] = useBarManagement()
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
      setExtraBar(bars.length)
    }
  }, [mode, pentagramRef, claveRef, setExtraBar, bars.length])

  const handleClickOnBar = useCallback(
    (barId: string, event: MouseEvent, currentId: number) => {
      event.stopPropagation() //To avoid calling multiple functions :p

      if (mode === DISPLAY_MODE.ADD_BAR || mode === DISPLAY_MODE.REMOVE_BAR) {
        setExtraBar(currentId)
        return
      }
      if (mode === DISPLAY_MODE.ADD_NOTE) {
        addNoteToBar(barId, event)
        return
      }
    },
    [mode, setExtraBar, addNoteToBar]
  )

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
          />
        ))}
      </section>
    </section>
  )
}
