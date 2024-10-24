<template>
  <router-view />
</template>
<script setup></script>
<style>
:root {
  font-size: 14px;
  --swiper-navigation-size: 20px !important;
}
html {
  background-color: #fff;
  overflow-y: hidden !important;
}
#app .v-list-item__spacer {
  width: 1rem;
}
#app .v-list-group {
  --prepend-width: 1rem;
}
.page {
  /* text-align: center; */
  padding: 3rem;
  max-width: 960px;
  margin: 0 auto;
}
</style>
