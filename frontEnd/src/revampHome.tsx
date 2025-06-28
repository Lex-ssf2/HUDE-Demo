import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext
} from 'preact/hooks' // Import useMemo
import { type JSX } from 'preact/jsx-runtime'
import type {
  SvgMovableBoxProps,
  CircleData,
  VerticalPentagramProps,
  VerticalBarData,
  BarData
} from './revamp/interface/BarInterface'
import {
  DisplayVerticalBarContext,
  MainScoreContext
} from './revamp/context/DisplayContext'

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
    onCircleAdded(
      actualPosition + (circleRadius + 10 * currentNoteSize),
      copyPentagram[indexBar].allBar[indexPentagram].currentNotes
    )
  }

  const handleCircleClick = useCallback(
    (circleDataToReturn: CircleData, event: MouseEvent) => {
      console.log('huh')
      event.stopPropagation()
      if (onCircleClicked) {
        onCircleClicked(
          allPentagramsData[indexBar].allBar[
            indexPentagram
          ].currentNotes.indexOf(circleDataToReturn),
          id
        )
      }
    },
    [onCircleClicked, mode, allPentagramsData]
  )
  const renderedCircles = useMemo(() => {
    const newCircleRadius = circleRadius / 2
    const actualBarTmp =
      allPentagramsData[indexBar].allBar[indexPentagram].currentNotes
    if (!actualBarTmp || actualBarTmp.length === 0) return []
    let tmpYOffset = 0
    let minY = Infinity
    let maxY = -Infinity
    const updatedBar = actualBarTmp.map((circleData) => {
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
    })
    const copyMaxHeight: number[] = [0, 0]
    if (tmpYOffset > minY) copyMaxHeight[0] = minY

    console.log(minY, tmpYOffset)
    const fullHeigth = svgViewboxHeight
    if (fullHeigth <= maxY)
      copyMaxHeight[1] = maxY - fullHeigth + newCircleRadius
    setMaxHeightPerBar((prevHeight) => {
      const newHeight = [...prevHeight]
      newHeight[indexPentagram] = [...newHeight[indexBar]]
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

export function VerticalPentagram({ indexBar }: VerticalPentagramProps) {
  const mainScore = useContext(MainScoreContext)
  if (!mainScore) return
  const { maxPentagram, allPentagramsData, setAllPentagramsData } = mainScore
  if (maxPentagram == null) return

  const NEW_CIRCLE_RADIUS = 20 / 2
  const IDEAL_SPACING = 10
  const MIN_ITEM_WIDTH = NEW_CIRCLE_RADIUS * 2 + IDEAL_SPACING
  const MIN_VIEWBOX_WIDTH = MIN_ITEM_WIDTH * 5 + IDEAL_SPACING

  const [svgViewboxWidth, setSvgViewboxWidth] =
    useState<number>(MIN_VIEWBOX_WIDTH)
  const [svgViewboxHeight, setSvgViewboxHeight] = useState<number>(100)
  const [currentNoteSize, setCurrentNoteSize] = useState<number>(1)
  const [mode, setMode] = useState<number>(0)
  const [currentNote, setCurrentNote] = useState<CircleData | null>(null)

  // Use a state for IDs to ensure consistency across renders
  const [pentagramUniqueIds, setPentagramUniqueIds] = useState<string[]>([])

  const [selectedNote, setSelectedNote] = useState<{ id: string; pos: number }>(
    {
      id: '',
      pos: -1
    }
  )

  useEffect(() => {
    if (maxPentagram != null) {
      const newIds: string[] = []
      for (let i = 0; i < maxPentagram; i++) {
        const pentagramId = `box${i}`
        newIds.push(pentagramId)
      }
      setPentagramUniqueIds(newIds)
    }
  }, [allPentagramsData])

  const handleCircleAdded = useCallback(
    (id: number, newCountForThisBox: number, noteList: CircleData[]) => {
      let maxRequiredWidth = MIN_VIEWBOX_WIDTH
      const requiredWidthForThisBox = newCountForThisBox
      if (requiredWidthForThisBox > maxRequiredWidth) {
        maxRequiredWidth = requiredWidthForThisBox
      }
      if (
        maxRequiredWidth !== svgViewboxWidth &&
        maxRequiredWidth > svgViewboxWidth
      ) {
        setSvgViewboxWidth(maxRequiredWidth)
      }
      const copyallPentagramsData = [...allPentagramsData]
      copyallPentagramsData[indexBar].allBar[id].currentNotes = noteList
      setAllPentagramsData(copyallPentagramsData)
    },
    [MIN_VIEWBOX_WIDTH, MIN_ITEM_WIDTH, IDEAL_SPACING, svgViewboxWidth]
  )

  const handleCircleClickedInBox = useCallback(
    (circleId: number, barId: string) => {
      setSelectedNote({ id: barId, pos: circleId })
    },
    [allPentagramsData]
  )
  /*useEffect(() => {
    if (selectedNote.id === '' || selectedNote.pos === -1) return

    const tmpAllBars = { ...allBars }
    const currentBar = tmpAllBars[selectedNote.id]
    if (!currentBar) {
      console.warn(`Bar with ID ${selectedNote.id} not found.`)
      return
    }
    const currentNotesInBar = [...currentBar]
    const actualNote = currentNotesInBar[selectedNote.pos]

    if (!actualNote) {
      console.warn(
        `Note at position ${selectedNote.pos} not found in bar ${selectedNote.id}.`
      )
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (mode === 0) {
        let newCy = actualNote.cy
        switch (event.key) {
          case 'ArrowUp':
            newCy -= 10
            break
          case 'ArrowDown':
            newCy += 10
            break
          default:
            return
        }
        const updatedNote = { ...actualNote, cy: newCy }
        currentNotesInBar[selectedNote.pos] = updatedNote
        tmpAllBars[selectedNote.id] = currentNotesInBar
        setAllBars(tmpAllBars)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedNote, allBars, mode])*/

  const memoizedPentagramBoxes = useMemo(() => {
    return pentagramUniqueIds.map((id, i) => (
      <SvgMovableBox
        key={id}
        id={id}
        onCircleAdded={(count, noteList) =>
          handleCircleAdded(i, count, noteList)
        }
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
        <section></section>
        {memoizedPentagramBoxes}
      </article>
    </DisplayVerticalBarContext.Provider>
  )
}

/*
        <SvgMovableBox
          id="box1"
          onCircleAdded={(count, noteList) =>
            handleCircleAdded('box1', count, noteList)
          }
          onCircleClicked={(index, id) => handleCircleClickedInBox(index, id)}
          actualBar={allBars['box1']}
          indexPentagram={0}
          indexBar={indexBar}
        />
        <SvgMovableBox
          id="box2"
          onCircleAdded={(count, noteList) =>
            handleCircleAdded('box2', count, noteList)
          }
          onCircleClicked={handleCircleClickedInBox}
          actualBar={allBars['box2']}
          indexPentagram={1}
          indexBar={indexBar}
        />
*/
export function MainScore() {
  const [maxHeight, setMaxHeight] = useState<number[][]>([[]])
  const [maxPentagram, setMaxPentagram] = useState<number>(3)
  const [maxBar] = useState<number>(2)
  const [mode, setMode] = useState<number>(0)
  const [currentNoteSize, setCurrentNoteSize] = useState(1)
  const [maxHeightPerBar, setMaxHeightPerBar] = useState<number[][][]>([[[]]])
  const [allPentagramsData, setAllPentagramsData] = useState<VerticalBarData[]>(
    () => {
      const initialData: VerticalBarData[] = []
      for (let barIndex = 0; barIndex < maxBar; barIndex++) {
        const barContent: BarData[] = []
        for (
          let pentagramIndex = 0;
          pentagramIndex < maxPentagram;
          pentagramIndex++
        ) {
          barContent.push({ currentNotes: [] })
        }
        initialData.push({ allBar: barContent })
      }
      return initialData
    }
  )
  useEffect(() => {
    const copyallPentagramsData = [...allPentagramsData]
    for (let i = 0; i < maxPentagram; i++) {
      for (
        let pentagramIndex = 0;
        pentagramIndex < maxPentagram;
        pentagramIndex++
      ) {
        console.log(pentagramIndex, 'holaxd')
        if (
          !copyallPentagramsData[i] ||
          copyallPentagramsData[i].allBar[pentagramIndex]
        )
          continue
        copyallPentagramsData[i].allBar[pentagramIndex] = {
          currentNotes: []
        }
      }
    }
    setAllPentagramsData(copyallPentagramsData)
    let maxHeight: number[][] = []
    for (let index = 0; index < maxPentagram; index++) {
      const initArray = [0, 0]
      maxHeight.push(initArray)
    }
    setMaxHeight(maxHeight)
    const maxHeightPerBar: number[][][] = []
    for (let i = 0; i < maxPentagram; i++) {
      const currentBar: number[][] = []
      for (let j = 0; j < maxBar; j++) {
        const verticalBar: number[] = [0, 0]
        currentBar.push(verticalBar)
      }
      maxHeightPerBar.push(currentBar)
    }
    setMaxHeightPerBar(maxHeightPerBar)
  }, [maxPentagram])
  useEffect(() => {
    let minY = Infinity
    let maxY = -Infinity
    //This is to avoid NaN in the initialization
    if (
      !maxHeightPerBar[maxPentagram - 1] ||
      !maxHeightPerBar[maxPentagram - 1][0] ||
      Number.isNaN(maxHeightPerBar[maxPentagram - 1][0][0])
    )
      return
    const copyMaxHeight = [...maxHeight]
    for (let j = 0; j < maxPentagram; j++) {
      minY = Infinity
      maxY = -Infinity
      for (let i = 0; i < maxBar; i++) {
        minY = Math.min(minY, maxHeightPerBar[j][i][0])
        maxY = Math.max(maxY, maxHeightPerBar[j][i][1])
      }
      copyMaxHeight[j][0] = minY
      copyMaxHeight[j][1] = maxY
    }
    setMaxHeight(copyMaxHeight)
  }, [maxHeightPerBar, allPentagramsData])
  return (
    <MainScoreContext.Provider
      value={{
        maxHeight,
        setMaxHeightPerBar,
        maxPentagram,
        setMaxPentagram,
        allPentagramsData,
        setAllPentagramsData,
        mode,
        setMode,
        currentNoteSize,
        setCurrentNoteSize
      }}
    >
      <div>
        <button
          onClick={() => {
            setMaxPentagram((previo) => previo + 1)
          }}
        >
          Pentagrama++
        </button>
        <button
          onClick={() => {
            setMaxPentagram((previo) => Math.max(previo - 1, 1))
          }}
        >
          Pentagrama--
        </button>
        <button onClick={() => setMode(0)}>Select</button>
        <button onClick={() => setMode(1)}>Add</button>
        <button onClick={() => setCurrentNoteSize(1)}>1</button>
        <button onClick={() => setCurrentNoteSize(2)}>2</button>
        <button onClick={() => setCurrentNoteSize(4)}>3</button>
      </div>
      <section
        style={{
          display: 'flex',
          border: '1px solid blue',
          height: '100%',
          width: '100%'
        }}
      >
        <VerticalPentagram indexBar={0} />
        <VerticalPentagram indexBar={1} />
      </section>
    </MainScoreContext.Provider>
  )
}
