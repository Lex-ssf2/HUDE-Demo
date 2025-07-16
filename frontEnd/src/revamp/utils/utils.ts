// src/utils.ts

import {
  CIRCLE_RADIUS,
  IDEAL_SPACING,
  NUMBER_OF_PENTAGRAM_LINES
} from '../enums/constants'
import { type UpdateWidthProps } from '../enums/types'

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
    let tmpSize = 0
    for (let j = 0; j < allTMPNotes.length; j++) {
      tmpSize += (CIRCLE_RADIUS + IDEAL_SPACING) * lastSize
      lastSize = allTMPNotes[j].actualSize
    }
    tmpSize += (CIRCLE_RADIUS + IDEAL_SPACING) * lastSize // Account for the last note's space
    fullSize = Math.max(fullSize, tmpSize)
  }
  return fullSize
}
