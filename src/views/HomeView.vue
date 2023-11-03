<template>
  <v-container fluid>
    <v-row>
      <v-col cols="11">
        <FretboardContainer v-for="item in fretBoardItem" :key="item" />
      </v-col>
      <v-col class="d-flex justify-start" cols="1">
        <v-icon
          class="mt-3"
          @click="AddFretBoard"
          color="success"
          size="large"
          icon="mdi-plus-box"
        ></v-icon>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import FretboardContainer from '@/components/FretBoard/FretboardContainer.vue'
import { ref } from 'vue'
let fretBoardItem = ref<number>(1)

function AddFretBoard() {
  fretBoardItem.value++
}
</script>
