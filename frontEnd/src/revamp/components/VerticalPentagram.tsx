import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext
} from 'preact/hooks'
import { SvgMovableBox } from './SvgMovableBox'
import {
  DisplayVerticalBarContext,
  MainScoreContext
} from '../context/DisplayContext'
import { type VerticalPentagramProps, type CircleData } from '../enums/types'
import {
  CIRCLE_RADIUS,
  IDEAL_SPACING,
  NUMBER_OF_PENTAGRAM_LINES
} from '../enums/constants'
import { updateWidth } from '../utils/utils'

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
    const totalWidth = updateWidth({
      maxPentagram,
      indexBar,
      allPentagramsData: allPentagramsData
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
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {memoizedPentagramBoxes}
      </article>
    </DisplayVerticalBarContext.Provider>
  )
}
