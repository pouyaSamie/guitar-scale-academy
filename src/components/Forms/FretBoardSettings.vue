<template>
  <v-row>
    <v-col cols="4">
      <v-autocomplete
        v-model="userTuning"
        :items="props.tuning"
        auto-select-first
        color="blue-grey lighten-2"
        label="Tuning"
        :item-title="(item) => `${item.name} - ${item.tuning}`"
        item-value="tuning"
        density="compact"
      >
      </v-autocomplete>
    </v-col>
    <v-col cols="5">
      <v-autocomplete
        v-model="userScale"
        auto-select-first
        :items="props.scale"
        :item-title="
          (item) => `${item.name}  ${item.aliases?.length > 0 ? '( ' + item.aliases[0] + ' )' : ''}`
        "
        item-value="name"
        color="blue-grey lighten-2"
        label="Scale"
        density="compact"
      >
      </v-autocomplete>
    </v-col>
    <v-col cols="3">
      <v-autocomplete
        v-model="userTonic"
        :items="props.tonics"
        auto-select-first
        color="blue-grey lighten-2"
        label="Tonic"
        density="compact"
      >
      </v-autocomplete>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ScaleInfoDefinition, ScaleNames, TuningItems } from '../FretBoard/FretBoard.types'
import type { PropType } from 'vue'

let userTuning = ref<string>('E A D G B E')
let userTonic = ref<string>('C')
const props = defineProps({
  tuning: {
    type: Array<TuningItems>
  },
  notation: { type: String, default: () => 'Sharp' },
  frets: { type: Number, default: () => 12 },
  scale: { type: Array as PropType<ScaleNames[]>, default: () => {} },
  tonics: { type: Array<string>, default: [] }
})

let userScale = ref<ScaleNames | string>({ name: 'major' } as ScaleNames)

const emit = defineEmits<{
  onUserScaleChange: [value: ScaleInfoDefinition]
  onUserTuningChange: [value: string]
  onUserTonicChange: [value: ScaleInfoDefinition]
}>()

watch(userScale, (newValue) => {
  console.log(newValue)
  emit('onUserScaleChange', { tonic: userTonic.value, type: newValue } as ScaleInfoDefinition)
})

watch(userTuning, (newValue) => {
  emit('onUserTuningChange', newValue)
})

watch(userTonic, (newValue) => {
  emit('onUserTonicChange', { tonic: newValue, type: userScale.value } as ScaleInfoDefinition)
})
</script>
