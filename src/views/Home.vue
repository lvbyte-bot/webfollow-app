<template>
  <v-responsive>
    <v-app>
      <v-navigation-drawer class="sidebar-warp" v-if="mobile" v-model="show">
        <SideBar></SideBar>
      </v-navigation-drawer>
      <v-navigation-drawer color="#222" v-else :model-value="!hideSide" rail>
        <v-list-item
          class="my-2"
          prepend-avatar="/logo.svg"
          title="webfollow"
          @click="router.push('/')"
        >
        </v-list-item>
        <v-divider></v-divider>

        <v-list-item
          class="mt-1"
          prepend-icon="mdi-plus"
          title="添加"
          @click="router.push('/subscribe')"
        ></v-list-item>
        <v-list-item
          class="mt-1"
          prepend-icon="mdi-professional-hexagon"
          value="combo"
          @click="router.push('/combo')"
        ></v-list-item>
        <v-list-item
          class="mt-1"
          prepend-icon="mdi-download"
          value="app"
          @click="router.push('/download')"
        ></v-list-item>

        <div class="bottom">
          <v-list-item class="mt-3 pa-3" href="https://i.webfollow.cc">
            回到老版
          </v-list-item>
        </div>
      </v-navigation-drawer>
      <v-main :class="{ cols: !mobile && !hideSide }">
        <v-btn
          size="small"
          class="toogle ma-1"
          icon="mdi-menu"
          v-if="mobile && !show"
          @click="show = !show"
        ></v-btn>
        <v-scale-transition>
          <SideBar v-if="!mobile && !hideSide">
            <template #top>
              <div class="mb-2 d-flex justify-space-between align-center">
                <c-btn
                  variant="text"
                  icon="mdi-backburger"
                  @click="hideSide = !hideSide"
                  title="关闭边栏"
                ></c-btn>
                <c-btn to="/login" icon>
                  <v-avatar
                    size="26px"
                    color="secondary"
                    :title="appStore.authInfo.username"
                  >
                    {{ appStore.authInfo.username.substring(0, 2) }}
                  </v-avatar>
                </c-btn>
              </div>
            </template>
          </SideBar>
        </v-scale-transition>
        <div class="flexible">
          <div v-if="hideSide && !mobile" class="ma-3 menu-warp">
            <c-btn
              variant="text"
              icon="mdi-menu"
              title="打开边栏"
              @click="hideSide = !hideSide"
            ></c-btn>
          </div>

          <router-view></router-view>
        </div>
      </v-main>
    </v-app>
  </v-responsive>
</template>
<script setup async>
import SideBar from "./sub/SideBar.vue";
import { useDisplay } from "vuetify";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useAppStore } from "@/store";

const appStore = useAppStore();
const { mobile } = useDisplay();
const router = useRouter();
const title = ref("");
const hideSide = ref(false);

const show = ref(false);
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
    min-width: 260px;
    width: 280px;
    max-width: 36vw;
  }
}

.flexible {
  flex: 1;
}
.toogle {
  position: absolute;
  top: 30vh;
  z-index: 10000;
}
.bottom {
  position: absolute;
  bottom: 1rem;
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
}
</style>
