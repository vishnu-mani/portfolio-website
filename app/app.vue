<script setup lang="ts">
const ready = ref(false)
</script>

<template>
  <div class="app">
    <AppPreloader @complete="ready = true" />
    <AppCursor />
    <SiteHeader />

    <main>
      <NuxtPage :ready="ready" />
    </main>
  </div>
</template>

<style>
html.is-loading {
  overflow: hidden;
}
</style>
