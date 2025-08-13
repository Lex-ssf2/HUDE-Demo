import { useMemo } from 'preact/hooks'

export function useBarUniqueIds(maxBar: number) {
  return useMemo(() => {
    const ids: string[] = []
    for (let i = 0; i < maxBar; i++) {
      ids.push(`bar-${i}`)
    }
    return ids
  }, [maxBar])
}
