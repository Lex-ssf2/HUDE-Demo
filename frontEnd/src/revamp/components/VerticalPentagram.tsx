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
import {
  type VerticalPentagramProps,
  type CircleData
} from '../constants/types'
import {
  CIRCLE_RADIUS,
  IDEAL_SPACING,
  NUMBER_OF_PENTAGRAM_LINES
} from '../constants/constants'
import { updateWidth } from '../utils/utils'

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

  const MIN_ITEM_WIDTH = CIRCLE_RADIUS * 2 + IDEAL_SPACING
  const MIN_VIEWBOX_WIDTH =
    MIN_ITEM_WIDTH * NUMBER_OF_PENTAGRAM_LINES + IDEAL_SPACING

  const [svgViewboxWidth, setSvgViewboxWidth] =
    useState<number>(MIN_VIEWBOX_WIDTH)
  const [svgViewboxHeight, setSvgViewboxHeight] = useState<number>(100)
  const [currentNoteSize, setCurrentNoteSize] = useState<number>(1)
  const [currentNote, setCurrentNote] = useState<CircleData | null>(null)

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
    if (mode === 2 || mode === 1) {
      const totalWidth = updateWidth({
        maxPentagram,
        indexBar,
        allPentagramsData: allPentagramsData
      })
      setSvgViewboxWidth(totalWidth)
    }
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
        id={id}
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
        setCurrentNote,
        currentNote,
        setSvgViewboxWidth,
        svgViewboxWidth,
        setSvgViewboxHeight,
        svgViewboxHeight,
        setCurrentNoteSize,
        currentNoteSize
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
