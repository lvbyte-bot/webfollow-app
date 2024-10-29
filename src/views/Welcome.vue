<template>
  <div class="d-flex justify-space-between ma-3">
    <div></div>
    <v-btn prepend-icon="mdi-download" variant="text" to="/download"
      >下载app</v-btn
    >
  </div>

  <v-empty-state height="100vh" v-if="appStore.loading">
    <v-icon size="x-large" :class="{ rotating: appStore.loading }"
      >mdi-loading</v-icon
    >
    <p class="mt-5">正在为你准备中...</p>
  </v-empty-state>
  <v-empty-state
    height="100vh"
    v-else
    icon="mdi-book-open-page-variant-outline"
  >
    <div class="text-center">
      <v-btn variant="text" to="/all"> 开始吧 </v-btn>
      <br />
      <v-btn
        v-if="appStore.authInfo.username == 'guest'"
        class="mt-3"
        variant="text"
        to="/combo"
        >目前用户是Guest,点击查看套餐</v-btn
      >
    </div>
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
