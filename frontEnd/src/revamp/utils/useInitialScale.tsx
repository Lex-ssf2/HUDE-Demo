import { useEffect } from 'preact/hooks'

export function useInitialScale(setInitialScale: (scale: number) => void) {
  useEffect(() => {
    const measureWidth = () => {
      const expectedWidth = 1951
      setInitialScale(
        window.innerWidth > 768 ? window.innerWidth / expectedWidth : 0.9
      )
    }
    measureWidth()
    window.addEventListener('resize', measureWidth)
    return () => {
      window.removeEventListener('resize', measureWidth)
    }
  }, [setInitialScale])
}
