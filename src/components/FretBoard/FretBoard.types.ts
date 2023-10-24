export interface NoteDefinition {
  num: number
  x: number
  name: string
  key: string
  fret: number
}

export interface StringInfo {
  nr: number
  y: number
  tuning: string
  hidden: NoteDefinition[]
  visible: NoteDefinition[]
}

export interface Fret {
  nr: number
  x: number
}

export interface Poly {
  fret: number
  points: string
}

export interface FretLine {
  y1: number
  y2: number
  lines: Fret[]
}

export interface Scale {
  tonic: string
  type: string
  notes: string[]
  intervals: string[]
}

export interface TuningItems {
  name: string
  tuning: string
}

export interface InstrumentTuning {
  instrument: string
  tunings: TuningItems[]
}

export interface ScaleDefinition {
  tonic: string
  type: string
}

export interface FretBoardSetting {
  notation: string
  frets: number
  ShowMusicSheet: string
  ShowChords: string
}
