import { useMemo } from 'preact/hooks'
import { VerticalPentagram } from '../components/VerticalPentagram'

export function useMemoizedBarBoxes(barUniqueIds: string[]) {
  return useMemo(() => {
    return barUniqueIds.map((id, i) => (
      <VerticalPentagram key={id} indexBar={i} />
    ))
  }, [barUniqueIds])
}
