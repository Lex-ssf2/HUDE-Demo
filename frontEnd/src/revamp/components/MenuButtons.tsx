import { useContext } from 'preact/hooks'
import { MainScoreContext } from '../context/DisplayContext'
import { DISPLAY_MODE } from '../enums/mode'
import { NOTE_DURATION } from '../enums/Notes'
import type { VerticalBarData } from '../interface/BarInterface'
import { SplendidGrandPiano, Soundfont } from 'smplr'

export function MenuButtons({ playMusic }: { playMusic: () => void }) {
  const mainScore = useContext(MainScoreContext)
  if (!mainScore) {
    console.error('MainScoreContext not available in MenuButtons')
    return null
  }

  const {
    allPentagramsData,
    setAllPentagramsData,
    setSelectedNote,
    setMaxPentagram,
    setMode,
    setCurrentNoteSize,
    setCurrentScale
  } = mainScore
  const sendCurrentData = async () => {
    const tmpData = [...allPentagramsData]
    tmpData.forEach((pentagram) => {
      pentagram.allBar.forEach((bar) => {
        bar.currentNotes.forEach((note) => {
          note.status = 'ok'
          delete note.errors
        })
      })
    })
    const actualEntrace = JSON.stringify(tmpData)
    try {
      const response = await fetch('http://172.16.0.6:5555/revision/echojson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: actualEntrace
      })
      console.log(actualEntrace, 'arreglado')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: VerticalBarData[] = await response.json()
      setAllPentagramsData(data)
      console.log('Data fetched and state updated successfully:', data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  return (
    <div style={{ pointerEvents: 'auto' }}>
      <button onClick={playMusic}>Play</button>

      <button onClick={() => setMaxPentagram((prev) => prev + 1)}>
        Pentagrama++
      </button>
      <button onClick={() => setMaxPentagram((prev) => Math.max(prev - 1, 1))}>
        Pentagrama--
      </button>
      <button onClick={() => setMode(DISPLAY_MODE.ADD_BAR)}>Bar++</button>
      <button onClick={() => setMode(DISPLAY_MODE.REMOVE_BAR)}>Bar--</button>
      <button onClick={() => setMode(DISPLAY_MODE.SELECT_NOTE)}>Select</button>
      <button onClick={() => setMode(DISPLAY_MODE.ADD_NOTE)}>Add</button>
      <button
        onClick={() => {
          setMode(DISPLAY_MODE.REMOVE_NOTE)
          setSelectedNote({
            barIndex: -1,
            noteIndex: -1,
            currentPentagram: -1
          })
        }}
      >
        Remove
      </button>
      <button onClick={() => setCurrentNoteSize(NOTE_DURATION.NEGRA)}>
        Negra
      </button>
      <button onClick={() => setCurrentNoteSize(NOTE_DURATION.BLANCA)}>
        Blanca
      </button>
      <button onClick={() => setCurrentNoteSize(NOTE_DURATION.REDONDA)}>
        Redonda
      </button>
      <button onClick={sendCurrentData}>Fetching</button>
      <button onClick={() => setCurrentScale((prev) => prev + 0.1)}>
        Zoom In
      </button>
      <button
        onClick={() => setCurrentScale((prev) => Math.max(prev - 0.1, 0.5))}
      >
        Zoom Out
      </button>
      <button onClick={() => setMode(DISPLAY_MODE.TOGGLE_CLAVE)}>
        Toggle Clave
      </button>
    </div>
  )
}
