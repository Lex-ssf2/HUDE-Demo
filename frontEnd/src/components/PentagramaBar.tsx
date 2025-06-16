import { noteSize } from '../home'
import type { BarData, NoteData } from '../interfaces/PentagramaInterface'

/** A component that its basically a musical bar
 * @param barData It contains the id and all the notes data.
 * @param index Ref to the actual index.
 * @param onClick function when clicking the bar oof.
 */

interface PentagramaBarProps {
  barData: BarData
  index: number
  onClick: (barId: string, event: MouseEvent, index: number) => void
}

export function PentagramaBar({ barData, index, onClick }: PentagramaBarProps) {
  return (
    <article
      key={barData.id}
      className="bar-indicator"
      style={{
        top: `0px`,
        width: `auto`,
        minWidth: '200px', //WIP
        height: `100%`,
        borderRight: '3px solid red',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'row',
        position: 'relative'
      }}
      onClick={(e) => onClick(barData.id, e, index)}
    >
      {barData.notes.map((note: NoteData) => (
        <div
          key={note.id}
          style={{
            position: 'relative',
            width: `${note.actualSize}%`,
            height: `100%`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          <div
            className={note.currentClassId}
            style={{
              top: `${note.y}px`,
              width: `${noteSize}px`,
              height: `${noteSize}px`
            }}
          />
        </div>
      ))}
    </article>
  )
}
