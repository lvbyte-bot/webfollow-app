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
  --line-clamp: 2;
  --v-theme-primary: var(--theme-color) !important;
  --img-min-width: 150px;
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
  overflow-y: auto !important;
  font-family: var(--font-family) !important;
}
#app .v-list-item__spacer {
  width: 1rem;
}
#app .v-list-group {
  --prepend-width: 1rem;
}
#app .v-list-item--density-default.v-list-item--one-line {
  min-height: calc(2rem + 4px);
}
.reader-warp a {
  text-decoration: none;
  word-wrap: break-word;
  color: rgb(var(--v-theme-primary));
}
.reader-warp a:hover {
  text-decoration: underline;
}
.menus {
  font-size: 0.8rem;
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
  overflow: scroll !important;
}
.top-bar .v-btn,
.top-sider .v-btn {
  color: rgba(var(--v-theme-surface-variant), 0.8);
}
.text-ellipsis {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--line-clamp);
  line-clamp: var(--line-clamp);
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
@media (max-width: 768px) {
  #app .v-container {
    padding: 0.5rem;
  }
  #app .v-container .v-row {
    margin: -0.5rem;
  }
  :root {
    --img-min-width: 100px;
    --sidbar-bg: var(--v-theme-background);
  }
}
/* 滚动条整体区域 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-code), 0.1); /* 滚动条滑块颜色 */
  border-radius: 3px;
}

/* 滚动条滑块悬停效果 */
::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-code), 0.3); /* 悬停时滑块的颜色 */
}
</style>
