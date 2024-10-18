<template>
  <v-scale-transition>
    <div class="cover" v-if="show && currentItem.title">
      <div class="cover-action">
        <v-btn
          size="small"
          variant="text"
          icon="mdi-close"
          @click="show = false"
          title="关闭"
        ></v-btn>
        <v-btn
          size="small"
          color="surface-variant"
          icon="mdi-chevron-up"
          title="上一篇文章"
        ></v-btn>
        <v-btn
          size="small"
          color="surface-variant"
          icon="mdi-chevron-down"
          title="下一篇文章"
        ></v-btn>
      </div>
      <v-container class="pa-0 pl-16">
        <image-reader :item="currentItem" v-if="currentItem.type == 'image'" />
        <basic-reader :item="currentItem" v-else-if="index == 1" />
        <podcast-reader v-else-if="index == 3" />
        <video-reader v-else />
      </v-container>
    </div>
  </v-scale-transition>
  <div class="main-warp">
    <v-container class="top-sider">
      <v-toolbar>
        <v-app-bar-title>ifanr</v-app-bar-title>
        <v-spacer></v-spacer>

        <v-btn icon title="只看已读">
          <v-icon>mdi-radiobox-blank</v-icon>
        </v-btn>

        <v-btn icon title="标记为已读">
          <v-icon>mdi-check-all</v-icon>
        </v-btn>

        <v-btn icon title="刷新">
          <v-icon>mdi-reload</v-icon>
        </v-btn>
      </v-toolbar>
    </v-container>

    <v-container class="mx-auto items-warp">
      <v-row>
        <v-col
          v-for="item in store.items"
          cols="3"
          xl="2"
          lg="3"
          sm="6"
          xs="12"
          :key="item.id"
        >
          <v-card
            flat
            @click="
              () => {
                show = true;
                index = 1;
                currentItem = item;
              }
            "
          >
            <v-img
              v-if="item.thumbnail"
              class="align-end text-white"
              height="200"
              :src="
                item.thumbnail
                  ? item.thumbnail
                  : 'http://img.netbian.com/file/2024/0515/191947LFJ2P.jpg'
              "
              cover
            >
              <v-card-title class="bg-cover" v-text="item.title"></v-card-title>
            </v-img>
            <v-card-title v-else v-text="item.title"></v-card-title>
            <v-card-subtitle class="pt-4">
              {{ item.author }} /
              {{ item.datestr }}
            </v-card-subtitle>
            <v-card-text>
              <p class="color-surface" v-text="item.summary"></p>
            </v-card-text>
            <v-card-actions>
              <v-btn
                :icon="
                  item.isRead ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'
                "
                title="标记为已读"
              ></v-btn>
              <v-spacer></v-spacer>
              <v-btn icon="mdi-playlist-plus" title="稍后阅读"></v-btn>
            </v-card-actions> </v-card
        ></v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import BasicReader from "./reader/BasicReader.vue";
import ImageReader from "./reader/ImageReader.vue";
import VideoReader from "./reader/VideoReader.vue";
import PodcastReader from "./reader/PodcastReader.vue";
import { onMounted, watch } from "vue";
import { LsItemType } from "@/service";
const props = defineProps(["category", "id"]);
import { useItemsStore } from "@/store";

const store = useItemsStore();
const currentItem = ref({ title: "" });
onMounted(initData);

async function loadData(
  id: any,
  type: LsItemType,
  page: number = 0,
  onlyread: boolean = false
) {
  store.loadData(id, type, page, onlyread);
}

function initData() {
  if (props.category == "f") {
    loadData(Number(props.id), LsItemType.FEED, 0);
  } else if (props.category == "c") {
    loadData(Number(props.id), LsItemType.GROUP, 0);
  }
}

watch(props, initData);
const show = ref(false);
const index = ref(0);
</script>
<style lang="scss" scoped>
.items-warp {
  position: relative;
}
.cover {
  position: sticky;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  .cover-action {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    padding: 1rem;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 2rem;
  }
}
.bg-cover {
  background-color: rgba(var(--v-theme-surface-variant), 0.8);
}
</style>
<style>
.top-sider {
  position: sticky !important;
  top: 0;
  z-index: 10;
  padding: 0;
}
.main-warp {
  height: 100vh;
  overflow-y: auto;
}
.v-toolbar {
  background-color: rgb(var(--v-theme-background)) !important;
}
</style>
