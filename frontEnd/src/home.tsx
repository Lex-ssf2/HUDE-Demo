import { useContext, useState } from 'preact/hooks'
import './home.css'
import { DisplayPentagramaContext } from './context/DisplayContext'
import { DISPLAY_MODE } from './enums/Mode'
import { Pentagrama } from './components/Pentagrama'
import type { PentagramaState } from './interfaces/PentagramaInterface'

export const noteSize = 20

export function Home() {
  const [mode, setMode] = useState(-1)
  const [selectedBar, setSelectedBar] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [visibleUpdate, setVisibleUpdate] = useState(false)
  const [allPentagramsData, setAllPentagramsData] = useState<PentagramaState[]>(
    [
      { id: 'pentagrama-1', bars: [] },
      { id: 'pentagrama-2', bars: [] },
      { id: 'pentagrama-3', bars: [] }
    ]
  )

  const updatePentagramBars = (pentagramId: string, newBars: any[]) => {
    setAllPentagramsData((prevData) =>
      prevData.map((pentagram) =>
        pentagram.id === pentagramId
          ? { ...pentagram, bars: newBars }
          : pentagram
      )
    )
  }

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
        setVisibleUpdate
      }}
    >
      <ButtonsSelection />
      {allPentagramsData.map((actualPentagrama) => (
        <Pentagrama
          key={`${actualPentagrama.id}-${visibleUpdate}`}
          pentagramId={actualPentagrama.id}
          initialBars={actualPentagrama.bars}
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
      const response = await fetch('http://localhost:5555/revision/echojson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contexto.allPentagramsData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      contexto.setAllPentagramsData(data)
      contexto.setVisibleUpdate(!contexto.visibleUpdate)
      console.log('Data fetched and state updated successfully:', data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
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
      <button onClick={sendCurrentData}>Fetching woo</button>
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
