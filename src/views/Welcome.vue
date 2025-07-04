<template>
  <div class="d-flex justify-space-between ma-3">
    <div>
      <v-btn prepend-icon="mdi-plus-circle-outline" variant="text" to="/subscribe">添加订阅</v-btn>
    </div>
    <div class="d-flex align-center">
      <a href="https://github.com/weekend-project-space/webfollow-app">
        <img
          src="https://img.shields.io/github/stars/weekend-project-space/webfollow-app.svg?style=social&amp;label=Stars"
          alt="" /></a>
    </div>
  </div>

  <v-empty-state height="calc(100vh - 64px)" v-if="appStore.loading">
    <div class="mx-auto text-center">
      <v-icon size="x-large" :class="{ rotating: appStore.loading }">mdi-loading</v-icon>
    </div>
    <p class="mt-5">正在为你准备中...</p>
  </v-empty-state>
  <v-empty-state height="calc(100vh - 64px)" v-else icon="mdi-book-open-page-variant-outline">
    <div class="text-center">
      <p class="text-subtitle-2 mb-3">
        AI驱动，智能阅读——您的RSS新体验！<br />(支持过滤、总结、问答)
      </p>
      <v-btn variant="text" to="/explore"> 开始吧 </v-btn>
      <br />
      <v-btn v-if="appStore.authInfo.username == 'guest'" class="mt-3" variant="text"
        to="/download">目前是测试用户,可以下载app试用</v-btn>
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
