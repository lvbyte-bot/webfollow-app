<template>
  <router-view />
</template>
<script setup>
import { useAppStore } from "@/store";
import { onMounted } from "vue";
const appStore = useAppStore();
onMounted(async () => {
  await appStore.sync();
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
