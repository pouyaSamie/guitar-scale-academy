<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <FretboardContainer v-for="item in fretBoardItem" :key="item" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import FretboardContainer from '@/components/FretBoard/FretboardContainer.vue'
import { ref } from 'vue'
let fretBoardItem = ref<number>(1)
</script>
