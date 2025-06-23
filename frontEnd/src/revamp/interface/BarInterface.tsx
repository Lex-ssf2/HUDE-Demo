export interface SvgMovableBoxProps {
  onCircleAdded: (newCircleCount: number, noteList: CircleData[]) => void
  id: string
  onCircleClicked: (index: number, actualId: string) => void
  actualBar: CircleData[]
  indexBar: number
  indexPentagram: number
}
export interface VerticalPentagramProps {
  indexBar: number
}

export interface CircleData {
  cx: number
  actualSize: number
  id: number
  cy: number
}
