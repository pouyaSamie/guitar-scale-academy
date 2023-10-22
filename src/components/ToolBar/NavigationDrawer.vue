<template>
  <v-navigation-drawer temporary v-model="drawer"> {{ drawer }} </v-navigation-drawer>

  <v-app-bar>
    <v-app-bar-nav-icon @click="updateDrawer"> </v-app-bar-nav-icon>

    <img src="@/assets/img/logo.png" width="100" height="46" class="ml-3" />

    <v-app-bar-title></v-app-bar-title>

    <v-btn target="_blank" href="https://github.com/pouyaSamie/guitar-scale-academy" icon>
      <v-icon>mdi-github</v-icon>
    </v-btn>
  </v-app-bar>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(false)
function updateDrawer() {
  drawer.value = !drawer.value
  console.log('updated', drawer.value)
}
</script>
