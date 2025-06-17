import { h } from 'preact'

interface MusicNoteProps {
  color?: string
  size?: string
  className?: string
  onClick?: () => void
  style?: h.JSX.CSSProperties
}

export function Redonda({ style, className }: MusicNoteProps): h.JSX.Element {
  return (
    <img
      src="redonda.webp"
      alt="figura musical redonda"
      style={style}
      className={className}
    />
  )
}

export function Negra({
  className = '',
  style
}: MusicNoteProps): h.JSX.Element {
  return (
    <img
      src="negra.webp"
      alt="figura musical negra"
      style={style}
      className={className}
    />
  )
}

export function Blanca({
  className = '',
  style
}: MusicNoteProps): h.JSX.Element {
  return (
    <img
      src="blanca.webp"
      alt="figura musical blanca"
      style={style}
      className={className}
    />
  )
}

export function Corchea({
  className = '',
  style
}: MusicNoteProps): h.JSX.Element {
  return (
    <img
      src="corchea.webp"
      alt="figura musical corchea"
      style={style}
      className={className}
    />
  )
}
