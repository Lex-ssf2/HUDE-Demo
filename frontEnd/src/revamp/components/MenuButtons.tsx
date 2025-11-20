import { useContext } from 'preact/hooks'
import { useState, useRef } from 'preact/hooks'
import { MainScoreContext } from '../context/DisplayContext'
import { DISPLAY_MODE } from '../enums/mode'
import { NOTE_DURATION } from '../enums/Notes'
import type { VerticalBarData } from '../interface/BarInterface'

export function MenuButtons({ playMusic }: { playMusic: () => void }) {
  const mainScore = useContext(MainScoreContext)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setCurrentScale,
    setMaxBar
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
      const response = await fetch(
        'https://fresh-sheep-josned-dd252bd3.koyeb.app/revision/echojson',
        //'http://localhost:8000/revision/echojson',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: actualEntrace
        }
      )
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

  const saveCurrentData = () => {
    const tmpData = [...allPentagramsData]
    tmpData.forEach((pentagram) => {
      pentagram.allBar.forEach((bar) => {
        bar.currentNotes.forEach((note) => {
          note.status = 'ok'
          delete note.errors
        })
      })
    })
    const output = JSON.stringify(tmpData)
    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'miArchivo.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      const file = input.files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string
          const data = JSON.parse(result)
          const output: VerticalBarData[] = data
          setMaxBar(Math.max(output.length, 1))
          setAllPentagramsData(output)
          setMaxPentagram(Math.max(output[0].allBar.length, 1))
        } catch (err) {
          setError('Error al cargar el archivo')
        }
      }
      reader.readAsText(file)
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
      <button onClick={() => setCurrentNoteSize(NOTE_DURATION.CORCHEA)}>
        Corchea
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
      <button onClick={saveCurrentData}>Save</button>
      <button onClick={() => fileInputRef.current?.click()}>Load</button>
      <input
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}
