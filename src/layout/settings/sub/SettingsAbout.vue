<template>
  <v-container class="pa-6">
    <div class="d-flex align-center mb-6">
      <div>
        <v-img src="/logo.svg" width="64px" class="mr-4"></v-img>
      </div>
      <div>
        <h1 class="text-h5">IFeed</h1>
        <div class="text-caption text-medium-emphasis">Version 0.8.7</div>
      </div>
    </div>

    <div class="mb-6">
      <h2 class="text-h6">关于</h2>
      <p class="mt-4 text-body-2">
        IFeed是一个基于RSS fever api 协议的开源阅读器，未来将支持google reader
        等开放rss api协议, 集成AI能力 ,开源协议为 GPL协议
      </p>
    </div>

    <div class="mb-6">
      <h2 class="text-h6">联系与支持</h2>
      <div class="d-flex justify-space-between align-center mt-4">
        <div>
          <div class="text-subtitle-1">GitHub</div>
          <div class="text-caption text-medium-emphasis">查看项目源码、关注我们或给我们点亮一颗星。</div>
        </div>
        <v-btn href="https://github.com/weekend-project-space/webfollow-app" target="_blank" prepend-icon="mdi-github">
          GitHub
        </v-btn>
      </div>
      <v-divider class="my-4"></v-divider>
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-subtitle-1">问题反馈</div>
          <div class="text-caption text-medium-emphasis">遇到问题或有任何建议？请告诉我们。</div>
        </div>
        <v-btn href="https://github.com/weekend-project-space/webfollow-app/issues" target="_blank"
          prepend-icon="mdi-help-circle-outline">
          提交 Issue
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
// 这里可以添加任何需要的逻辑
</script>

<style scoped>
/* 这里可以添加样式 */
</style>
