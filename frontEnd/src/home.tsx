import { useContext, useEffect, useRef, useState } from 'preact/hooks'
import './home.css'
import { ClaveSol } from './assets/claves'
import { type VNode } from 'preact'
import { DisplayPentagramaContext } from './context/DisplayContext'
import type { LineElement } from './interfaces/PentagramaInterface'
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
        Compas
      </button>
      <button onClick={() => contexto.setMode(DISPLAY_MODE.ADD_NOTE)}>
        Add note
      </button>
    </>
  )
}

export function Pentagrama() {
  const [allLines, setAllLines] = useState<LineElement[]>([])
  const [circles, setCircles] = useState<VNode[]>([])
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
  const handleClickOnPentagram = (event: MouseEvent) => {
    if (contexto.mode != DISPLAY_MODE.ADD_NOTE) return
    if (pentagramRef.current && claveRef.current) {
      const pentagramRect = pentagramRef.current.getBoundingClientRect()
      const clickX = event.clientX - pentagramRect.left
      const clickY = event.clientY - pentagramRect.top
      const claveRect = claveRef.current.getBoundingClientRect()
      let noteX =
        clickX < claveRect.x + claveRect.width + noteSize
          ? claveRect.x + claveRect.width + noteSize
          : Math.max(
              noteSize * Math.trunc(clickX / noteSize),
              claveRect.x + claveRect.width + noteSize
            )

      let closestY = null
      let minDistance = Infinity
      console.log(noteX, event.clientX)
      allLines.forEach((line) => {
        const lineY = line.y
        const test = line.y + noteSize / 2
        ;[lineY, test].forEach((y) => {
          const distance = Math.abs(clickY - y)
          if (distance < minDistance) {
            minDistance = distance
            closestY = y
          }
        })
      })

      const newCircle = (
        <div
          key={`circle-${Date.now()}-${Math.random()}`}
          className="circle"
          style={{
            position: 'absolute',
            left: `${noteX}px`,
            top: `${closestY}px`,
            width: `${noteSize}px`,
            height: `${noteSize}px`,
            borderRadius: '50%',
            backgroundColor: 'blue',
            transform: 'translate(-50%, -50%)'
          }}
        ></div>
      )
      setCircles((prevCircles) => [...prevCircles, newCircle])
    }
  }
  return (
    <section
      className="pentagrama"
      onClick={handleClickOnPentagram}
      ref={pentagramRef}
    >
      <ClaveSol refProps={claveRef} />
      {allLines.map((lineData) => lineData.vnode)}
      {circles}
    </section>
  )
}
