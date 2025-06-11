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
  return (
    <DisplayPentagramaContext.Provider value={{ mode, setMode }}>
      <ButtonsSelection />
      <Pentagrama />
      Sample Test <br />
      sonic <br />
      osi
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

const barSize = 200

export function Pentagrama() {
  const [allLines, setAllLines] = useState<LineElement[]>([])
  const [bars, setBars] = useState<BarData[]>([])
  const pentagramRef = useRef<HTMLElement>(null)
  const claveRef = useRef<SVGSVGElement | null>(null)
  const contexto = useContext(DisplayPentagramaContext)
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
  const handleClickOnPentagram = useCallback(() => {
    if (contexto.mode !== DISPLAY_MODE.ADD_BAR) return
    if (pentagramRef.current && claveRef.current) {
      const barId = `bar-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`
      setBars((prevBars) => [
        ...prevBars,
        { id: barId, x: barSize * prevBars.length, notes: [] }
      ])
    }
  }, [contexto.mode, pentagramRef, claveRef])

  const handleClickOnBar = useCallback(
    (barId: string, event: MouseEvent) => {
      if (contexto.mode === DISPLAY_MODE.REMOVE_BAR) {
        setBars((prevBars) => {
          const updatedBars = prevBars
            .filter((bar) => bar.id !== barId)
            .map((bar, index) => ({
              ...bar,
              x: index * 200
            }))
          return updatedBars
        })
        return
      }
      if (contexto.mode != DISPLAY_MODE.ADD_NOTE) return
      if (pentagramRef.current) {
        const pentagramRect = pentagramRef.current.getBoundingClientRect()
        const clickedBarRect = (
          event.currentTarget as HTMLElement
        ).getBoundingClientRect()

        const clickXRelativeToBar = event.clientX - clickedBarRect.left
        const clickYRelativeToPentagram = event.clientY - pentagramRect.top
        const beatSnapSize = 200 / 4
        const snappedNoteX =
          Math.round(clickXRelativeToBar / beatSnapSize) * beatSnapSize

        let closestY: number | null = null
        let minDistance = Infinity

        allLines.forEach((lineData) => {
          const lineY = lineData.y
          const spaceY = lineData.y + noteSize / 2
          ;[lineY, spaceY].forEach((y) => {
            const distance = Math.abs(clickYRelativeToPentagram - y)
            if (distance < minDistance) {
              minDistance = distance
              closestY = y
            }
          })
        })

        const finalY = closestY !== null ? closestY : clickYRelativeToPentagram

        const newNote: NoteData = {
          id: `note-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          x: snappedNoteX, //WIP
          y: finalY
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
  const claveFullSize = claveRef.current
    ? claveRef.current.getBoundingClientRect().x +
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
      {bars.map((barData) => (
        <div
          key={barData.id}
          className="bar-indicator"
          style={{
            position: 'absolute',
            left: `calc(${barData.x}px + ${claveFullSize}px)`,
            top: `0px`,
            width: `200px`,
            height: `100%`,
            borderRight: '3px solid red',
            border: '1px solid blue',
            cursor: 'pointer'
          }}
          onClick={(e) => handleClickOnBar(barData.id, e)}
        >
          {barData.notes.map((note) => (
            <div
              key={note.id}
              className="circle"
              style={{
                position: 'absolute',
                left: `${note.x}px`,
                top: `${note.y}px`,
                width: `${noteSize}px`,
                height: `${noteSize}px`,
                borderRadius: '50%',
                backgroundColor: 'blue',
                transform: 'translate(-50%, -50%)'
              }}
            ></div>
          ))}
        </div>
      ))}
    </section>
  )
}
