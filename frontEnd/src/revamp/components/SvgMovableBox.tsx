import {
  useRef,
  useMemo,
  useCallback,
  useContext,
  useState,
  useEffect
} from 'preact/hooks'
import { type JSX } from 'preact/jsx-runtime'
import { type CircleData, type SvgMovableBoxProps } from '../constants/types'
import {
  DisplayVerticalBarContext,
  MainScoreContext
} from '../context/DisplayContext'

export function SvgMovableBox({
  onCircleAdded,
  id,
  onCircleClicked,
  indexPentagram,
  indexBar
}: SvgMovableBoxProps) {
  const mainScoreContext = useContext(MainScoreContext)
  const context = useContext(DisplayVerticalBarContext)
  if (!context || !mainScoreContext) return
  const { svgViewboxHeight, svgViewboxWidth } = context
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

  const svgRef = useRef<SVGSVGElement | null>(null)

  let nextCircleId = useRef(0)
  const actualYOffset = maxHeight[indexPentagram][0]
  const actualYOffsetBottom = maxHeight[indexPentagram][1]
  const viewBoxString: string = `0 ${actualYOffset} ${svgViewboxWidth} ${
    svgViewboxHeight - actualYOffset + actualYOffsetBottom
  }`
  const [currentSvgWidth, setCurrentSvgWidth] = useState(0)

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
  }, [currentSvgWidth, id])

  const [pentagramLines, setPentagramLines] = useState<JSX.Element[]>([])

  useEffect(() => {
    const pentagram: JSX.Element[] = []
    const height = 15
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
  const handleSvgClick = (event: MouseEvent) => {
    if (!svgRef.current || mode != 1) return

    const svgRect = svgRef.current.getBoundingClientRect()
    const clientY = event.clientY - svgRect.top
    const yInSvgCoords =
      (clientY / svgRect.height) *
      (svgViewboxHeight - actualYOffset + actualYOffsetBottom)
    const clickedCy = yInSvgCoords + actualYOffset
    const copyPentagram = [...allPentagramsData]
    const clickedCirclesData =
      copyPentagram[indexBar].allBar[indexPentagram].currentNotes
    let actualSize = circleRadius + 10
    let lastSize = 0
    for (let index = 0; index < clickedCirclesData.length; index++) {
      lastSize = clickedCirclesData[index].actualSize
      actualSize += (circleRadius + 10) * lastSize
    }
    const actualPosition = actualSize
    const newCircleData = {
      id: nextCircleId.current++,
      cy: clickedCy,
      cx: actualPosition,
      actualSize: currentNoteSize
    }
    copyPentagram[indexBar].allBar[indexPentagram].currentNotes.push(
      newCircleData
    )
    setAllPentagramsData(copyPentagram)
    onCircleAdded(copyPentagram[indexBar].allBar[indexPentagram].currentNotes)
  }

  const handleCircleClick = useCallback(
    (circleDataToReturn: CircleData, event: MouseEvent) => {
      event.stopPropagation()
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
    if (!actualBarTmp || actualBarTmp.length === 0) return []
    let tmpYOffset = 0
    let minY = Infinity
    let maxY = -Infinity
    const updatedBar = actualBarTmp.map(
      (circleData) => {
        minY = Math.min(minY, circleData.cy - newCircleRadius)
        maxY = Math.max(maxY, circleData.cy + newCircleRadius)
        return (
          <circle
            key={circleData.id}
            cx={circleData.cx}
            cy={circleData.cy}
            r={newCircleRadius}
            fill="rgba(0, 100, 255, 0.6)"
            stroke="blue"
            stroke-width="1"
            onClick={(e) => handleCircleClick(circleData, e)}
          />
        )
      },
      [allPentagramsData]
    )
    const copyMaxHeight: number[] = [0, 0]
    if (tmpYOffset > minY) copyMaxHeight[0] = minY

    const fullHeigth = svgViewboxHeight
    if (fullHeigth <= maxY)
      copyMaxHeight[1] = maxY - fullHeigth + newCircleRadius
    setMaxHeightPerBar((prevHeight) => {
      const newHeight = [...prevHeight]
      newHeight[indexPentagram] = [...newHeight[indexPentagram]]
      newHeight[indexPentagram][indexBar] = copyMaxHeight
      return newHeight
    })
    return updatedBar
  }, [svgViewboxWidth, circleRadius, allPentagramsData, mode])
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
