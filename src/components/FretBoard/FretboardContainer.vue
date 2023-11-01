<template>
  <v-row dense justify="center">
    <v-col cols="8">
      <FretBoardSettings
        @on-user-scale-change="ScaleChanged"
        @on-user-tonic-change="TonicChanged"
        @on-user-tuning-change="TuningChanged"
        :scale="ALL_SCALES"
        :tuning="Tunings[0].tunings"
        :tonics="Tonics"
      />
    </v-col>
  </v-row>
  <v-row dense justify="center">
    <v-col cols="12" class="d-flex justify-center">
      <FretBoard
        :tuning="tuning"
        :notation="settings.notation"
        :frets="settings.frets"
        :scale-tonic="scaleInfo.tonic"
        :scale-type="scaleInfo.type"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import FretBoard from './FretBoard.vue'
import FretBoardSettings from '@/components/Forms/FretBoardSettings.vue'
import { Tunings } from './Tunings'
import { Tonics } from './Tonics'
import { Note, ScaleType } from 'tonal'
import { type FretBoardSetting, type ScaleInfoDefinition, type ScaleNames } from './FretBoard.types'

var ALL_SCALES: ScaleNames[] = []
for (var scaleType of ScaleType.all()) {
  ALL_SCALES.push({ name: scaleType.name, aliases: scaleType.aliases })
}

const scaleInfo = ref<ScaleInfoDefinition>({ tonic: 'C', type: 'major' })
const settings = ref<FretBoardSetting>({
  notation: 'sharps',
  frets: 18,
  ShowMusicSheet: 'false',
  ShowChords: 'true'
})

let usrTuning = ref(localStorage.getItem('tuning') || 'E A D G B E')
const tuning = computed(() => {
  let tune = usrTuning.value.trim().split(' ').map(Note.chroma).reverse()
  return tune as number[]
})

function ScaleChanged(scale: ScaleInfoDefinition): void {
  console.log(scale)
  scaleInfo.value = scale
}

function TonicChanged(scale: ScaleInfoDefinition): void {
  scaleInfo.value = scale
}

function TuningChanged(tuning: string): void {
  usrTuning.value = tuning
}
</script>

<style scoped></style>
