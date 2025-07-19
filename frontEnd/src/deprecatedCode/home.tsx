import { useContext, useState, useMemo, useCallback } from 'preact/hooks'
import './home.css'
import { DisplayPentagramaContext } from './context/DisplayContext'
import { DISPLAY_MODE } from './enums/Mode'
import { Pentagrama } from './components/Pentagrama'
import type {
  SelectedNote,
  PentagramaState,
  BarData
} from './interfaces/PentagramaInterface'
import { NOTE_DURATION } from '../revamp/enums/Notes'

//This code is ass sorry its temp cuz I dont know how to sync all Bars
export const noteSize = 20

const BASE_BAR_WIDTH = 200
const WIDTH_PER_NOTE_APPROX = 50
const MAX_BAR_WIDTH_LIMIT = 900

const calculateNaturalBarWidth = (bar: BarData): number => {
  let width = BASE_BAR_WIDTH
  if (bar.notes && bar.notes.length > 0) {
    width = Math.max(
      BASE_BAR_WIDTH,
      BASE_BAR_WIDTH + bar.notes.length * WIDTH_PER_NOTE_APPROX
    )
  }

  return Math.min(MAX_BAR_WIDTH_LIMIT, width)
}

export function Home() {
  const [mode, setMode] = useState(-1)
  const [selectedBar, setSelectedBar] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [noteDuration, setNoteDuration] = useState(NOTE_DURATION.REDONDA)
  const [visibleUpdate, setVisibleUpdate] = useState(false)
  const [selectNote, setSelectNote] = useState<SelectedNote | null>(null)
  const [allPentagramsData, setAllPentagramsData] = useState<PentagramaState[]>(
    [
      { id: 'pentagrama-1', bars: [] },
      { id: 'pentagrama-2', bars: [] },
      { id: 'pentagrama-3', bars: [] }
    ]
  )

  const updatePentagramBars = useCallback(
    (pentagramId: string, newBars: any[]) => {
      setAllPentagramsData((prevData) =>
        prevData.map((pentagram) => {
          if (pentagram.id === pentagramId) {
            const updatedBars = newBars.map((bar: BarData) => ({
              ...bar,
              naturalWidth: calculateNaturalBarWidth(bar)
            }))
            return { ...pentagram, bars: updatedBars }
          }
          return pentagram
        })
      )
    },
    []
  )

  // This code is also ass
  const synchronizedBarWidths: number[] = useMemo(() => {
    let maxBars = 0
    allPentagramsData.forEach((pentagram) => {
      if (pentagram.bars.length > maxBars) {
        maxBars = pentagram.bars.length
      }
    })

    const calculatedWidths: number[] = Array(maxBars).fill(BASE_BAR_WIDTH)

    for (let i = 0; i < maxBars; i++) {
      let maxWidthForIndex = BASE_BAR_WIDTH

      allPentagramsData.forEach((pentagram) => {
        if (pentagram.bars[i] && pentagram.bars[i].naturalWidth !== undefined) {
          if (pentagram.bars[i].naturalWidth! > maxWidthForIndex) {
            maxWidthForIndex = pentagram.bars[i].naturalWidth!
          }
        }
      })
      calculatedWidths[i] = maxWidthForIndex
    }
    return calculatedWidths
  }, [allPentagramsData])

  return (
    <DisplayPentagramaContext.Provider
      value={{
        mode,
        setMode,
        selectedBar: selectedBar,
        setSelectedBar: setSelectedBar,
        scrollLeft,
        setScrollLeft,
        allPentagramsData,
        setAllPentagramsData,
        updatePentagramBars,
        visibleUpdate,
        setVisibleUpdate,
        selectNote,
        setSelectNote,
        noteDuration,
        setNoteDuration
      }}
    >
      <ButtonsSelection />
      {allPentagramsData.map((actualPentagrama) => (
        <Pentagrama
          key={`${actualPentagrama.id}-${visibleUpdate}`}
          pentagramId={actualPentagrama.id}
          initialBars={actualPentagrama.bars}
          barWidths={synchronizedBarWidths}
        />
      ))}
    </DisplayPentagramaContext.Provider>
  )
}

export function ButtonsSelection() {
  const contexto = useContext(DisplayPentagramaContext)
  if (!contexto) return null
  const sendCurrentData = async () => {
    console.log(contexto.allPentagramsData)
    try {
      const response = await fetch(
        'http://192.168.2.14:5555/revision/echojson',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contexto.allPentagramsData)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const updatedData = data.map((pentagram: PentagramaState) => ({
        ...pentagram,
        bars: pentagram.bars.map((bar) => ({
          ...bar,
          naturalWidth: calculateNaturalBarWidth(bar)
        }))
      }))
      contexto.setAllPentagramsData(updatedData)
      contexto.setVisibleUpdate(!contexto.visibleUpdate)
      console.log('Data fetched and state updated successfully:', data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  return (
    <>
      {' '}
      <button
        onClick={() => {
          contexto.setMode(DISPLAY_MODE.SELECT)
          contexto.setSelectNote(null)
        }}
      >
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
      <button
        onClick={() => {
          contexto.setMode(DISPLAY_MODE.REMOVE_NOTE)
          contexto.setSelectNote(null)
        }}
      >
        Remove note
      </button>
      <button onClick={sendCurrentData}>Fetching woo</button>
      <section>
        Current Mode:{' '}
        {Object.keys(DISPLAY_MODE).find(
          (key) =>
            DISPLAY_MODE[key as keyof typeof DISPLAY_MODE] === contexto.mode
        ) || 'UNKNOWN'}
        {(contexto.mode == DISPLAY_MODE.ADD_NOTE ||
          contexto.mode == DISPLAY_MODE.SELECT) && (
          <section>
            <button
              onClick={() => contexto.setNoteDuration(NOTE_DURATION.REDONDA)}
            >
              Redonda
            </button>
            <button
              onClick={() => contexto.setNoteDuration(NOTE_DURATION.BLANCA)}
            >
              Blanca
            </button>
            <button
              onClick={() => contexto.setNoteDuration(NOTE_DURATION.NEGRA)}
            >
              Negra
            </button>
            <button
              onClick={() => contexto.setNoteDuration(NOTE_DURATION.CORCHEA)}
            >
              Corchea
            </button>
          </section>
        )}
      </section>
    </>
  )
}
