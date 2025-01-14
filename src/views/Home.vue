<template>
  <v-responsive @contextmenu.prevent>
    <v-app :theme="themeMode">
      <v-navigation-drawer class="sidebar-warp" v-if="mobile" v-model="show">
        <SideBar>
          <template #top>
            <div class="mb-2 d-flex justify-space-between align-center">
              <v-list-item
                :title="appStore.authInfo.username"
                @click="router.push('/login')"
              >
                <template #prepend>
                  <v-avatar
                    size="30px"
                    color="secondary"
                    :title="appStore.authInfo.username"
                  >
                    {{ appStore.authInfo.username.substring(0, 2) }}
                  </v-avatar>
                </template>
                <template #append>
                  <v-icon size="16px">mdi-exit-to-app</v-icon>
                </template>
              </v-list-item>

              <c-btn @click="settingable = true" icon=" mdi-cog-outline">
              </c-btn>
            </div>
            <v-divider class="mb-2"></v-divider>
          </template>
          <template #footer>
            <div style="height: 5rem"></div>
          </template>
        </SideBar>
      </v-navigation-drawer>
      <!-- <v-navigation-drawer
        v-else
        :model-value="hideSide"
        rail
        style="border-right: none"
        :style="{
          width: hideSide ? '64px' : '0px',
        }"
      >
        <div class="text-center pa-4">
          <v-img
            class="mx-auto"
            src="/logo.svg"
            @click="router.push('/')"
            alt=""
            width="30"
          />
        </div>
        <v-btn variant="flat" title="首页" to="/home" height="64">
          <div class="text-center text-caption">
            <v-icon size="20">mdi-home-outline</v-icon>
            <div>首页</div>
          </div>
        </v-btn>
        <v-btn variant="flat" value="search" to="/search" height="64">
          <div class="text-center">
            <v-icon size="20">mdi-text-search-variant</v-icon>
            <div>搜索</div>
          </div>
        </v-btn>
        <v-btn variant="flat" value="next" to="/all" height="64">
          <div class="text-center">
            <v-icon size="20">mdi-rss</v-icon>
            <div>订阅</div>
          </div>
        </v-btn>
        <v-btn
          variant="flat"
          value="all"
          @click="settingable = true"
          height="64"
        >
          <div class="text-center">
            <v-icon size="20">mdi-account-circle-outline</v-icon>
            <div>我</div>
          </div>
        </v-btn>
      </v-navigation-drawer> -->
      <v-navigation-drawer width="320" temporary v-model="showPlayList">
        <PlayList></PlayList>
      </v-navigation-drawer>
      <v-main :class="{ cols: !mobile, hideside: hideSide || mobile }">
        <v-scroll-x-transition>
          <div v-show="!mobile && !hideSide">
            <SideBar>
              <template #top>
                <div class="mb-2 d-flex justify-space-between align-center">
                  <div
                    class="d-flex align-center cursor-pointer"
                    @click="router.push('/')"
                  >
                    <v-img src="/logo.svg" alt="" width="30" class="mx-2" />
                    <span class="font-weight-bold">WebFollow</span>
                  </div>
                  <div>
                    <c-btn
                      variant="text"
                      icon="mdi-menu-open"
                      @click="hideSide = !hideSide"
                      title="关闭边栏"
                      size="small"
                    ></c-btn>
                    <c-btn @click="settingable = true" icon size="small">
                      <v-avatar
                        size="23px"
                        color="secondary"
                        :title="appStore.authInfo.username"
                      >
                        {{ appStore.authInfo.username.substring(0, 2) }}
                      </v-avatar>
                    </c-btn>
                  </div>
                </div>
              </template>
            </SideBar>
          </div>
        </v-scroll-x-transition>
        <div class="flexible">
          <c-btn
            class="ma-2 menu-warp"
            icon="mdi-menu"
            v-if="mobile"
            @click="show = !show"
          ></c-btn>
          <c-btn
            v-else-if="hideSide"
            class="ma-2 menu-warp"
            variant="text"
            icon="mdi-menu"
            title="打开边栏"
            size="small"
            @click="hideSide = !hideSide"
          ></c-btn>

          <router-view></router-view>
        </div>
        <v-btn
          v-show="playListStore.playlist.length"
          icon
          color="primary"
          class="podcast-player"
          @click="showPlayList = !showPlayList"
        >
          <v-icon :class="{ spinner: playListStore.isPlaying }">
            {{
              playListStore.isPlaying
                ? "mdi-music-circle-outline"
                : "mdi-headphones"
            }}
          </v-icon>
        </v-btn>
      </v-main>
      <v-dialog max-width="960px" v-model="settingable">
        <Settings @onclose="settingable = false"></Settings>
      </v-dialog>
    </v-app>
  </v-responsive>
</template>
<script setup async>
import { useDisplay } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import {
  useAppStore,
  useSettingsStore,
  useFeedsStore,
  usePlayListStore,
} from "@/store";
import Settings from "./settings/Settings.vue";
import SideBar from "./sub/SideBar.vue";
import PlayList from "./sub/PlayList.vue";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const feedStore = useFeedsStore();
const playListStore = usePlayListStore();
const { mobile } = useDisplay();
const { appearance } = storeToRefs(settingsStore);
const router = useRouter();
const route = useRoute();
const title = ref("");
const hideSide = ref(false);
const settingable = ref(false);
const showPlayList = ref(false);
const show = ref(false);

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

watch(hideSide, () => {
  settingsStore.appearance.hideSidebar = hideSide.value;
  settingsStore.saveToLocalStorage();
});
onBeforeMount(() => {
  hideSide.value = settingsStore.appearance.hideSidebar;
});

onMounted(() => {
  // 默认启动页
  let startPage = settingsStore.general.startPage;
  if (route.fullPath == "/") {
    if (startPage == "all") {
      router.push("/all");
    } else if (startPage == "home") {
      router.push("/home");
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
<style lang="scss" scoped>
.cols {
  display: grid;
  grid-template-columns: auto 1fr;
  :deep(.sidebar) {
    position: relative;
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    overflow: auto;
    resize: horizontal;
    min-width: 230px;
    width: 260px;
    max-width: 36vw;
  }
}
.hideside {
  grid-template-columns: 1fr;
}

.toogle {
  position: absolute;
  top: 30vh;
  z-index: 10000;
}
.bottom {
  position: absolute;
  bottom: 1rem;
  width: 100%;
}
.sidebar-warp :deep(.sidebar) {
  --sidbar-bg: var(--v-theme-background);
}
:deep(.sidebar) {
  background-color: rgb(var(--sidbar-bg));
}
.menu-warp {
  position: absolute;
  top: 0;
  z-index: 100;
  background-color: rgb(var(--v-theme-background));
  // border-radius: 50%;
}
.podcast-player {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 10000;
}
</style>
<style lang="scss">
.flexible {
  flex: 1;
}
.hideside {
  .top-bar .v-app-bar-title {
    margin-left: 3rem;
  }
}
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.spinner {
  animation: rotate 2s linear infinite;
}
.spinner-2 {
  animation: rotate 20s linear infinite;
}
</style>
