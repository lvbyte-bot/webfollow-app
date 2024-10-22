<template>
  <v-empty-state v-if="appStore.loading" height="100vh">
    <v-icon size="x-large" :class="{ rotating: appStore.loading }"
      >mdi-loading</v-icon
    >
    <p class="mt-5">正在为你准备中...</p>
  </v-empty-state>
  <v-empty-state
    v-else
    icon="mdi-book-open-page-variant-outline"
    height="100vh"
  >
    <v-btn variant="text" to="/all"> 开始吧 </v-btn>
  </v-empty-state>
</template>
<script setup>
import { useAppStore } from "@/store";
const appStore = useAppStore();
</script>
<style scoped>
.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
