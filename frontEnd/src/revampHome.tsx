import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext
} from 'preact/hooks' // Import useMemo
import type { JSX } from 'preact/jsx-runtime'
import type {
  SvgMovableBoxProps,
  CircleData
} from './revamp/interface/BarInterface'
import { DisplayVerticalBarContext } from './revamp/context/DisplayContext'

export function SvgMovableBox({
  onCircleAdded,
  id,
  onCircleClicked,
  actualBar
}: SvgMovableBoxProps) {
  const context = useContext(DisplayVerticalBarContext)
  if (!context) return

  const { svgViewboxHeight, svgViewboxWidth, currentNoteSize, mode } = context
  const circleRadius: number = 20

  const svgRef = useRef<SVGSVGElement | null>(null)

  const [clickedCirclesData, setClickedCirclesData] = useState<CircleData[]>([])
  let nextCircleId = useRef(0)
  const [actualYOffset, setActualYOffset] = useState(0)
  const [actualYOffsetBottom, setActualYOffsetBottom] = useState(0)
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
    const scaleY = svgRect.height / Number(svgViewboxHeight)
    const clickedCy = clientY / scaleY

    let actualSize = circleRadius + 10
    let lastSize = 0
    for (let index = 0; index < clickedCirclesData.length; index++) {
      lastSize = clickedCirclesData[index].actualSize
      actualSize += (circleRadius + 10) * lastSize
    }
    //console.log(actualSize)
    const actualPosition = actualSize
    const newCircleData = {
      id: nextCircleId.current++,
      cy: clickedCy,
      cx: actualPosition,
      actualSize: currentNoteSize
    }
    const updatedCirclesData = [...actualBar, newCircleData]
    setClickedCirclesData(updatedCirclesData)
    onCircleAdded(
      actualPosition + (circleRadius + 10 * currentNoteSize),
      updatedCirclesData
    )
  }

  const handleCircleClick = useCallback(
    (circleDataToReturn: CircleData, event: MouseEvent) => {
      event.stopPropagation()
      if (onCircleClicked) {
        onCircleClicked(actualBar.indexOf(circleDataToReturn), id)
      }
    },
    [onCircleClicked, mode]
  )
  const renderedCircles = useMemo(() => {
    const newCircleRadius = circleRadius / 2

    if (actualBar.length === 0) return []
    let tmpYOffset = 0
    let tmpYOffsetBottom = 0
    const updatedBar = actualBar.map((circleData) => {
      if (tmpYOffset > circleData.cy) tmpYOffset = circleData.cy
      const fullHeigth = svgViewboxHeight - actualYOffset
      if (fullHeigth < circleData.cy)
        tmpYOffsetBottom = circleData.cy - fullHeigth + newCircleRadius
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
    })
    setActualYOffset(tmpYOffset)
    setActualYOffsetBottom(tmpYOffsetBottom)
    return updatedBar
  }, [clickedCirclesData, svgViewboxWidth, circleRadius, actualBar, mode])
  return (
    <svg
      ref={svgRef}
      viewBox={viewBoxString}
      onClick={handleSvgClick}
      style={{
        border: '1px solid black',
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

export function VerticalPentagram() {
  const NEW_CIRCLE_RADIUS = 20 / 2
  const IDEAL_SPACING = 10
  const MIN_ITEM_WIDTH = NEW_CIRCLE_RADIUS * 2 + IDEAL_SPACING
  const MIN_VIEWBOX_WIDTH = MIN_ITEM_WIDTH * 5 + IDEAL_SPACING
  const [svgViewboxWidth, setSvgViewboxWidth] =
    useState<number>(MIN_VIEWBOX_WIDTH)
  const [svgViewboxHeight, setSvgViewboxHeight] = useState<number>(100)

  const [, setCirclesCountPerBox] = useState<Record<string, number>>({})
  //console.log(circlesCountPerBox)
  const [currentNoteSize, setCurrentNoteSize] = useState<number>(1)
  const [mode, setMode] = useState<number>(0)
  const [currentNote, setCurrentNote] = useState<CircleData | null>(null)
  const [allBars, setAllBars] = useState<Record<string, CircleData[]>>({
    box1: [],
    box2: []
  })
  const [selectedNote, setSelectedNote] = useState<{ id: string; pos: number }>(
    { id: '', pos: -1 }
  )
  const handleCircleAdded = (
    id: string,
    newCountForThisBox: number,
    noteList: CircleData[]
  ) => {
    setCirclesCountPerBox((prevCounts) => {
      const updatedCounts = {
        ...prevCounts,
        [id]: newCountForThisBox
      }

      let maxRequiredWidth = MIN_VIEWBOX_WIDTH
      Object.entries(updatedCounts).forEach(([, count]) => {
        if (count > 0) {
          const requiredWidthForThisBox = count
          if (requiredWidthForThisBox > maxRequiredWidth) {
            maxRequiredWidth = requiredWidthForThisBox
          }
        }
      })
      if (maxRequiredWidth !== svgViewboxWidth) {
        setSvgViewboxWidth(maxRequiredWidth)
      }

      return updatedCounts
    })
    setAllBars((prevAllBars) => ({
      ...prevAllBars,
      [id]: noteList
    }))
  }
  const handleCircleClickedInBox = useCallback(
    (circleId: number, barId: string) => {
      setSelectedNote({ id: barId, pos: circleId })
      /*if (mode === 0) {
        setAllBars((prevAllBars) => {
          const updatedAllBars = { ...prevAllBars }

          const currentBarCircles = updatedAllBars[barId]
          if (!currentBarCircles) {
            console.warn(`Bar with ID ${barId} not found.`)
            return prevAllBars
          }
          const updatedBarCircles = [...currentBarCircles]

          if (circleId === -1) {
            console.warn(
              `Circle with ID ${circleId} not found in bar ${barId}.`
            )
            return prevAllBars
          }
          updatedBarCircles[circleId] = {
            ...updatedBarCircles[circleId],
            cy: 0
          }
          updatedAllBars[barId] = updatedBarCircles
          return updatedAllBars
        })
      }*/
    },
    [allBars, mode]
  )
  useEffect(() => {
    if (selectedNote.id === '' || selectedNote.pos === -1) return
    const tmpBar = { ...allBars }
    const currentBar = [...tmpBar[selectedNote.id]]
    const actualNote = currentBar[selectedNote.pos]
    const handleKeyDown = (event: KeyboardEvent) => {
      if (mode === 0) {
        switch (event.key) {
          case 'ArrowUp':
            actualNote.cy -= 10
            currentBar[selectedNote.pos] = actualNote
            tmpBar[selectedNote.id] = currentBar
            setAllBars(tmpBar)
            break
          case 'ArrowDown':
            actualNote.cy += 10
            currentBar[selectedNote.pos] = actualNote
            tmpBar[selectedNote.id] = currentBar
            setAllBars(tmpBar)
            break
          default:
            break
        }
      }
      console.log(actualNote.cy)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedNote, allBars])
  return (
    <DisplayVerticalBarContext.Provider
      value={{
        mode,
        setMode,
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
        <section>
          <button onClick={() => setMode(0)}>Select</button>
          <button onClick={() => setMode(1)}>Add</button>
          <button onClick={() => setCurrentNoteSize(1)}>1</button>
          <button onClick={() => setCurrentNoteSize(2)}>2</button>
          <button onClick={() => setCurrentNoteSize(4)}>3</button>
        </section>
        <SvgMovableBox
          id="box1"
          onCircleAdded={(count, noteList) =>
            handleCircleAdded('box1', count, noteList)
          }
          onCircleClicked={(index, id) => handleCircleClickedInBox(index, id)}
          actualBar={allBars['box1']}
        />
        <SvgMovableBox
          id="box2"
          onCircleAdded={(count, noteList) =>
            handleCircleAdded('box2', count, noteList)
          }
          onCircleClicked={handleCircleClickedInBox}
          actualBar={allBars['box2']}
        />
      </article>
    </DisplayVerticalBarContext.Provider>
  )
}
