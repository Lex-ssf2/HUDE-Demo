import type { RefObject } from 'preact'
import {
  ALL_CLAVES,
  CIRCLE_RADIUS,
  IDEAL_SPACING,
  MAX_NOTE_SIZE,
  MINIMUM_START_DISTANCE,
  NUMBER_OF_PENTAGRAM_LINES
} from '../enums/constants'
import {
  ALL_POSIBLE_NOTES,
  MIDI_BASE_VALUE,
  SEMITONE_DIFF
} from '../enums/Notes'
import type { BarData } from '../interface/BarInterface'
import { type CircleData, type UpdateWidthProps } from '../interface/types'

export function updateWidth({
  maxPentagram,
  indexBar,
  allPentagramsData,
  hasClef
}: UpdateWidthProps): number {
  const MIN_ITEM_WIDTH = CIRCLE_RADIUS * 2 + IDEAL_SPACING
  const MIN_VIEWBOX_WIDTH =
    MIN_ITEM_WIDTH * NUMBER_OF_PENTAGRAM_LINES + IDEAL_SPACING

  let fullSize = MIN_VIEWBOX_WIDTH

  for (let i = 0; i < maxPentagram; i++) {
    const allTMPNotes = allPentagramsData[indexBar]?.allBar[i]?.currentNotes
    if (!allTMPNotes) continue
    let lastSize = 1
    let tmpSize =
      hasClef || indexBar === 0 ? MINIMUM_START_DISTANCE : CIRCLE_RADIUS * 1.5
    for (let j = 0; j < allTMPNotes.length; j++) {
      lastSize = allTMPNotes[j].noteDuration
      tmpSize += MAX_NOTE_SIZE / lastSize
    }
    fullSize = Math.max(fullSize, tmpSize)
  }
  return fullSize
}

export function getNoteInfo({
  currentBar,
  currentNote
}: {
  currentBar: BarData
  currentNote: CircleData
}): [string, number, number] {
  const startLine = ALL_CLAVES[currentBar.claveIndex].startLine
  const difference = ALL_POSIBLE_NOTES.length - ALL_POSIBLE_NOTES.indexOf('F')
  const startNumScale = ALL_CLAVES[currentBar.claveIndex].startNumScale
  const noteIndex =
    (ALL_POSIBLE_NOTES.length +
      startLine -
      (currentNote.cy % ALL_POSIBLE_NOTES.length)) %
    ALL_POSIBLE_NOTES.length
  const actualNoteName = ALL_POSIBLE_NOTES[noteIndex]
  const actualScaleNum =
    startNumScale +
    Math.floor((startLine - difference - currentNote.cy / 8) / 7)
  const midiValue =
    MIDI_BASE_VALUE[noteIndex] + (actualScaleNum - 1) * SEMITONE_DIFF
  return [actualNoteName, actualScaleNum, midiValue]
}

export function updatePosition({
  currentBar,
  indexBar,
  hasClef
}: {
  currentBar: BarData
  indexBar: number
  hasClef: boolean
}) {
  let actualSize =
    hasClef || indexBar === 0 ? MINIMUM_START_DISTANCE : CIRCLE_RADIUS * 1.5
  let lastSize = 1
  const clickedCirclesData = currentBar.currentNotes
  for (let index = 0; index < clickedCirclesData.length; index++) {
    clickedCirclesData[index].cx = actualSize
    lastSize = clickedCirclesData[index].noteDuration
    actualSize += MAX_NOTE_SIZE / lastSize
  }
  return [currentBar]
}

export function addNoteAndUpdate({
  currentBar,
  indexBar,
  actualNoteYPos,
  actualClientX,
  nextCircleId,
  currentNoteSize,
  hasClef
}: {
  currentBar: BarData
  indexBar: number
  actualNoteYPos: number
  actualClientX: number
  currentNoteSize: number
  nextCircleId: RefObject<number>
  hasClef: boolean
}) {
  if (nextCircleId === null || nextCircleId.current === null) return []
  const clickedCirclesData = currentBar.currentNotes
  let actualSize =
    hasClef || indexBar === 0 ? MINIMUM_START_DISTANCE : CIRCLE_RADIUS * 1.5
  let lastSize = 1
  let isInMiddle = false
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
      currentBar.currentNotes = clickedCirclesData
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
    currentBar.currentNotes.push(newCircleData)
  }
  return [currentBar]
}
