import { render } from 'preact'
import { VerticalPentagram } from './revampHome'

render(
  <div
    style={{
      display: 'flex',
      border: '1px solid blue',
      height: '100%',
      width: '100%'
    }}
  >
    <VerticalPentagram /> <VerticalPentagram />
  </div>,
  document.getElementById('app')!
)
