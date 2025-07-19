import {
  useRef,
  useMemo,
  useCallback,
  useContext,
  useState,
  useEffect
} from 'preact/hooks'
import { type JSX } from 'preact/jsx-runtime'
import { type CircleData, type SvgMovableBoxProps } from '../interface/types'
import {
  DisplayVerticalBarContext,
  MainScoreContext
} from '../context/DisplayContext'
import { DISPLAY_MODE } from '../enums/mode'
import { LINE_DIFF } from '../enums/constants'
import { allPosibleNotes } from '../enums/Notes'

/**
 *
 * Bar (The containter) that actually contains all notes
 * @param onCircleAdded - Updates Note´s array for that bar
 * @param onCircleClicked - Selects the Note and Note collision
 * @param indexPentagram - Pentagrams that the bar is on
 * @param indexBar - Index of the actualBar
 *
 */

export function SvgMovableBox({
  onCircleAdded,
  onCircleClicked,
  indexPentagram,
  indexBar
}: SvgMovableBoxProps) {
  const mainScoreContext = useContext(MainScoreContext)
  const verticalBarContext = useContext(DisplayVerticalBarContext)
  if (!verticalBarContext || !mainScoreContext) return
  const { svgViewboxHeight, svgViewboxWidth } = verticalBarContext
  const {
    maxHeight,
    setMaxHeightPerBar,
    setAllPentagramsData,
    allPentagramsData,
    currentNoteSize,
    mode
  } = mainScoreContext
  if (
    !maxHeight[indexPentagram] ||
    maxHeight[indexPentagram][0] == undefined ||
    maxHeight[indexPentagram][1] == undefined
  )
    return

  const circleRadius: number = 20
  const offsetYStart = 0

  const svgRef = useRef<SVGSVGElement | null>(null)

  let nextCircleId = useRef(0)
  const actualYOffset = maxHeight[indexPentagram][0]
  const actualYOffsetBottom = maxHeight[indexPentagram][1]
  const viewBoxString: string = `0 ${
    actualYOffset - offsetYStart
  } ${svgViewboxWidth} ${
    svgViewboxHeight - actualYOffset + actualYOffsetBottom
  }`
  const [currentSvgWidth, setCurrentSvgWidth] = useState(0)

  /*
   * Resize with the actual navigator size WIP
   * probably going to be removed to use a better approach
   **/
  useEffect(() => {
    const measureWidth = () => {
      if (svgRef.current) {
        const newWidth = svgRef.current.getBoundingClientRect().width
        if (newWidth !== currentSvgWidth) {
          setCurrentSvgWidth(newWidth)
        }
      }
    }
    measureWidth()
    window.addEventListener('resize', measureWidth)
    return () => {
      window.removeEventListener('resize', measureWidth)
    }
  }, [currentSvgWidth])

  const [pentagramLines, setPentagramLines] = useState<JSX.Element[]>([])

  useEffect(() => {
    const pentagram: JSX.Element[] = []
    const height = LINE_DIFF
    for (let index = 0; index < 5; index++) {
      pentagram.push(
        <line
          x1="0"
          y1={height * index}
          x2={svgViewboxWidth.toString()}
          y2={height * index}
          stroke="red"
          stroke-width="3"
        />
      )
    }
    setPentagramLines(pentagram)
  }, [svgViewboxWidth])

  //Clicking without touching any note :P inserts note
  const handleSvgClick = (event: MouseEvent) => {
    if (!svgRef.current || mode != DISPLAY_MODE.ADD_NOTE) return
    const svgRect = svgRef.current.getBoundingClientRect()
    const clientY = event.clientY - svgRect.top - offsetYStart
    const clientX = event.clientX - svgRect.left
    const yInSvgCoords =
      (clientY / svgRect.height) *
      (svgViewboxHeight - actualYOffset + actualYOffsetBottom)
    const clickedCy = yInSvgCoords + actualYOffset
    const actualNoteYPos =
      Math.round(clickedCy / (LINE_DIFF / 2)) * (LINE_DIFF / 2)
    const copyPentagram = [...allPentagramsData]
    const clickedCirclesData =
      copyPentagram[indexBar].allBar[indexPentagram].currentNotes
    let actualSize = circleRadius + 10
    let lastSize = 1
    let isInMiddle = false
    //The 5 is a number that changes to represent the first note of X key
    const actualNoteName =
      allPosibleNotes[
        (allPosibleNotes.length +
          5 -
          (actualNoteYPos % allPosibleNotes.length)) %
          allPosibleNotes.length
      ]
    console.log(actualNoteName)
    const newCircleData = {
      id: nextCircleId.current++,
      cy: actualNoteYPos,
      cx: (circleRadius + 10) * lastSize,
      actualSize: currentNoteSize,
      noteName: `${actualNoteName}`,
      actualIndex: actualNoteYPos
    }
    for (let index = 0; index < clickedCirclesData.length; index++) {
      if (clientX < clickedCirclesData[index].cx && !isInMiddle) {
        lastSize = currentNoteSize
        newCircleData.cx = actualSize
        clickedCirclesData.splice(index, 0, newCircleData)
        copyPentagram[indexBar].allBar[indexPentagram].currentNotes =
          clickedCirclesData
        isInMiddle = true
        actualSize += (circleRadius + 10) * lastSize
        index++
      }
      clickedCirclesData[index].cx = actualSize
      lastSize = clickedCirclesData[index].actualSize
      actualSize += (circleRadius + 10) * lastSize
    }
    if (!isInMiddle) {
      newCircleData.cx = actualSize
      copyPentagram[indexBar].allBar[indexPentagram].currentNotes.push(
        newCircleData
      )
    }
    setAllPentagramsData(copyPentagram)
    onCircleAdded(copyPentagram[indexBar].allBar[indexPentagram].currentNotes)
  }

  const handleCircleClick = useCallback(
    (circleDataToReturn: CircleData, event: MouseEvent) => {
      //event.stopPropagation()
      if (onCircleClicked) {
        onCircleClicked(
          indexBar,
          indexPentagram,
          allPentagramsData[indexBar].allBar[
            indexPentagram
          ].currentNotes.indexOf(circleDataToReturn)
        )
      }
    },
    [onCircleClicked, mode, allPentagramsData]
  )
  const renderedCircles = useMemo(() => {
    const newCircleRadius = circleRadius / 2
    // This verification is need it cuz for some reason when updating
    // the current notes sometimes it deletes the bar (?
    // not really sure whats happening but this avoids it
    if (!allPentagramsData[indexBar]) return
    const actualBarTmp =
      allPentagramsData[indexBar].allBar[indexPentagram].currentNotes
    const copyMaxHeight: number[] = [0, 0]
    if (!actualBarTmp || actualBarTmp.length === 0) {
      setMaxHeightPerBar((prevHeight) => {
        const newHeight = [...prevHeight]
        newHeight[indexPentagram] = [...newHeight[indexPentagram]]
        newHeight[indexPentagram][indexBar] = copyMaxHeight
        return newHeight
      })
      return []
    }
    // Calculing the max height
    let tmpYOffset = 0
    let minY = Infinity
    let maxY = -Infinity
    console.log(actualBarTmp.length)
    const updatedBar = actualBarTmp.map((circleData) => {
      minY = Math.min(minY, circleData.cy - newCircleRadius)
      maxY = Math.max(maxY, circleData.cy + newCircleRadius)
      const extraLines: JSX.Element[] = []
      const extraLinesNum = circleData.cy / LINE_DIFF
      const aproxY =
        Math.abs(extraLinesNum) - Math.floor(extraLinesNum) >= 0.9
          ? Math.round(extraLinesNum)
          : extraLinesNum
      const height = circleData.cy <= 0 ? Math.abs(aproxY) : aproxY - 4
      for (let index = 0; index <= height; index++) {
        extraLines.push(
          <line
            x1={circleData.cx - 15}
            y1={
              circleData.cy <= 0
                ? LINE_DIFF * index * -1
                : LINE_DIFF * (index + 4)
            }
            x2={circleData.cx + 15}
            y2={
              circleData.cy <= 0
                ? LINE_DIFF * index * -1
                : LINE_DIFF * (index + 4)
            }
            stroke="black"
            stroke-width="3"
          />
        )
      }
      return (
        <svg
          style={{
            overflow: 'visible'
          }}
        >
          <circle
            key={circleData.id}
            cx={circleData.cx}
            cy={circleData.cy}
            r={newCircleRadius}
            fill="rgba(0, 100, 255, 0.6)"
            stroke="blue"
            stroke-width="1"
            onClick={(e) => {
              e.stopPropagation()
              handleCircleClick(circleData, e)
            }}
          />
          {extraLines}
          <rect
            x={circleData.cx - 10}
            y={actualYOffset - offsetYStart}
            width={20 * circleData.actualSize}
            height={
              svgViewboxHeight -
              actualYOffset +
              actualYOffsetBottom +
              offsetYStart
            }
            fill="rgba(38, 0, 255, 0.18)"
            onClick={(e) => handleCircleClick(circleData, e)}
          />
        </svg>
      )
    })
    if (tmpYOffset > minY) copyMaxHeight[0] = minY

    const fullHeigth = svgViewboxHeight
    if (fullHeigth <= maxY)
      copyMaxHeight[1] = maxY - fullHeigth + newCircleRadius + offsetYStart
    setMaxHeightPerBar((prevHeight) => {
      const newHeight = [...prevHeight]
      newHeight[indexPentagram] = [...newHeight[indexPentagram]]
      newHeight[indexPentagram][indexBar] = copyMaxHeight
      return newHeight
    })
    return updatedBar
  }, [
    svgViewboxWidth,
    allPentagramsData[indexBar].allBar[indexPentagram].currentNotes,
    allPentagramsData[indexBar].allBar[indexPentagram].currentNotes.length,
    svgViewboxHeight
  ])
  return (
    <svg
      ref={svgRef}
      viewBox={viewBoxString}
      onClick={handleSvgClick}
      style={{
        borderRight: '2px solid black',
        backgroundColor: '#f0f0f0',
        overflow: 'visible',
        cursor: 'crosshair',
        width: `${svgViewboxWidth}px`,
        height: `${svgViewboxHeight - actualYOffset + actualYOffsetBottom}px`
      }}
    >
      {pentagramLines}
      {renderedCircles}
    </svg>
  )
}
