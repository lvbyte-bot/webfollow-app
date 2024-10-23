<template>
  <v-responsive>
    <v-app>
      <v-navigation-drawer rail>
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
        ></v-list-item>
        <v-list-item
          class="mt-1"
          prepend-icon="mdi-download"
          value="app"
          @click="router.push('/download')"
        ></v-list-item>
      </v-navigation-drawer>
      <v-navigation-drawer v-if="mobile" v-model="show">
        <SideBar></SideBar>
      </v-navigation-drawer>
      <v-main :class="{ cols: !mobile }">
        <v-btn
          size="small"
          class="toogle ma-1"
          icon="mdi-menu"
          v-if="mobile && !show"
          @click="show = !show"
        ></v-btn>
        <SideBar v-else-if="!mobile"></SideBar>
        <div class="flexible">
          <router-view></router-view>
        </div>
      </v-main>

      <!-- <v-dialog v-model="title" max-width="500">
        <v-card>
          <v-card-title>
            {{ title }}
          </v-card-title>
        </v-card>
      </v-dialog> -->
    </v-app>
  </v-responsive>
</template>
<script setup async>
import SideBar from "./sub/SideBar.vue";
import { useDisplay } from "vuetify";
import { useRouter } from "vue-router";
import { ref } from "vue";

const { mobile } = useDisplay();
const router = useRouter();
const title = ref("");

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
    min-width: 300px;
    max-width: 36vw;
  }
}

.flexible {
  flex: 1;
}
.toogle {
  position: absolute;
  top: 0;
  z-index: 10000;
}
</style>
