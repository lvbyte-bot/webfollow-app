<template>
  <router-view />
</template>
<script setup>
import { sync } from "@/service";
import { onMounted } from "vue";
onMounted(async () => {
  await sync();
});
</script>
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
</style>
