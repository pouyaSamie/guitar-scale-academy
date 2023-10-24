import { Midi } from 'tonal'
import type { Fret, FretLine, NoteDefinition } from './FretBoard.types'

export function fretpos(fretNumber: number): number {
  const baseScale = 1300

  if (fretNumber <= 20) {
    const scaleFactor = Math.pow(2, fretNumber / 12)
    const distance = baseScale - baseScale / scaleFactor
    return Math.round(distance * 1000) / 1000
  } else {
    const previousFret19 = fretpos(19)
    const previousFret20 = fretpos(20)
    const delta = previousFret20 - previousFret19
    return previousFret20 + delta * (fretNumber - 20)
  }
}

export function normalize(notes: number[]): number[] {
  return notes.map((x) => x % 12)
}

export function createNote(
  num: number,
  fret: number,
  string: number,
  notation: string,
  scale: any
): NoteDefinition {
  return {
    num,
    fret,
    name: toname(num, notation, scale),
    x: (fretpos(fret - 1) + fretpos(fret)) / 2,
    key: `n${string}_${fret}`
  }
}

export function toname(x: number, notation: string, scale: any): string {
  const sharp = notation != 'flat'
  const name = Midi.midiToNoteName(x, {
    sharps: sharp,
    pitchClass: true
  })

  if (notation != 'Intervals') return name

  const index = scale.notes.indexOf(name)
  if (index == -1) return name

  return scale.intervals[index]
}

export function fret_lines(frets: number, height: number, string_spacing: number): FretLine {
  const lines: Fret[] = []
  for (let i = 1; i < frets; i++) {
    lines.push({
      nr: i,
      x: fretpos(i)
    })
  }

  return {
    y1: height == 0 ? -string_spacing / 4 : 0,
    y2: height == 0 ? string_spacing / 4 : height,
    lines: lines
  } as FretLine
}

export const StokeColor: string = '#454545'
