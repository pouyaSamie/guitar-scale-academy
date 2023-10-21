<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavigationDrawer from './components/ToolBar/NavigationDrawer.vue'
</script>

<template>
  <v-app id="inspire">
    <NavigationDrawer />

    <v-main class="d-flex align-center justify-center" style="min-height: 300px">
      <RouterView />
    </v-main>
  </v-app>
  <header>
    <!-- <nav>
        <RouterLink to="/">Home</RouterLink>
      </nav> -->
  </header>
</template>
<style></style>
