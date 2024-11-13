<template>
  <router-view />
</template>
<script setup></script>
<style>
:root {
  font-size: 14px;
  --swiper-navigation-size: 20px !important;
  --sidbar-bg: 248, 250, 253;
  --v-overlay-opacity: 0.7;
  --v-theme-primary: var(--theme-color) !important;
}
.v-theme--dark {
  --sidbar-bg: 41, 41, 45;
  --v-overlay-opacity: 0.9;
  --v-theme-primary: var(--theme-color) !important;
}
.v-theme--light {
  --v-theme-primary: var(--theme-color) !important;
}
html {
  background-color: #fff;
  overflow-y: hidden !important;
  font-family: var(--font-family) !important;
}
#app .v-list-item__spacer {
  width: 1rem;
}
#app .v-list-group {
  --prepend-width: 1rem;
}
.page {
  /* text-align: center; */
  padding: 1rem 1rem;
  max-width: 960px;
  margin: 0 auto;
  overflow: auto;
  max-height: 100vh;
}
.page h3 {
  text-align: center;
  padding: 2rem;
  font-size: 18px;
}
.v-navigation-drawer .v-list {
  overflow: auto !important;
}

/* 滚动条整体区域 */
::-webkit-scrollbar {
  width: 6px; /* 纵向滚动条的宽度 */
  height: 6px; /* 横向滚动条的高度 */
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background: transparent; /* 滚动条轨道背景 */
  border-radius: 3px; /* 圆角边框 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: #ccc; /* 滚动条滑块颜色 */
  border-radius: 3px; /* 圆角边框 */
}

/* 滚动条滑块悬停效果 */
::-webkit-scrollbar-thumb:hover {
  background: #999; /* 悬停时滑块的颜色 */
}
</style>
