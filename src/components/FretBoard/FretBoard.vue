<template>
  <svg class="fretboard" :width="width + 150" :height="height + 100">
    <!--
    <text font-size="11" x="10" y="20" fill="black">TODO: Tuning: E A D G</text>
    -->

    <g transform="translate(80, 50)">
      :x="width" :y="height + 20"

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
        :stroke="StokeColor"
        stroke-width="1"
      />

      <!-- nut -->
      <line
        x1="0"
        y1="0"
        x2="0"
        :y2="height"
        :stroke="StokeColor"
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
        :stroke="StokeColor"
      />
      <text
        v-for="(fret, index) in fretsShape?.lines"
        font-size="14"
        :key="'fret_' + fret.nr"
        :x="(fretpos(fret.nr - 1) + fretpos(fret.nr) - 20) / 2"
        :y="fretsShape?.y1 - 45"
        dominant-baseline="hanging"
        fill="white"
        font-weight="bold"
      >
        {{ index + 1 }}
      </text>

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
                r="12"
                stroke-width="1"
                fill="#ccc"
                :stroke="StokeColor"
              />
              <!-- name -->
              <text
                font-size="14"
                :x="note.x"
                :y="string.y"
                dominant-baseline="central"
                fill="black"
                text-anchor="middle"
                font-weight="bold"
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
              r="13"
              :stroke-dasharray="hover_note == note.num && note.num != root ? '4,4' : '0'"
              :fill="root == note.num ? 'red' : '#0165E7'"
              stroke="#0165E7"
            />
            <!-- name -->
            <text
              font-size="18"
              :x="note.x"
              :y="string.y"
              dominant-baseline="central"
              :fill="'white'"
              font-weight="bold"
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
import type { StringInfo, FretLine, Poly, Note } from './FretBoard.types'
import { computed } from 'vue'
import { createNote, fret_lines, fretpos, normalize, StokeColor, toname } from './FretBoard'

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
let strings = ref<StringInfo[]>([])
let fretsShape = ref<FretLine>({ y1: 0, y2: 0, lines: [] })
let polys = ref<Poly[]>([])
scale = { tonic: 'A', type: 'minor', notes: [], intervals: [] }
let string_spacing: number = 42
let inlays = ref<number[]>([3, 5, 7, 9, 12, 15, 17, 19, 21])

const width = computed(() => fretpos(frets - 1))
const height = computed(() => {
  let tunningLength = 6
  if (tuning.length > 0) tunningLength = tuning.length
  return (tunningLength - 1) * string_spacing
})

onMounted(() => {
  fretsShape.value = fret_lines(frets, height.value, width.value)
  polys.value = inlay_polys()
  strings.value = getStrings()
})

function getStrings(): StringInfo[] {
  return tuning.map((tuning: number, string: number): StringInfo => {
    const normalizedNotes: number[] = normalize(notes)
    const visible: Note[] = []
    const hidden: Note[] = []

    for (let fret = 0; fret < frets; fret++) {
      const num: number = (tuning + fret) % 12
      const note: Note = createNote(num, fret, string, notation, scale)

      if (normalizedNotes.includes(num)) {
        visible.push(note)
      } else {
        hidden.push(note)
      }
    }

    return {
      nr: string,
      y: string * string_spacing,
      tuning: toname(tuning, notation, scale),
      visible,
      hidden
    }
  })
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
