import { useContext, useState } from 'preact/hooks'
import './home.css'
import { DisplayPentagramaContext } from './context/DisplayContext'
import { DISPLAY_MODE } from './enums/Mode'
import { Pentagrama } from './components/Pentagrama'

export const noteSize = 20

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
