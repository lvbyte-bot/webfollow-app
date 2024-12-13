<template>
  <v-container>
    <v-card flat class="pa-1">
      <v-list-item subtitle="0.6.1" title="WebFollow" class="mb-6">
        <template #prepend>
          <v-img src="/logo.svg" width="64px" class="mr-3"></v-img>
        </template>
      </v-list-item>
      WebFollow是一个基于RSS fever api 协议的开源阅读器，未来将支持google reader
      等开放rss api协议, 开源协议为 GPL协议

      <br />
      <br />
      在这里找到我们：
      <br />
      <br />
      <a href="https://github.com/weekend-project-space/webfollow-app">
        <img
          src="https://img.shields.io/github/stars/weekend-project-space/webfollow-app.svg?style=social&amp;label=Stars"
          alt=""
      /></a>
      <br />
      <br />
      遇到问题：
      <br />
      <br />
      <v-btn
        size="small"
        prepend-icon="mdi-help-circle-outline"
        href="https://github.com/weekend-project-space/webfollow-app/issues"
        >反馈</v-btn
      >
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
// 这里可以添加任何需要的逻辑
</script>

<style scoped>
/* 这里可以添加样式 */
</style>
