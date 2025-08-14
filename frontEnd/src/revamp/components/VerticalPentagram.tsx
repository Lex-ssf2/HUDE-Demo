import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
  useRef
} from 'preact/hooks'
import { SvgMovableBox } from './SvgMovableBox'
import {
  DisplayVerticalBarContext,
  MainScoreContext
} from '../context/DisplayContext'
import {
  type VerticalPentagramProps,
  type CircleData
} from '../interface/types'
import {
  CIRCLE_RADIUS,
  IDEAL_SPACING,
  NUMBER_OF_PENTAGRAM_LINES
} from '../enums/constants'
import { updateWidth } from '../utils/utils'
import { DISPLAY_MODE } from '../enums/mode'
import type { BarData, VerticalBarData } from '../interface/BarInterface'

/**
 *
 * A component that contains all Xth bar from all pentagrams
 * @param indexBar - is just the index of the currentBar
 *
 */

export function VerticalPentagram({ indexBar }: VerticalPentagramProps) {
  const mainScore = useContext(MainScoreContext)
  if (!mainScore) {
    console.error('MainScoreContext not available in VerticalPentagram')
    return null
  }

  const {
    maxPentagram,
    allPentagramsData,
    setAllPentagramsData,
    setSelectedNote,
    setMaxBar,
    mode
  } = mainScore

  // WIP template for placeholders needs to be reworked when importing the actual svg
  const MIN_ITEM_WIDTH = CIRCLE_RADIUS * 2 + IDEAL_SPACING
  const MIN_VIEWBOX_WIDTH =
    MIN_ITEM_WIDTH * NUMBER_OF_PENTAGRAM_LINES + IDEAL_SPACING

  //General minimum height WILL be removed cuz its stupid to keep it here
  const [svgViewboxHeight, setSvgViewboxHeight] = useState<number>(100)

  // General viewBoxWidth
  const [svgViewboxWidth, setSvgViewboxWidth] =
    useState<number>(MIN_VIEWBOX_WIDTH)

  const [pentagramUniqueIds, setPentagramUniqueIds] = useState<string[]>([])
  const barRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (maxPentagram != null) {
      const newIds: string[] = []
      for (let i = 0; i < maxPentagram; i++) {
        newIds.push(`pentagram-${indexBar}-${i}`)
      }
      setPentagramUniqueIds(newIds)
    }
  }, [maxPentagram, indexBar])
  useEffect(() => {
    let hasClef = false
    for (
      let index = 0;
      index < allPentagramsData[indexBar].allBar.length && !hasClef;
      index++
    ) {
      if (allPentagramsData[indexBar].allBar[index].claveVisible) hasClef = true
    }
    const totalWidth = updateWidth({
      maxPentagram,
      indexBar,
      allPentagramsData: allPentagramsData,
      hasClef
    })
    setSvgViewboxWidth(totalWidth)
  }, [allPentagramsData, maxPentagram, indexBar, mode])

  const handleCircleAdded = useCallback(
    (pentagramIndex: number, noteList: CircleData[]) => {
      const copyAllPentagramsData = [...allPentagramsData]
      if (
        copyAllPentagramsData[indexBar] &&
        copyAllPentagramsData[indexBar].allBar[pentagramIndex]
      ) {
        copyAllPentagramsData[indexBar].allBar[pentagramIndex].currentNotes =
          noteList
        setAllPentagramsData(copyAllPentagramsData)
      }
    },
    [allPentagramsData, indexBar, setAllPentagramsData]
  )

  const handleCircleClickedInBox = useCallback(
    (barId: number, pentagramId: number, noteId: number) => {
      setSelectedNote({
        barIndex: barId,
        noteIndex: noteId,
        currentPentagram: pentagramId
      })
    },
    [setSelectedNote]
  )

  const memoizedPentagramBoxes = useMemo(() => {
    return pentagramUniqueIds.map((id, i) => (
      <SvgMovableBox
        key={id}
        onCircleAdded={(noteList) => handleCircleAdded(i, noteList)}
        onCircleClicked={handleCircleClickedInBox}
        indexPentagram={i}
        indexBar={indexBar}
      />
    ))
  }, [
    pentagramUniqueIds,
    handleCircleAdded,
    handleCircleClickedInBox,
    indexBar
  ])

  const checkCollisionVertical = (event: MouseEvent) => {
    if (!barRef.current) return
    const barRect = barRef.current.getBoundingClientRect()
    const clientX = event.clientX - barRect.left
    let currentId = indexBar
    const copyAllPentagramsData = [...allPentagramsData]
    const barContent: BarData[] = []
    for (
      let pentagramIndex = 0;
      pentagramIndex < maxPentagram;
      pentagramIndex++
    ) {
      barContent.push({
        currentNotes: [],
        claveIndex: 0,
        claveVisible: false
      })
    }
    const initialData: VerticalBarData = {
      allBar: barContent
    }
    if (mode === DISPLAY_MODE.ADD_BAR) {
      currentId = clientX <= svgViewboxWidth / 2 ? indexBar : indexBar + 1
      setMaxBar((actualMax) => actualMax + 1)
      //Necesito una funcion que actualice las posiciones XD
      if (currentId !== 0) {
        for (
          let index = 0;
          index < copyAllPentagramsData[currentId - 1].allBar.length;
          index++
        ) {
          initialData.allBar[index].claveIndex =
            copyAllPentagramsData[currentId - 1].allBar[index].claveIndex
        }
      } else {
        for (
          let index = 0;
          index < copyAllPentagramsData[indexBar].allBar.length;
          index++
        ) {
          copyAllPentagramsData[indexBar].allBar[index].claveVisible = false
        }
      }
      copyAllPentagramsData.splice(currentId, 0, initialData)
      setAllPentagramsData(copyAllPentagramsData)
    } else if (mode === DISPLAY_MODE.REMOVE_BAR) {
      setMaxBar((actualMax) => {
        if (actualMax <= 1)
          copyAllPentagramsData.splice(currentId, 1, initialData)
        else copyAllPentagramsData.splice(currentId, 1)
        return Math.max(actualMax - 1, 1)
      })
      setAllPentagramsData(copyAllPentagramsData)
    }

    return
  }
  return (
    <DisplayVerticalBarContext.Provider
      value={{
        svgViewboxWidth,
        setSvgViewboxHeight,
        svgViewboxHeight
      }}
    >
      <article
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={checkCollisionVertical}
        ref={barRef}
        onMouseDown={(e) => {
          if (mode != DISPLAY_MODE.SELECT_NOTE) e.stopPropagation()
        }}
      >
        {memoizedPentagramBoxes}
      </article>
    </DisplayVerticalBarContext.Provider>
  )
}
