<template>
  <svg class="fretboard" :width="width + 150" :height="height + 100">
    <!--
    <text font-size="11" x="10" y="20" fill="black">TODO: Tuning: E A D G</text>
    -->

    <g transform="translate(80, 50)">
      <!-- Copyright
      <text
        font-size="11"
        :x="width"
        :y="height + 20"
        fill="gray"
        dominant-baseline="hanging"
        text-anchor="end"
      >
        created with fretty.app
      </text>
      -->

      <!-- fret inlays -->
      <polygon
        v-for="inlay in polys"
        :key="'inlay_' + inlay.fret"
        :points="inlay.points"
        style="fill: rgb(38 38 38)"
      />

      <!-- string lines -->
      <line
        v-for="string in strings"
        :key="'string_' + string.nr"
        x1="0"
        :y1="string.y"
        :x2="width"
        :y2="string.y"
        stroke="#ccc"
        stroke-width="1"
      />

      <!-- nut -->
      <line
        x1="0"
        y1="0"
        x2="0"
        :y2="height"
        stroke="#ccc"
        stroke-width="5"
        stroke-linecap="round"
      />

      <!-- frets -->

      <line
        v-for="fret in fretsShape?.lines"
        :key="'fret_' + fret.nr"
        :x1="fret.x"
        :y1="fretsShape?.y1"
        :x2="fret.x"
        :y2="fretsShape?.y2"
        stroke="#ccc"
      />

      <!-- notes -->
      <g v-for="string in strings" :key="'ng_' + string.nr">
        <!-- hidden notes -->
        <g v-for="note in string.hidden" :key="note.key">
          <transition name="fade">
            <g v-show="note.num == hover_note">
              <!-- circle -->
              <circle
                :cx="note.x"
                :cy="string.y"
                r="10"
                stroke-width="1"
                fill="#ccc"
                stroke="#ccc"
              />
              <!-- name -->
              <text
                font-size="14"
                :x="note.x"
                :y="string.y"
                dominant-baseline="central"
                fill="black"
                text-anchor="middle"
              >
                {{ note.name }}
              </text>
            </g>
          </transition>
          <circle
            @mouseleave="hover_note = -1"
            @mouseover="hover_note = note.num"
            r="10"
            :cx="note.x"
            :cy="string.y"
            fill="transparent"
          />
        </g>

        <!-- visible notes -->
        <transition-group name="list" tag="g" appear>
          <g v-for="note in string.visible" :key="note.key">
            <!-- circle -->
            <circle
              :cx="note.x"
              :cy="string.y"
              r="10"
              :stroke-dasharray="hover_note == note.num && note.num != root ? '4,4' : '0'"
              :fill="root == note.num ? 'red' : 'white'"
              stroke="black"
            />
            <!-- name -->
            <text
              font-size="14"
              :x="note.x"
              :y="string.y"
              dominant-baseline="central"
              :fill="root == note.num ? 'white' : 'black'"
              :font-weight="root == note.num ? 'bold' : 'normal'"
              text-anchor="middle"
            >
              {{ note.name }}
            </text>
            <circle
              @mouseleave="hover_note = -1"
              @mouseover="hover_note = note.num"
              r="10"
              :cx="note.x"
              :cy="string.y"
              fill="transparent"
            />
          </g>
        </transition-group>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Midi } from 'tonal'
import type { StringInfo, FretLine, Poly, Note, Fret } from './FretBoard.types'
import { computed } from 'vue'

onMounted(() => {
  fretsShape.value = fret_lines()
  polys.value = inlay_polys()
  strings.value = getStrings()
})
const props = defineProps({
  tuning: {
    type: Array as () => number[],
    default: () => [4, 11, 7, 2, 9, 4]
  },
  notes: {
    type: Array as () => number[],
    default: () => []
  },
  notation: { type: String, default: () => 'Sharp' },
  frets: { type: Number, default: () => 12 },
  root: { type: Number, default: () => -1 },
  scale: { type: Object, default: () => {} }
})
let { tuning, notes, root, scale, frets, notation } = props

