<template>
  <v-row dense justify="center">
    <v-col cols="11" lg="11" sm="11">
      <FretBoardSettings :scale="ALL_SCALES" :tuning="Tunings[0].tunings" :tonics="Tonics" />
    </v-col>
  </v-row>
  <v-row dense justify="center">
    <v-col cols="12" lg="8" sm="12">
      <FretBoard
        :tuning="tuning"
        :notes="notes"
        :notation="settings.notation"
        :frets="settings.frets"
        :root="root"
        :scale="scale_info"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import type { InstrumentTuning } from './FretBoard.types'
import FretBoard from './FretBoard.vue'
import FretBoardSettings from '@/components/Forms/FretBoardSettings.vue'
import { Tunings } from './Tunings'
import { Tonics } from './Tonics'
import { Note, Scale, Midi, ScaleType, Mode } from 'tonal'

var ALL_SCALES: string[] = []
for (var scale of ScaleType.all()) {
  ALL_SCALES.push(scale.name)
  ALL_SCALES.push(...scale.aliases)
}

interface Settings {
  usr_tuning: string
  notation: string
  frets: number
  scale: {
    tonic: string
    type: string
  }
  ShowMusicSheet: string
  ShowChords: string
}

const settings = ref<Settings>({
  usr_tuning: localStorage.getItem('tuning') || 'E A D G B E',
  notation: 'sharps',
  frets: 18,
  scale: { tonic: 'A', type: 'minor' },
  ShowMusicSheet: 'false',
  ShowChords: 'true'
})

const tuning = computed(() => {
  let tune = settings.value.usr_tuning.trim().split(' ').map(Note.chroma).reverse()
  return tune as number[]
})
const root = computed(() => Note.chroma(settings.value.scale.tonic))
const scale_info = computed(() =>
  Scale.get(settings.value.scale.tonic + ' ' + settings.value.scale.type)
)
const notes = computed(() => scale_info.value.notes.map(Note.chroma) as number[])
const scaleChords = computed(() =>
  Mode.triads(scale_info.value.type, scale_info.value.tonic as string)
)
const scale_search = computed(() => {
  return ALL_SCALES.filter((option) => {
    return option.toString().toLowerCase().indexOf(settings.value.scale.type.toLowerCase()) >= 0
  })
})

const tuning_search = computed(() => {
  const newData: InstrumentTuning[] = []
  Tunings.forEach((element) => {
    const items = element?.tunings.filter(
      (item) => item.tuning.toLowerCase().indexOf(settings.value.usr_tuning.toLowerCase()) >= 0
    )
    if (items.length) {
      newData.push({ instrument: element.instrument, tunings: items })
    }
  })
  return newData
})

function saveSettings() {
  localStorage.setItem('tuning', settings.value.usr_tuning)
}
function normalize(notes: number[]) {
  return notes.map((x) => x % 12)
}
function toname(x: number) {
  return Midi.midiToNoteName(x, {
    sharps: settings.value.notation != 'flat',
    pitchClass: true
  })
}
function scale_input(x: string) {
  if (x == '') {
    return
  }
}
</script>

<style scoped></style>
