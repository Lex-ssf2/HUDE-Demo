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
import {
  ALL_CLAVES,
  CIRCLE_RADIUS,
  LINE_DIFF,
  MAX_NOTE_SIZE,
  MINIMUM_START_DISTANCE
} from '../enums/constants'
import {
  ALL_POSIBLE_NOTES,
  MIDI_BASE_VALUE,
  NOTE_DURATION,
  SEMITONE_DIFF
} from '../enums/Notes'
import { Blanca, Negra, Redonda } from '../assets/Notes'
import { ClaveDo, ClaveF, ClaveSol } from '../assets/Claves'

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
    maxHeight[indexPentagram][0] === undefined ||
    maxHeight[indexPentagram][1] === undefined
  )
    return

  const circleRadius: number = 20
  const offsetYStart = 25

  const svgRef = useRef<SVGSVGElement | null>(null)
  let nextCircleId = useRef(0)
  const actualYOffset = maxHeight[indexPentagram][0]
  const actualYOffsetBottom = maxHeight[indexPentagram][1]
  const viewBoxString: string = `0 ${
    actualYOffset - offsetYStart
  } ${svgViewboxWidth} ${
    offsetYStart + svgViewboxHeight - actualYOffset + actualYOffsetBottom
  }`
  const [pentagramLines, setPentagramLines] = useState<JSX.Element[]>([])
  const [toggleClave, setToggleClave] = useState(
    allPentagramsData[indexBar].allBar[indexPentagram].claveVisible
  )

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
    if (!svgRef.current) return
    const svgRect = svgRef.current.getBoundingClientRect()
    const copyPentagram = [...allPentagramsData]
    const clickedCirclesData =
      copyPentagram[indexBar].allBar[indexPentagram].currentNotes
    if (mode === DISPLAY_MODE.TOGGLE_CLAVE) {
      setToggleClave(
        !copyPentagram[indexBar].allBar[indexPentagram].claveVisible
      )
      copyPentagram[indexBar].allBar[indexPentagram].claveVisible =
        !copyPentagram[indexBar].allBar[indexPentagram].claveVisible
      let actualSize =
        copyPentagram[indexBar].allBar[indexPentagram].claveVisible ||
        indexBar === 0
          ? MINIMUM_START_DISTANCE
          : CIRCLE_RADIUS * 1.5
      let lastSize = 1
      for (let index = 0; index < clickedCirclesData.length; index++) {
        clickedCirclesData[index].cx = actualSize
        lastSize = clickedCirclesData[index].noteDuration
        actualSize += MAX_NOTE_SIZE / lastSize
      }
      setAllPentagramsData(copyPentagram)
      return
    }
    if (mode != DISPLAY_MODE.ADD_NOTE) return
    const clientY = event.clientY - svgRect.top
    const clientX = event.clientX - svgRect.left
    const yInSvgCoords =
      (clientY / svgRect.height) *
      (svgViewboxHeight - actualYOffset + actualYOffsetBottom + offsetYStart)
    const actualClientX = (clientX / svgRect.width) * svgViewboxWidth
    const clickedCy = yInSvgCoords + actualYOffset - offsetYStart
    const actualNoteYPos =
      Math.round(clickedCy / (LINE_DIFF / 2)) * (LINE_DIFF / 2)
    let actualSize =
      copyPentagram[indexBar].allBar[indexPentagram].claveVisible ||
      indexBar === 0
        ? MINIMUM_START_DISTANCE
        : CIRCLE_RADIUS * 1.5
    let lastSize = 1
    let isInMiddle = false
    const startLine =
      ALL_CLAVES[copyPentagram[indexBar].allBar[indexPentagram].claveIndex]
        .startLine
    const difference = ALL_POSIBLE_NOTES.length - startLine
    const startNumScale =
      ALL_CLAVES[copyPentagram[indexBar].allBar[indexPentagram].claveIndex]
        .startNumScale
    const noteIndex =
      (ALL_POSIBLE_NOTES.length +
        startLine -
        (actualNoteYPos % ALL_POSIBLE_NOTES.length)) %
      ALL_POSIBLE_NOTES.length
    const actualNoteName = ALL_POSIBLE_NOTES[noteIndex]
    const actualScaleNum =
      startNumScale +
      Math.floor((startLine - difference - actualNoteYPos / 8) / 7)
    const midiValue =
      MIDI_BASE_VALUE[noteIndex] + (actualScaleNum - 1) * SEMITONE_DIFF
    console.log(actualNoteName, midiValue, actualScaleNum)
    const newCircleData: CircleData = {
      id: nextCircleId.current++,
      cy: actualNoteYPos,
      cx: MAX_NOTE_SIZE / currentNoteSize,
      status: 'ok',
      noteDuration: currentNoteSize
    }
    for (let index = 0; index < clickedCirclesData.length; index++) {
      if (actualClientX < clickedCirclesData[index].cx && !isInMiddle) {
        lastSize = currentNoteSize
        newCircleData.cx = actualSize
        clickedCirclesData.splice(index, 0, newCircleData)
        copyPentagram[indexBar].allBar[indexPentagram].currentNotes =
          clickedCirclesData
        isInMiddle = true
        actualSize += MAX_NOTE_SIZE / lastSize
        index++
      }
      clickedCirclesData[index].cx = actualSize
      lastSize = clickedCirclesData[index].noteDuration
      actualSize += MAX_NOTE_SIZE / lastSize
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
      /*
          <circle
            key={circleData.id}
            cx={circleData.cx}
            cy={circleData.cy}
            r={newCircleRadius}
            fill="rgba(0, 100, 255, 0.0)"
            stroke="blue"
            stroke-width="1"
          />
      */
      return (
        <svg
          style={{
            overflow: 'visible'
          }}
        >
          {renderFigure(circleData, (e) => {
            e.stopPropagation()
            handleCircleClick(circleData, e)
          })}
          {extraLines}
          <rect
            x={circleData.cx - 10}
            y={actualYOffset - offsetYStart}
            width={MAX_NOTE_SIZE / circleData.noteDuration}
            height={
              svgViewboxHeight -
              actualYOffset +
              actualYOffsetBottom +
              offsetYStart
            }
            fill={
              circleData.status === 'ok'
                ? 'rgba(38, 0, 255, 0)'
                : 'rgba(255, 0, 0, 0.18)'
            }
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
    svgViewboxHeight,
    toggleClave
  ])
  const changeClave = (e: MouseEvent) => {
    if (mode === DISPLAY_MODE.TOGGLE_CLAVE) return
    e.stopPropagation()
    const copyPentagram = [...allPentagramsData]
    copyPentagram[indexBar].allBar[indexPentagram].claveIndex++
    copyPentagram[indexBar].allBar[indexPentagram].claveIndex %=
      ALL_CLAVES.length
    setAllPentagramsData(copyPentagram)
  }
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
        height: `${
          svgViewboxHeight - actualYOffset + actualYOffsetBottom + offsetYStart
        }px`
      }}
    >
      {pentagramLines}
      {renderedCircles}
      {((indexBar === 0 &&
        allPentagramsData[indexBar].allBar[indexPentagram].claveIndex !==
          undefined) ||
        allPentagramsData[indexBar].allBar[indexPentagram].claveVisible) &&
        currentClave(
          allPentagramsData[indexBar].allBar[indexPentagram].claveIndex,
          changeClave
        )}
    </svg>
  )
}

