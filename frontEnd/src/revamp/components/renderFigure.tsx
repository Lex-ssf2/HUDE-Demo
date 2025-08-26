import { ClaveSol, ClaveF, ClaveDo } from '../assets/Claves'
import { Redonda, Blanca, Negra } from '../assets/Notes'
import { ALL_CLAVES } from '../enums/constants'
import { NOTE_DURATION } from '../enums/Notes'
import type { CircleData } from '../interface/types'

export const currentClave = (
  indexClave: number,
  onClick: (e: MouseEvent) => void
) => {
  const arrayOfElements = [
    <ClaveSol x={-25} onClick={onClick} />,
    <ClaveF x={-25} y={6} onClick={onClick} />,
    <ClaveDo x={-25} y={12.5} onClick={onClick} />,
    <ClaveDo x={-25} y={44} onClick={onClick} />,
    <ClaveDo x={-25} y={-5} onClick={onClick} />
  ]
  return arrayOfElements[indexClave % ALL_CLAVES.length]
}
export const renderFigure = (
  noteInfo: CircleData,
  onClick: (event: MouseEvent) => void
) => {
  const X_DISTANCE = 9
  const STEM_LENGTH = 45
  const STEM_WIDTH = 2.7
  const MEDIUM_VALUE = 8 * 4
  switch (noteInfo.noteDuration) {
    case NOTE_DURATION.REDONDA:
      return (
        <Redonda
          key={noteInfo.id}
          x={noteInfo.cx}
          y={noteInfo.cy}
          onClick={onClick}
        />
      )
      break
    case NOTE_DURATION.BLANCA:
      return (
        <svg
          style={{
            overflow: 'visible'
          }}
        >
          <line
            x1={
              noteInfo.cy > MEDIUM_VALUE
                ? noteInfo.cx + X_DISTANCE
                : noteInfo.cx - X_DISTANCE
            }
            x2={
              noteInfo.cy > MEDIUM_VALUE
                ? noteInfo.cx + X_DISTANCE
                : noteInfo.cx - X_DISTANCE
            }
            y1={noteInfo.cy}
            y2={
              noteInfo.cy > MEDIUM_VALUE
                ? noteInfo.cy - STEM_LENGTH
                : noteInfo.cy + STEM_LENGTH
            }
            stroke="black"
            stroke-width={STEM_WIDTH}
          />
          <Blanca
            key={noteInfo.id}
            x={noteInfo.cx}
            y={noteInfo.cy}
            onClick={onClick}
          />
        </svg>
      )
      break
    case NOTE_DURATION.NEGRA:
      return (
        <svg
          style={{
            overflow: 'visible'
          }}
        >
          <line
            x1={
              noteInfo.cy > MEDIUM_VALUE
                ? noteInfo.cx + X_DISTANCE
                : noteInfo.cx - X_DISTANCE
            }
            x2={
              noteInfo.cy > MEDIUM_VALUE
                ? noteInfo.cx + X_DISTANCE
                : noteInfo.cx - X_DISTANCE
            }
            y1={noteInfo.cy}
            y2={
              noteInfo.cy > MEDIUM_VALUE
                ? noteInfo.cy - STEM_LENGTH
                : noteInfo.cy + STEM_LENGTH
            }
            stroke="black"
            stroke-width={STEM_WIDTH}
          />
          <Negra
            key={noteInfo.id}
            x={noteInfo.cx}
            y={noteInfo.cy}
            onClick={onClick}
          />
        </svg>
      )
      break
    default:
      return <></>
      break
  }
}
