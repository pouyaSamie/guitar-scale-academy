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
        :item-value="(item) => item"
        color="blue-grey lighten-2"
        label="Scale"
        density="compact"
      >
      </v-autocomplete>
    </v-col>
    <v-col cols="2">
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
    <v-col cols="1">
      <div class="text-center">
        <v-menu v-model="menu" :close-on-content-click="false" location="bottom center">
          <template v-slot:activator="{ props }">
            <v-btn class="mt-2" color="rgb(1, 101, 231)" v-bind="props">
              <v-icon color="white" size="large" icon="mdi-cog"></v-icon>
            </v-btn>
          </template>

          <v-card min-width="500">
            <v-list>
              <v-list-item>
                <!-- <v-slider v-model="FretSettings" :min="4" :max="24"></v-slider> -->
                <v-slider
                  v-model="FretSettings"
                  :min="4"
                  :max="22"
                  label="Frets"
                  hide-details
                  :step="1"
                  class="ma-4"
                >
                  <template v-slot:append>
                    <v-text-field
                      v-model="FretSettings"
                      type="number"
                      style="width: 80px"
                      density="compact"
                      hide-details
                    ></v-text-field>
                  </template>
                </v-slider>

                <v-btn-toggle density="compact" v-model="userNotation" color="primary" mandatory>
                  <v-btn value="Sharp"
                    ><v-icon class="pr-2">mdi-music-accidental-sharp</v-icon>Sharp</v-btn
                  >
                  <v-btn value="flat"
                    ><v-icon class="pr-2">mdi-music-accidental-flat</v-icon>flat</v-btn
                  >
                  <v-btn value="Intervals"
                    ><v-icon class="pr-2">mdi-music-note-quarter</v-icon>Intervals</v-btn
                  >
                </v-btn-toggle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NotationType, type ScaleInfoDefinition, type ScaleNames, type TuningItems } from '../FretBoard/FretBoard.types'
import type { PropType } from 'vue'

let userTuning = ref<string>('E A D G B E')
let userTonic = ref<string>('C')
let menu = ref<boolean>(false)
let FretSettings = ref<number>(18)

const props = defineProps({
  tuning: {
    type: Array<TuningItems>
  },
  frets: { type: Number, default: () => 18 },
  scale: { type: Array as PropType<ScaleNames[]>, default: () => {} },
  tonics: { type: Array<string>, default: [] }
})
let userNotation = ref<NotationType>(NotationType.Sharp)
let userScale = ref<ScaleNames>({ name: 'major' } as ScaleNames)

const emit = defineEmits<{
  onUserScaleChange: [value: ScaleInfoDefinition]
  onUserTuningChange: [value: string]
  onUserTonicChange: [value: ScaleInfoDefinition]
  onFretNumberChange: [value: number],
   onUserNotationChange: [value: NotationType]
}>()

watch(userScale, (newValue: ScaleNames) => {
  emit('onUserScaleChange', { tonic: userTonic.value, type: newValue.name } as ScaleInfoDefinition)
})

watch(userTuning, (newValue) => {
  emit('onUserTuningChange', newValue)
})

watch(userTonic, (newValue: string) => {
  emit('onUserTonicChange', { tonic: newValue, type: userScale.value.name } as ScaleInfoDefinition)
})

watch(FretSettings, (newValue: number) => {
  emit('onFretNumberChange', newValue)
})

watch(userNotation, (newValue: NotationType) => {
  emit('onUserNotationChange', newValue)
})
</script>