let hover_note = ref<number>(-1)
// let root = ref<number>(-1)
let strings = ref<StringInfo[]>([])
let fretsShape = ref<FretLine>()
let polys = ref<Poly[]>([])

// let frets = 18
scale = { tonic: 'A', type: 'minor', notes: [], intervals: [] }
let string_spacing: number = 42
let inlays = ref<number[]>([3, 5, 7, 9, 12, 15, 17, 19, 21])
// let notation: String = 'Sharp'
const width = computed(() => fretpos(frets - 1))
const height = computed(() => {
  let tunningLength = 6
  if (tuning.length > 0) tunningLength = tuning.length
  return (tunningLength - 1) * string_spacing
})

function getStrings(): StringInfo[] {
  let result: StringInfo[] = []
  tuning.forEach((tuning, string) => {
    // find notes
    let normalized_notes = normalize(notes)
    let visible: Note[] = []
    let hidden: Note[] = []
    for (let fret = 0; fret < frets; fret++) {
      let num = (tuning + fret) % 12
      let note = {
        num: num,
        fret: fret,
        name: toname(num),
        x: (fretpos(fret - 1) + fretpos(fret)) / 2,
        key: 'n' + string + '_' + fret
      }
      if (normalized_notes.includes(num)) {
        visible.push(note)
      } else {
        hidden.push(note)
      }
    }

    if (tuning != undefined) {
      result.push({
        nr: string,
        y: string * string_spacing,
        tuning: toname(tuning),
        visible: visible,
        hidden: hidden
      })
    }
  })
  return result
}

function fret_lines() {
  let lines: Fret[] = []
  for (let i = 1; i < frets; i++) {
    lines.push({
      nr: i,
      x: fretpos(i)
    })
  }

  return {
    y1: height.value == 0 ? -string_spacing / 4 : 0,
    y2: height.value == 0 ? string_spacing / 4 : height.value,
    lines: lines
  } as FretLine
}

function inlay_polys(): Poly[] {
  let result: Poly[] = []
  if (!tuning.length) return result
  for (let fret of inlays.value) {
    if (fret >= frets) break

    const resize_x = 0.6
    const resize_y = fret == 12 ? 0.8 : 0.6

    let hgt = height.value
    let top = hgt / 2 - (hgt * resize_y) / 2
    if (hgt < 10) {
      hgt = 10
      top = -5
    }
    const bottom = top + hgt * resize_y
    const left = fretpos(fret - 1)
    const right = fretpos(fret)
    const width = right - left

    const nleft = left + width / 2 - (width * resize_x) / 2
    const nright = nleft + width * resize_x

    let points
    if (fret == 12) {
      points = [
        [nleft, top],
        [nright, top],
        [nright, bottom],
        [nleft, bottom]
      ]
    } else {
      points = [
        [left + width / 2, top],
        [nleft, hgt / 2],
        [left + width / 2, bottom],
        [nright, hgt / 2]
      ]
    }

    let pointsstr = ''
    for (let point of points) {
      pointsstr += point[0].toString() + ',' + point[1].toString() + ' '
    }

    result.push({
      fret: fret,
      points: pointsstr
    })
  }
  return result
}
function fretpos(n: number): number {
  // https://www.liutaiomottola.com/formulae/fret.htm
  if (n <= 20) {
    const s = 1300
    let d = s - s / Math.pow(2, n / 12)
    return Math.round(d * 1000) / 1000
  } else {
    let p19 = fretpos(19)
    let p20 = fretpos(20)
    return p20 + (p20 - p19) * (n - 20)
  }
}
function toname(x: number) {
  let sharp = notation != 'flat'
  let name = Midi.midiToNoteName(x, {
    sharps: sharp,
    pitchClass: true
  })

  if (notation != 'Intervals') return name

  var index = scale.notes.indexOf(name)
  if (index == -1) return name

  return scale.intervals[index]
}

function normalize(notes: number[]): number[] {
  return notes.map((x) => x % 12)
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
