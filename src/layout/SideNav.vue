<template>
  <!-- 移动端侧边栏 -->
  <v-navigation-drawer
    class="sidebar-warp"
    v-if="mobile"
    v-model="showMobileMenu"
  >
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

          <c-btn id="menu-activator-2" icon=" mdi-cog-outline"> </c-btn>
        </div>
        <v-divider class="mb-2"></v-divider>
      </template>
      <template #footer>
        <div style="height: 5rem"></div>
      </template>
    </SideBar>
  </v-navigation-drawer>
  <!-- 播放列表 -->
  <v-navigation-drawer
    width="320"
    temporary
    v-model="showPlayList"
  >
    <PlayList></PlayList>
  </v-navigation-drawer>
  <!-- pc端侧边栏 -->
  <v-navigation-drawer
    :model-value="!mobile && !hideSide"
    class="resizable-drawer"
    :width="settingsStore.appearance.sidebarWidth"
  >
    <!-- 桌面端侧边栏 -->
    <SideBar :width="settingsStore.appearance.sidebarWidth + 'px'">
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
            <c-btn id="menu-activator-1" icon size="small">
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
  </v-navigation-drawer>

  <!-- 侧边栏切换按钮 -->
  <c-btn
        class="ma-2 menu-warp logo"
        variant="text"
        icon="mdi-dock-left"
        title="打开边栏"
        @click="
          () => {
            if (mobile) {
              showMobileMenu = !showMobileMenu;
            } else {
              hideSide = !hideSide;
            }
          }">
  </c-btn>
  <!-- 播放列表按钮 -->
  <v-btn
    v-show="
      playListStore.playlist.length 
    "
    icon
    color="primary"
    class="podcast-player"
    @click="showPlayList = !showPlayList"
  >
    <img v-if="playListStore.isPlaying " style="width: 3rem;height: 3rem;border-radius: 50%;" class="spinner" :src="playListStore.currentPlaying.thumbil"></img>
    <v-icon v-else>
      mdi-headphones
    </v-icon>
  </v-btn>
  <!-- 菜单 -->
  <template v-for="i in 2" :key="i">
    <v-menu :activator="`#menu-activator-${i}`" class="menu" width="160">
      <v-list nav>
        <v-list-item
          v-for="(item, index) in menus"
          :key="index"
          :value="index"
          @click="handleMenuClick(item.value)"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </template>
  <!-- 搜索弹框 -->
  <search-dialog v-model="showSearch" />
  <help-dialog v-model="showHelp" />
  <v-dialog max-width="800px" max-height="70vh" v-model="settingable">
    <Settings
      :activeMenu="activeMenu"
      @onclose="settingable = false"
    ></Settings>
  </v-dialog>
</template>

<script setup async>
import { useDisplay } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useElResize } from "@/utils/useElResize";
import {
  useAppStore,
  useSettingsStore,
  usePlayListStore,
} from "@/store";
import Settings from "./settings/Settings.vue";
import SideBar from "./sub/SideBar.vue";
import PlayList from "./sub/PlayList.vue";
import SearchDialog from "./sub/SearchDialog.vue";
import HelpDialog from "./sub/HelpDialog.vue";
import { useHotkeys } from "@/utils/useHotkeys";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const playListStore = usePlayListStore();
const { mobile } = useDisplay();
const router = useRouter();
const title = ref("");
const hideSide = ref(false);
const settingable = ref(false);
const showPlayList = ref(false);
const showMobileMenu = ref(false);
const activeMenu = ref("general");


// 设置 套餐 下载app
const menus = [
  { title: "设置", value: "setting" },
  { title: "套餐", value: "combo" },
  { title: "AI Key", value: "aikey" },
  { title: "搜索 (ctrl+/)", value: "search" },
  { title: "快捷键 (ctrl+?)", value: "hotkeys" },
  // { title: "反馈", value: "feedback" },
  { title: "注册账号", value: "register" },
  { title: "登录", value: "login" },
  { title: "下载app", value: "app" },
];

const handleMenuClick = (value) => {
  activeMenu.value = "general";
  if (value == "setting") {
    settingable.value = true;
  } else if (value == "aikey") {
    activeMenu.value = "integrated";
    settingable.value = true;
  } else if (value == "feedback") {
    window.open(
      "https://github.com/weekend-project-space/webfollow-app/issues"
    );
  } else if (value == "register") {
    window.open("https://zhidayingxiao.cn/to/06g6yb");
  } else if (value == "login") {
    router.push("/login");
  }  else if (value == "combo") {
    window.open("https://www.webfollow.cc/");
  } else if (value == "app") {
    router.push("/download");
  } else if (value == "search") {
    showSearch.value = true;
  } else if (value == "hotkeys") {
    console.log(showHelp)
    showHelp.value = true;
  }
};

watch(hideSide, () => {
  settingsStore.appearance.hideSidebar = hideSide.value;
  settingsStore.saveToLocalStorage();
});


onBeforeMount(() => {
  hideSide.value = settingsStore.appearance.hideSidebar;
  webfollowApp.toogleSidebar = () => {
    hideSide.value = !hideSide.value;
  };
});

// 添加快捷键支持
const { showSearch, showHelp } = useHotkeys();
</script>
<style lang="scss" scoped>
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
  position: fixed;
  top: 0;
  z-index: 100;
  background-color: rgb(var(--v-theme-background));
  // border-radius: 50%;
}
.podcast-player {
  position: fixed;
  bottom: 2rem;
  left: 1rem;
  z-index: 1006;
}
.menu {
  .v-list-item--density-default.v-list-item--one-line {
    min-height: 32px;
  }
}
.resizable-drawer {
  min-width: 256px;
  :deep(.v-navigation-drawer__content) {
    min-width: 256px;
    max-width: 350px;
    resize: horizontal;
  }
}
.logo {
  // 颜色变成灰色
  filter: grayscale(0.3);
}
.min-side {
  width: 64px;
  position: fixed;
  height: 100vh;
}
</style>
<style lang="scss">
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
  animation: rotate 6s linear infinite;
}
.spinner-2 {
  animation: rotate 20s linear infinite;
}
.v-navigation-drawer--left {
  border-right-width: 0;
}
</style>