const currentClave = (indexClave: number, onClick: (e: MouseEvent) => void) => {
  const arrayOfElements = [
    <ClaveSol x={-25} onClick={onClick} />,
    <ClaveF x={-25} y={6} onClick={onClick} />,
    <ClaveDo x={-25} y={12.5} onClick={onClick} />
  ]
  return arrayOfElements[indexClave % ALL_CLAVES.length]
}

const renderFigure = (
  noteInfo: CircleData,
  onClick: (event: MouseEvent) => void
) => {
  const X_DISTANCE = 9
  const STEM_LENGTH = 45
  const STEM_WIDTH = 2.7
  const MEDIUM_VALUE = 8 * 4
  switch (noteInfo.noteDuration) {
    case NOTE_DURATION.REDONDA:
      return (
        <Redonda
          key={noteInfo.id}
          x={noteInfo.cx}
          y={noteInfo.cy}
          onClick={onClick}
        />
      )
      break
    case NOTE_DURATION.BLANCA:
      return (
        <svg
          style={{
            overflow: 'visible'
          }}
        >
          <line
            x1={
              noteInfo.cy > MEDIUM_VALUE
                ? noteInfo.cx + X_DISTANCE
                : noteInfo.cx - X_DISTANCE
            }
            x2={
              noteInfo.cy > MEDIUM_VALUE
                ? noteInfo.cx + X_DISTANCE
                : noteInfo.cx - X_DISTANCE
            }
            y1={noteInfo.cy}
            y2={
              noteInfo.cy > MEDIUM_VALUE
                ? noteInfo.cy - STEM_LENGTH
                : noteInfo.cy + STEM_LENGTH
            }
            stroke="black"
            stroke-width={STEM_WIDTH}
          />
          <Blanca
            key={noteInfo.id}
            x={noteInfo.cx}
            y={noteInfo.cy}
            onClick={onClick}
          />
        </svg>
      )
      break
    case NOTE_DURATION.NEGRA:
      return (
        <svg
          style={{
            overflow: 'visible'
          }}
        >
          <line
            x1={
              noteInfo.cy > MEDIUM_VALUE
                ? noteInfo.cx + X_DISTANCE
                : noteInfo.cx - X_DISTANCE
            }
            x2={
              noteInfo.cy > MEDIUM_VALUE
                ? noteInfo.cx + X_DISTANCE
                : noteInfo.cx - X_DISTANCE
            }
            y1={noteInfo.cy}
            y2={
              noteInfo.cy > MEDIUM_VALUE
                ? noteInfo.cy - STEM_LENGTH
                : noteInfo.cy + STEM_LENGTH
            }
            stroke="black"
            stroke-width={STEM_WIDTH}
          />
          <Negra
            key={noteInfo.id}
            x={noteInfo.cx}
            y={noteInfo.cy}
            onClick={onClick}
          />
        </svg>
      )
      break
    default:
      return <></>
      break
  }
}
