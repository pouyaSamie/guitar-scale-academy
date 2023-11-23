<template>
  <svg class="fretboard" :width="width + 150" :height="height + 100">
    <!--
    <text font-size="11" x="10" y="20" fill="black">TODO: Tuning: E A D G</text>
    -->

    <g transform="translate(80, 60)">
      :x="width" :y="height + 20"

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
      <g v-for="(fret, index) in fretsShape?.lines" :key="'f' + index">
        <!-- circle -->
        <circle
          dominant-baseline="central"
          :cx="(fretpos(fret.nr - 1) + fretpos(fret.nr)) / 2"
          :cy="fretsShape?.y1 - 40"
          r="14"
          :fill="inlays.includes(index + 1) ? 'white' : 'transparent'"
        />

        <text
          font-size="14"
          :key="'fret_' + fret.nr"
          :x="(fretpos(fret.nr - 1) + fretpos(fret.nr)) / 2"
          :y="fretsShape?.y1 - 40"
          dominant-baseline="central"
          :fill="inlays.includes(index + 1) ? 'black' : 'white'"
          font-weight="bold"
          text-anchor="middle"
        >
          {{ index + 1 }}
        </text>
      </g>
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
              dominant-baseline="central"
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
import { onMounted, ref, watch, type PropType, reactive } from 'vue'
import type { StringInfo, FretLine, NoteDefinition } from './FretBoard.types'
import { computed } from 'vue'
import { createNote, fret_lines, fretpos, normalize, StokeColor, toname } from './FretBoard'
import { Note, Scale } from 'tonal'

const props = defineProps({
  tuning: {
    type: Array as () => number[],
    default: () => [4, 11, 7, 2, 9, 4]
  },
  notation: { type: String, default: () => 'Sharp' },
  frets: { type: Number, default: () => 12 },
  scaleMode: { type: String as PropType<string>, default: () => 'major' },
  scaleTonic: { type: String as PropType<string>, default: () => 'c' }
})

let { frets, notation } = props
let hover_note = ref<number>(-1)
let strings = ref<StringInfo[]>([])
let fretsShape = reactive<FretLine>({ y1: 0, y2: 0, lines: [] })
let root = ref<number>(-1)
const FretCount = ref<number>(props.frets)
let string_spacing: number = 42
let inlays: number[] = [3, 5, 7, 9, 12, 15, 17, 19, 21]

const width = computed(() => fretpos(FretCount.value - 1))
const height = computed(() => {
  let tunningLength = 6
  if (props.tuning.length > 0) tunningLength = props.tuning.length
  return (tunningLength - 1) * string_spacing
})

//  prettier-ignore
watch(
  [() => props.scaleMode, () => props.scaleTonic,() => props.tuning],
  () => {
        strings.value = getStrings();
  }

);

watch([() => props.frets], () => {
  FretCount.value = props.frets
  fretsShape = fret_lines(FretCount.value, height.value, width.value)
  strings.value = getStrings()
})

onMounted(() => {
  fretsShape = fret_lines(frets, height.value, width.value)
  strings.value = getStrings()
})

function getStrings(): StringInfo[] {
  let scale = Scale.get(`${props.scaleTonic} ${props.scaleMode}`)
  if (scale === undefined) return strings.value

  root.value = Note.chroma(props.scaleTonic as string) as number

  return props.tuning.map((tuning: number, string: number): StringInfo => {
    let notes = scale.notes.map(Note.chroma) as number[]
    const normalizedNotes: number[] = normalize(notes)
    const visible: NoteDefinition[] = []
    const hidden: NoteDefinition[] = []

    for (let fret = 0; fret < FretCount.value; fret++) {
      const num: number = (tuning + fret) % 12
      const note: NoteDefinition = createNote(num, fret, string, notation, scale)

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
