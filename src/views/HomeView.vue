<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="4">
        <FretboardContainer />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import FretboardContainer from '@/components/FretBoard/FretboardContainer.vue'
</script>
