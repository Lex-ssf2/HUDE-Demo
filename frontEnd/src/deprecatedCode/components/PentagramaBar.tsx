import type { BarData, NoteData } from '../interfaces/PentagramaInterface'
import * as Icons from '../../assets/figuras'
import { NOTE_DURATION } from '../../revamp/enums/Notes'
/** A component that its basically a musical bar
 * @param barData It contains the id and all the notes data.
 * @param index Ref to the actual index.
 * @param onClick function when clicking the bar oof.
 */

interface PentagramaBarProps {
  barData: BarData
  index: number
  onClick: (barId: string, event: MouseEvent, index: number) => void
  noteHandler: (event: MouseEvent, index: number, barIndex: number) => void
  barWidth: number
}

export function PentagramaBar({
  barData,
  index,
  onClick,
  noteHandler,
  barWidth // Recibimos el ancho
}: PentagramaBarProps) {
  return (
    <article
      key={barData.id}
      className="bar-indicator"
      style={{
        top: `0px`,
        width: `${barWidth}px`,
        height: `100%`,
        borderRight: '3px solid red',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'row',
        position: 'relative'
      }}
      onClick={(e) => onClick(barData.id, e, index)}
    >
      {barData.notes.map((note: NoteData, noteIndex) => {
        let NoteIconComponent
        switch (note.duration) {
          case NOTE_DURATION.REDONDA:
            NoteIconComponent = Icons.Redonda
            break
          case NOTE_DURATION.BLANCA:
            NoteIconComponent = Icons.Blanca
            break
          case NOTE_DURATION.NEGRA:
            NoteIconComponent = Icons.Negra
            break
          case NOTE_DURATION.CORCHEA:
            NoteIconComponent = Icons.Corchea
            break
          default:
            NoteIconComponent = Icons.Redonda
        }

        return (
          <div
            key={note.id}
            style={{
              position: 'relative',
              width: `${note.actualSize}%`,
              height: `100%`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              border: '1px solid red'
            }}
            onClick={(e) => noteHandler(e, noteIndex, index)}
          >
            <NoteIconComponent
              className={note.currentClassId}
              style={{
                top: `${note.y}px`,
                height: '35%',
                transform: 'translateY(-85%)'
              }}
            />
          </div>
        )
      })}
    </article>
  )
}
