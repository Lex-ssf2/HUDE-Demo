import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'preact/hooks'
import './home.css'
import { ClaveSol } from './assets/claves'
import { DisplayPentagramaContext } from './context/DisplayContext'
import type {
  BarData,
  LineElement,
  NoteData
} from './interfaces/PentagramaInterface'
import { DISPLAY_MODE } from './enums/Mode'

const noteSize = 20

export function Home() {
  const [mode, setMode] = useState(-1)
  const [extraBar, setExtraBar] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  return (
    <DisplayPentagramaContext.Provider
      value={{
        mode,
        setMode,
        extraBar,
        setExtraBar,
        scrollLeft,
        setScrollLeft
      }}
    >
      <ButtonsSelection />
      <Pentagrama />
      Sample Test <br />
      sonic <br />
      osi
      <Pentagrama />
      <Pentagrama />
    </DisplayPentagramaContext.Provider>
  )
}

export function ButtonsSelection() {
  const contexto = useContext(DisplayPentagramaContext)
  if (!contexto) return null
  return (
    <>
      {' '}
      <button onClick={() => contexto.setMode(DISPLAY_MODE.SELECT)}>
        Select
      </button>
      <button onClick={() => contexto.setMode(DISPLAY_MODE.ADD_BAR)}>
        Add Bar
      </button>
      <button onClick={() => contexto.setMode(DISPLAY_MODE.REMOVE_BAR)}>
        Remove Bar
      </button>
      <button onClick={() => contexto.setMode(DISPLAY_MODE.ADD_NOTE)}>
        Add note XD
      </button>
      <p>
        Current Mode:{' '}
        {Object.keys(DISPLAY_MODE).find(
          (key) =>
            DISPLAY_MODE[key as keyof typeof DISPLAY_MODE] === contexto.mode
        ) || 'UNKNOWN'}
      </p>
    </>
  )
}

export function Pentagrama() {
  const [allLines, setAllLines] = useState<LineElement[]>([])
  const [bars, setBars] = useState<BarData[]>([])
  const pentagramRef = useRef<HTMLElement>(null)
  const barsContainerRef = useRef<HTMLElement>(null)
  const claveRef = useRef<SVGSVGElement | null>(null)
  const contexto = useContext(DisplayPentagramaContext)
  const isProgrammaticScrollRef = useRef(false)
  if (!contexto) return null

  useEffect(() => {
    const allLines: LineElement[] = []
    for (let i = 0; i < 11; i++) {
      const currentY = i * noteSize
      allLines.push({
        vnode: (
          <div
            key={`line-${i}`}
            className="line"
            style={{ top: `${currentY}px` }}
          ></div>
        ),
        y: currentY
      })
    }
    setAllLines(allLines)
  }, [])

  //All this shit is to synch multiples scroll, this sucks ass but I dont want to re-do everything for a demo
  useEffect(() => {
    const barsContainer = barsContainerRef.current
    if (!barsContainer) return

    const handleScroll = () => {
      if (!isProgrammaticScrollRef.current) {
        contexto.setScrollLeft(barsContainer.scrollLeft)
      }
      isProgrammaticScrollRef.current = false
    }

    barsContainer.addEventListener('scroll', handleScroll)
    return () => {
      barsContainer.removeEventListener('scroll', handleScroll)
    }
  }, [contexto.setScrollLeft])
  useEffect(() => {
    const barsContainer = barsContainerRef.current
    if (!barsContainer) return
    if (barsContainer.scrollLeft !== contexto.scrollLeft) {
      isProgrammaticScrollRef.current = true
      barsContainer.scrollLeft = contexto.scrollLeft
    }
  }, [contexto.scrollLeft])
  //This is where the scrollCode ends
  //More shit to sync between Pentagramas
  useEffect(() => {
    if (contexto.extraBar == -1) return
    if (contexto.mode === DISPLAY_MODE.REMOVE_BAR) {
      setBars((prevBars) => {
        const tempBars = [...prevBars]
        tempBars.splice(contexto.extraBar + 1, 1)
        return tempBars
      })
      contexto.setExtraBar(-1)
      return
    }
    setBars((prevBars) => {
      const barId = `bar-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`
      const tempBars = [...prevBars]
      tempBars.splice(contexto.extraBar + 1, 0, {
        id: barId,
        notes: []
      })
      return tempBars
    })
    contexto.setExtraBar(-1)
  }, [contexto.extraBar])

  const handleClickOnPentagram = useCallback(() => {
    if (contexto.mode !== DISPLAY_MODE.ADD_BAR) return
    if (pentagramRef.current && claveRef.current) {
      contexto.setExtraBar(bars.length + 5)
    }
  }, [contexto.mode, pentagramRef, claveRef])

  const handleClickOnBar = useCallback(
    (barId: string, event: MouseEvent, currentId: number) => {
      event.stopPropagation()
      if (
        contexto.mode === DISPLAY_MODE.ADD_BAR ||
        contexto.mode === DISPLAY_MODE.REMOVE_BAR
      ) {
        contexto.setExtraBar(currentId)
        return
      }
      if (contexto.mode != DISPLAY_MODE.ADD_NOTE) return
      if (pentagramRef.current && barsContainerRef.current) {
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
          const spaceY = lineData.y + noteSize / 2
          ;[lineY, spaceY].forEach((y) => {
            const distance = Math.abs(actualClickYGlobalToPentagram - y)
            if (distance < minDistance) {
              minDistance = distance
              closestY = y
            }
          })
        })
        const newNote: NoteData = {
          id: `note-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          x: actualClickXRelativeToBar,
          y: closestY,
          actualSize: 100
        }

        setBars((prevBars) =>
          prevBars.map((bar) =>
            bar.id === barId ? { ...bar, notes: [...bar.notes, newNote] } : bar
          )
        )
      }
    },
    [contexto.mode, pentagramRef, allLines]
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
          <article
            key={barData.id}
            className="bar-indicator"
            style={{
              top: `0px`,
              width: `auto`,
              minWidth: '200px',
              height: `100%`,
              borderRight: '3px solid red',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'row',
              position: 'relative'
            }}
            onClick={(e) => handleClickOnBar(barData.id, e, index)}
          >
            {barData.notes.map((note) => (
              <div
                key={note.id}
                style={{
                  position: 'relative',
                  width: `${note.actualSize}%`,
                  height: `100%`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start'
                }}
              >
                <div
                  className="circle"
                  style={{
                    position: 'relative',
                    top: `${note.y}px`,
                    width: `${noteSize}px`,
                    height: `${noteSize}px`,
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    transform: 'translate(-0%, -50%)'
                  }}
                />
              </div>
            ))}
          </article>
        ))}
      </section>
    </section>
  )
}
