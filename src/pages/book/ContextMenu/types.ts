export interface ISelection {
  cfi: string,
  pos: {
    left?: number,
    right?: number,
    top?: number,
    bottom?: number,
  }
  text: string
}

export interface INote {
  id: number,
  bookId: number,
  sectionIndex: number,
  cfi: string,
  date: {year: number, month: number, day: number},
  text: string,
  view?: string,
  color?: string,
}

