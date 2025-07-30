// src/utils.ts

import {
  CIRCLE_RADIUS,
  IDEAL_SPACING,
  MAX_NOTE_SIZE,
  MINIMUM_START_DISTANCE,
  NUMBER_OF_PENTAGRAM_LINES
} from '../enums/constants'
import { type UpdateWidthProps } from '../interface/types'

export function updateWidth({
  maxPentagram,
  indexBar,
  allPentagramsData
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
      allPentagramsData[indexBar].allBar[i].claveVisible || indexBar === 0
        ? MINIMUM_START_DISTANCE
        : CIRCLE_RADIUS * 1.5
    for (let j = 0; j < allTMPNotes.length; j++) {
      lastSize = allTMPNotes[j].noteDuration
      tmpSize += MAX_NOTE_SIZE / lastSize
    }
    fullSize = Math.max(fullSize, tmpSize)
  }
  return fullSize
}
