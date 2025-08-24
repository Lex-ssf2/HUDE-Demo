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
import { ALL_CLAVES, LINE_DIFF, MAX_NOTE_SIZE } from '../enums/constants'
import { addNoteAndUpdate, updatePosition } from '../utils/utils'
import { renderFigure, currentClave } from './renderFigure'

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
          stroke="black"
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
    let hasClef = copyPentagram[indexBar].clefVisible
    if (mode === DISPLAY_MODE.TOGGLE_CLAVE) {
      copyPentagram[indexBar].allBar[indexPentagram].claveVisible =
        !copyPentagram[indexBar].allBar[indexPentagram].claveVisible
      if (!copyPentagram[indexBar].allBar[indexPentagram].claveVisible) {
        const actualIndex =
          copyPentagram[Math.max(indexBar - 1, 0)].allBar[indexPentagram]
            .claveIndex
        copyPentagram[indexBar].allBar[indexPentagram].claveIndex = actualIndex

        //Update all pentagram after this one
        for (let index = indexBar + 1; index < copyPentagram.length; index++) {
          if (copyPentagram[index].allBar[indexPentagram].claveVisible) break
          copyPentagram[index].allBar[indexPentagram].claveIndex = actualIndex
        }
      }
      hasClef = copyPentagram[indexBar].allBar[indexPentagram].claveVisible
      for (
        let index = 0;
        index < copyPentagram[indexBar].allBar.length && !hasClef;
        index++
      ) {
        if (copyPentagram[indexBar].allBar[index].claveVisible) hasClef = true
      }
      copyPentagram[indexBar].clefVisible = hasClef
      for (
        let index = 0;
        index < copyPentagram[indexBar].allBar.length;
        index++
      ) {
        ;[copyPentagram[indexBar].allBar[index]] = updatePosition({
          currentBar: copyPentagram[indexBar].allBar[index],
          indexBar,
          hasClef
        })
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
    ;[copyPentagram[indexBar].allBar[indexPentagram]] = addNoteAndUpdate({
      currentBar: copyPentagram[indexBar].allBar[indexPentagram],
      indexBar,
      actualNoteYPos,
      actualClientX,
      nextCircleId,
      currentNoteSize,
      hasClef
    })
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
    console.log(indexBar, indexPentagram)
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
    allPentagramsData[indexBar].clefVisible,
    allPentagramsData[indexBar].tickNumber,
    svgViewboxHeight
  ])
  const changeClave = (e: MouseEvent) => {
    if (mode === DISPLAY_MODE.TOGGLE_CLAVE) return
    const copyPentagram = [...allPentagramsData]
    e.stopPropagation()
    copyPentagram[indexBar].allBar[indexPentagram].claveIndex++
    copyPentagram[indexBar].allBar[indexPentagram].claveIndex %=
      ALL_CLAVES.length
    const actualIndex =
      copyPentagram[indexBar].allBar[indexPentagram].claveIndex
    // Updates the next clef for the next pentagram
    for (let index = indexBar + 1; index < copyPentagram.length; index++) {
      if (copyPentagram[index].allBar[indexPentagram].claveVisible) break
      copyPentagram[index].allBar[indexPentagram].claveIndex = actualIndex
    }
    let hasClef = false
    for (
      let index = 0;
      index < copyPentagram[indexBar].allBar.length;
      index++
    ) {
      if (copyPentagram[indexBar].allBar[index].claveVisible) {
        hasClef = true
        break
      }
    }
    ;[copyPentagram[indexBar].allBar[indexPentagram]] = updatePosition({
      currentBar: copyPentagram[indexBar].allBar[indexPentagram],
      indexBar,
      hasClef
    })
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
