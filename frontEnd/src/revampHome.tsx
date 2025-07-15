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
  BarData,
  SelectedNote
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

    //console.log(minY, tmpYOffset)
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

export function VerticalPentagram({ indexBar }: VerticalPentagramProps) {
  const mainScore = useContext(MainScoreContext)
  if (!mainScore) return
  const {
    maxPentagram,
    allPentagramsData,
    setAllPentagramsData,
    setSelectedNote,
    mode
  } = mainScore
  if (maxPentagram == null) return

  const NEW_CIRCLE_RADIUS = 20 / 2
  const IDEAL_SPACING = 10
  const MIN_ITEM_WIDTH = NEW_CIRCLE_RADIUS * 2 + IDEAL_SPACING
  const MIN_VIEWBOX_WIDTH = MIN_ITEM_WIDTH * 5 + IDEAL_SPACING

  const [svgViewboxWidth, setSvgViewboxWidth] =
    useState<number>(MIN_VIEWBOX_WIDTH)
  const [svgViewboxHeight, setSvgViewboxHeight] = useState<number>(100)
  const [currentNoteSize, setCurrentNoteSize] = useState<number>(1)
  const [currentNote, setCurrentNote] = useState<CircleData | null>(null)

  // Use a state for IDs to ensure consistency across renders
  const [pentagramUniqueIds, setPentagramUniqueIds] = useState<string[]>([])

  useEffect(() => {
    if (maxPentagram != null) {
      const newIds: string[] = []
      for (let i = 0; i < maxPentagram; i++) {
        const pentagramId = `box${i}`
        newIds.push(pentagramId)
      }
      setPentagramUniqueIds(newIds)
    }
    //Está aqui para que tome en cuenta despues de usar el remove note
    if (mode === 2) {
      console.log('huh')
      const totalWidth = updateWidth({
        maxPentagram,
        indexBar,
        allPentagramsData: allPentagramsData
      })
      console.log(totalWidth)
      setSvgViewboxWidth(totalWidth)
    }
  }, [allPentagramsData])

  const handleCircleAdded = useCallback(
    (id: number, noteList: CircleData[]) => {
      const copyallPentagramsData = [...allPentagramsData]
      const totalWidth = updateWidth({
        maxPentagram,
        indexBar,
        allPentagramsData: copyallPentagramsData
      })
      console.log(totalWidth)
      setSvgViewboxWidth(totalWidth)
      copyallPentagramsData[indexBar].allBar[id].currentNotes = noteList
      setAllPentagramsData(copyallPentagramsData)
    },
    [allPentagramsData]
  )

  const handleCircleClickedInBox = useCallback(
    (barId: number, pentagramId: number, noteId: number) => {
      console.log('hi')
      setSelectedNote({
        barIndex: barId,
        noteIndex: noteId,
        currentPentagram: pentagramId
      })
    },
    [allPentagramsData]
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
    indexBar,
    svgViewboxWidth,
    mode
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
        <section></section>
        {memoizedPentagramBoxes}
      </article>
    </DisplayVerticalBarContext.Provider>
  )
}

