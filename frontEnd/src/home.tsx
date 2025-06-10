import { useState } from 'preact/hooks'
import './home.css'
import { ClaveSol } from './assets/claves'

export function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Pentagrama />
    </>
  )
}

export function Pentagrama() {
  const allLines = []
  for (let index = 0; index <= 5; index++) {
    allLines.push(
      <div className="line" style={{ top: `${index * 20 + 20}px` }}></div>
    )
  }
  return (
    <section className="pentagrama">
      <ClaveSol />
      {allLines}
    </section>
  )
}
