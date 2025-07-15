import { useEffect, useRef, useContext } from 'preact/hooks'
import type { RefObject } from 'preact'
import { DisplayPentagramaContext } from '../context/DisplayContext'

/**
 * Custom hook to synchronize horizontal scroll position across multiple components
 * using a shared context. You will think its probably dumb and you might be right
 * @param scrollContainerRef The ref object for the HTMLElement that is scrollable.
 */

export function useSynchronizedScroll(
  scrollContainerRef: RefObject<HTMLElement>
) {
  const contexto = useContext(DisplayPentagramaContext)
  const isProgrammaticScrollRef = useRef(false)

  if (!contexto) {
    console.error(
      'useSynchronizedScroll must be used within a DisplayPentagramaContext.Provider'
    )
    return
  }

  const { scrollLeft, setScrollLeft } = contexto

  // Effect 1: Listen for user scrolls and update context
  useEffect(() => {
    const barsContainer = scrollContainerRef.current
    if (!barsContainer) return

    const handleScroll = () => {
      if (!isProgrammaticScrollRef.current) {
        setScrollLeft(barsContainer.scrollLeft)
      }
      isProgrammaticScrollRef.current = false
    }

    barsContainer.addEventListener('scroll', handleScroll)

    return () => {
      barsContainer.removeEventListener('scroll', handleScroll)
    }
  }, [setScrollLeft, scrollContainerRef])

  // Effect 2: Update this component's scroll position when context.scrollLeft changes
  useEffect(() => {
    const barsContainer = scrollContainerRef.current
    if (!barsContainer) return

    if (barsContainer.scrollLeft !== scrollLeft) {
      isProgrammaticScrollRef.current = true
      barsContainer.scrollLeft = scrollLeft
    }
  }, [scrollLeft, scrollContainerRef])
  // Its easier to handle this thing like that tbh
}
