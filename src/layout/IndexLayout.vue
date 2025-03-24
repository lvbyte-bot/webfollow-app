<template>
  <v-responsive @contextmenu.prevent>
    <v-app :theme="themeMode">
      <side-nav />
      <!-- 主体 -->
      <v-main
        :class="{
          hideside: settingsStore.appearance.hideSidebar || mobile,
          'h-screen': route.matched[1].components.default.__name == 'Items',
          'm-main': mobile,
        }"
      >
        <div class="v-main-top"></div>
        <!-- 主体 -->
        <router-view></router-view>
      </v-main>
    </v-app>
  </v-responsive>
</template>
<script setup async>
import { useDisplay } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useElResize } from "@/utils/useElResize";
import { useSettingsStore, useFeedsStore } from "@/store";
import SideNav from "./SideNav.vue";

const settingsStore = useSettingsStore();
const feedStore = useFeedsStore();
const { appearance } = storeToRefs(settingsStore);
const router = useRouter();
const route = useRoute();
const hideSide = ref(false);

const themeMode = ref(appearance.value.themeMode);

// 监听系统主题变化
watch(
  () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  (isDark) => {
    if (appearance.value.themeMode == "system") {
      themeMode.value = isDark ? "dark" : "light";
    }
  },
  { immediate: true }
);

watch(
  () => appearance.value.themeMode,
  () => {
    themeMode.value = appearance.value.themeMode;
    if (appearance.value.themeMode == "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      themeMode.value = isDark ? "dark" : "light";
    }
  }
);
const { width: drawerWidth } = useElResize(() =>
  document.querySelector(".resizable-drawer .v-navigation-drawer__content")
);
watch(drawerWidth, (v) => {
  // 防止抖动
  if (
    v - settingsStore.appearance.sidebarWidth > 2 ||
    settingsStore.appearance.sidebarWidth - v > 2
  ) {
    settingsStore.appearance.sidebarWidth = drawerWidth.value;
    settingsStore.saveToLocalStorage();
  }
});

onMounted(() => {
  // 默认启动页
  let startPage = settingsStore.general.startPage;
  if (route.fullPath == "/") {
    if (startPage == "all") {
      router.push("/all");
    } else if (startPage == "explore") {
      router.push("/explore");
    } else if (startPage == "welcome") {
      router.push("/");
    } else if (startPage == "next") {
      router.push("/next");
    } else if (startPage == "firstfolder") {
      if (feedStore.subscriptions.length) {
        const gid = feedStore.subscriptions[0].id;
        router.push("/c/" + gid);
      } else {
        setTimeout(() => {
          if (feedStore.subscriptions.length) {
            const gid = feedStore.subscriptions[0].id;
            router.push("/c/" + gid);
          }
        }, 1500);
      }
    }
  }
});
</script>
<style lang="scss">
.hideside {
  .top-bar .v-app-bar-title {
    margin-left: 3rem;
  }
}
</style>
