import { useEffect, useRef, useState } from 'preact/hooks'
import './home.css'
import { ClaveSol } from './assets/claves'
import type { VNode } from 'preact'

export function Home() {
  return (
    <>
      <Pentagrama />
      Sample Test
      <Pentagrama />
    </>
  )
}

export function Pentagrama() {
  const [allLines, setAllLines] = useState<VNode[]>([])
  const [circles, setCircles] = useState<VNode[]>([])
  const pentagramRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const allLines: VNode[] = []
    for (let index = 0; index <= 5; index++) {
      allLines.push(
        <div className="line" style={{ top: `${index * 20 + 20}px` }}></div>
      )
    }
    setAllLines(allLines)
  }, [])
  const handleClickOnPentagram = (event: MouseEvent) => {
    if (pentagramRef.current) {
      const pentagramRect = pentagramRef.current.getBoundingClientRect()
      const clickX = event.clientX - pentagramRect.left
      const clickY = event.clientY - pentagramRect.top

      const newCircle = (
        <div
          key={`circle-${Date.now()}-${Math.random()}`}
          className="circle"
          style={{
            position: 'absolute',
            left: `${clickX}px`,
            top: `${clickY}px`,
            width: '10px',
            height: '10px',
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
      <ClaveSol />
      {allLines}
      {circles}
    </section>
  )
}
