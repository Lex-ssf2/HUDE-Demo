import { render } from 'preact'
import { MainScore } from './revampHome'

render(
  <div
    style={{
      display: 'flex',
      border: '1px solid blue',
      height: '100%',
      width: '100%'
    }}
  >
    <MainScore />
  </div>,
  document.getElementById('app')!
)
