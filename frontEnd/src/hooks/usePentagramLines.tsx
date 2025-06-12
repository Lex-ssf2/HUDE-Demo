import { useState, useEffect } from 'preact/hooks'
import type { LineElement } from '../interfaces/PentagramaInterface'
import { noteSize } from '../home'

/**
 * Custom hook to generate the visual lines for the pentagram.
 * @returns An array of LineElement objects.
 */
export function usePentagramLines(): LineElement[] {
  const [allLines, setAllLines] = useState<LineElement[]>([])

  useEffect(() => {
    const lines: LineElement[] = []
    for (let i = 0; i < 11; i++) {
      const currentY = i * noteSize
      lines.push({
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
    setAllLines(lines)
  }, [])

  return allLines
}