export function MainScore() {
  const [maxHeight, setMaxHeight] = useState<number[][]>([[]])
  const [maxPentagram, setMaxPentagram] = useState<number>(3)
  const [maxBar, setMaxBar] = useState<number>(2)
  const [mode, setMode] = useState<number>(0)
  const [currentNoteSize, setCurrentNoteSize] = useState(1)
  const [maxHeightPerBar, setMaxHeightPerBar] = useState<number[][][]>([[[]]])
  const [barUniqueIds, setBarUniqueIds] = useState<string[]>([])
  const [selectedNote, setSelectedNote] = useState<SelectedNote>({
    barIndex: -1,
    noteIndex: -1,
    currentPentagram: -1
  })
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
    for (let i = 0; i < maxBar; i++) {
      if (!copyallPentagramsData[i]) {
        const tmpAllBar: BarData[] = []
        copyallPentagramsData[i] = { allBar: tmpAllBar }
      }
      for (
        let pentagramIndex = 0;
        pentagramIndex < maxPentagram;
        pentagramIndex++
      ) {
        if (copyallPentagramsData[i].allBar[pentagramIndex]?.currentNotes)
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
  }, [maxPentagram, maxBar])
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
    for (let i = 0; i < maxPentagram; i++) {
      minY = Infinity
      maxY = -Infinity
      for (let j = 0; j < maxBar; j++) {
        minY = Math.min(minY, maxHeightPerBar[i][j][0])
        maxY = Math.max(maxY, maxHeightPerBar[i][j][1])
      }
      copyMaxHeight[i][0] = minY
      copyMaxHeight[i][1] = maxY
    }
    //console.log(maxHeightPerBar)
    setMaxHeight(copyMaxHeight)
  }, [maxHeightPerBar, allPentagramsData])
  useEffect(() => {
    if (
      selectedNote.barIndex === -1 ||
      selectedNote.noteIndex === -1 ||
      selectedNote.currentPentagram === -1
    )
      return

    const tmpAllBars = [...allPentagramsData]
    const currentBar =
      tmpAllBars[selectedNote.barIndex].allBar[selectedNote.currentPentagram]
        .currentNotes
    if (!currentBar) {
      console.warn(`Bar with ID ${selectedNote.barIndex} not found.`)
      return
    }
    const currentNotesInBar = [...currentBar]
    const actualNote = currentNotesInBar[selectedNote.noteIndex]

    if (!actualNote) {
      console.warn(
        `Note at position ${selectedNote.noteIndex} not found in bar ${selectedNote.barIndex}.`
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
        currentNotesInBar[selectedNote.noteIndex] = updatedNote
        tmpAllBars[selectedNote.barIndex].allBar[
          selectedNote.currentPentagram
        ].currentNotes = currentNotesInBar
        setAllPentagramsData(tmpAllBars)
      }
    }
    if (mode === 2) {
      currentNotesInBar.splice(selectedNote.noteIndex, 1)
      const circleRadius = 20
      let lastSize = 1
      let tmpSize = 0
      for (let i = 0; i < currentNotesInBar.length; i++) {
        tmpSize += (circleRadius + 10) * lastSize
        lastSize = currentNotesInBar[i].actualSize
        currentNotesInBar[i].cx = tmpSize
      }
      tmpAllBars[selectedNote.barIndex].allBar[
        selectedNote.currentPentagram
      ].currentNotes = currentNotesInBar
      setAllPentagramsData(tmpAllBars)
      setSelectedNote({ barIndex: -1, noteIndex: -1, currentPentagram: -1 })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedNote, allPentagramsData, mode])
  useEffect(() => {
    if (maxBar != null) {
      const newIds: string[] = []
      for (let i = 0; i < maxBar; i++) {
        const pentagramId = `bar${i}`
        newIds.push(pentagramId)
      }
      setBarUniqueIds(newIds)
    }
  }, [maxBar])
  const memoizedBarBoxes = useMemo(() => {
    return barUniqueIds.map((id, i) => (
      <VerticalPentagram key={id} indexBar={i} />
    ))
  }, [barUniqueIds, maxBar])
  return (
    <MainScoreContext.Provider
      value={{
        maxHeight,
        setMaxHeightPerBar,
        maxPentagram,
        setMaxPentagram,
        maxBar,
        setMaxBar,
        allPentagramsData,
        setAllPentagramsData,
        mode,
        setMode,
        currentNoteSize,
        setCurrentNoteSize,
        selectedNote,
        setSelectedNote
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
        <button
          onClick={() => {
            setMaxBar((previo) => previo + 1)
          }}
        >
          Bar++
        </button>
        <button
          onClick={() => {
            setMaxBar((previo) => Math.max(previo - 1, 1))
          }}
        >
          Bar--
        </button>
        <button onClick={() => setMode(0)}>Select</button>
        <button onClick={() => setMode(1)}>Add</button>
        <button
          onClick={() => {
            setMode(2)
            setSelectedNote({
              barIndex: -1,
              noteIndex: -1,
              currentPentagram: -1
            })
          }}
        >
          Remove
        </button>
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
        {memoizedBarBoxes}
      </section>
    </MainScoreContext.Provider>
  )
}

interface updateWidthProps {
  maxPentagram: number
  indexBar: number
  allPentagramsData: VerticalBarData[]
}

export function updateWidth({
  maxPentagram,
  indexBar,
  allPentagramsData
}: updateWidthProps): number {
  const NEW_CIRCLE_RADIUS = 20 / 2
  const IDEAL_SPACING = 10
  const MIN_ITEM_WIDTH = NEW_CIRCLE_RADIUS * 2 + IDEAL_SPACING
  const MIN_VIEWBOX_WIDTH = MIN_ITEM_WIDTH * 5 + IDEAL_SPACING
  let fullSize = MIN_VIEWBOX_WIDTH
  const circleRadius = 20
  //Codigo para saber el tamaño horizontal del compas
  for (let i = 0; i < maxPentagram; i++) {
    const allTMPNotes = allPentagramsData[indexBar].allBar[i].currentNotes
    let lastSize = 1
    const currentNoteLength = allTMPNotes.length
    let tmpSize = 0
    for (let j = 0; j < currentNoteLength; j++) {
      tmpSize += (circleRadius + 10) * lastSize
      lastSize = allTMPNotes[j].actualSize
    }
    tmpSize += (circleRadius + 10) * lastSize
    fullSize = Math.max(fullSize, tmpSize)
  }
  return fullSize
}
