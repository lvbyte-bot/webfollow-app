<template>
  <!-- reader -->
  <v-scale-transition>
    <div class="cover" v-if="show && currentItem?.title">
      <div class="cover-action">
        <v-btn
          size="small"
          variant="text"
          icon="mdi-close"
          @click="show = false"
          title="关闭"
        ></v-btn>
        <!-- <v-btn size="small" color="surface-variant" icon="mdi-chevron-up" title="上一篇文章"></v-btn>
        <v-btn size="small" color="surface-variant" icon="mdi-chevron-down" title="下一篇文章"></v-btn> -->
      </div>
      <v-container class="pa-0 pl-16">
        <image-reader :item="currentItem" v-if="currentItem.type == 'IMAGE'" />
        <basic-reader
          :item="currentItem"
          v-else-if="currentItem.type == 'BASIC'"
        />
        <podcast-reader v-else-if="currentItem.type == 'PODCAST'" />
        <video-reader v-else />
      </v-container>
    </div>
  </v-scale-transition>
  <!-- items -->
  <div class="main-warp" ref="main">
    <v-container class="top-sider">
      <v-toolbar>
        <div class="v-toolbar-title v-app-bar-title">
          {{ (store.nav && store.nav.title) || "未分类" }}
        </div>
        <!-- <v-spacer></v-spacer> -->

        <v-btn
          :icon="onlyUnread ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
          :title="onlyUnread ? '只看未读' : '看全部'"
          @click="onlyUnread = !onlyUnread"
        >
        </v-btn>
        <v-btn
          :disabled="
            (id == '-1' && type == 'c') || type == 'next' || type == 'all'
          "
          icon
          title="标记为已读"
          @click="markRead"
        >
          <v-icon> mdi-checkbox-multiple-marked-circle-outline</v-icon>
        </v-btn>

        <v-btn
          icon
          title="刷新"
          @click="refresh"
          :class="{ rotating: loading }"
        >
          <v-icon>mdi-reload</v-icon>
        </v-btn>
        <v-btn
          :icon="
            itemView == 'card'
              ? 'mdi-card-bulleted-outline'
              : 'mdi-format-list-bulleted'
          "
          :title="itemView == 'card' ? '卡片视图' : '列表视图'"
          @click="itemView = itemView == 'text' ? 'card' : 'text'"
        >
        </v-btn>
      </v-toolbar>
    </v-container>

    <v-container class="mx-auto items-warp">
      <v-row v-if="itemView == 'card'">
        <v-col v-for="item in store.items" :key="item.id">
          <Item :item="item" @click="openReader(item)" :type="type"></Item>
        </v-col>
      </v-row>
      <template v-else>
        <TextItem
          v-for="item in store.items"
          :item="item"
          @click="openReader(item)"
          :type="type"
          :key="item.id"
        ></TextItem>
      </template>
      <v-empty-state
        v-if="store.isLast && feedStore.nextUnReadUrl"
        height="100vh"
      >
        <v-btn variant="text" :to="feedStore.nextUnReadUrl">
          点击打开下一个未读feed
        </v-btn>
      </v-empty-state>
    </v-container>
  </div>
</template>
<script setup lang="ts">
import { ref, Ref } from "vue";
import BasicReader from "./reader/BasicReader.vue";
import ImageReader from "./reader/ImageReader.vue";
import VideoReader from "./reader/VideoReader.vue";
import PodcastReader from "./reader/PodcastReader.vue";
import Item from "./item/CardItem.vue";
import TextItem from "./item/TextItem.vue";
import { onMounted, watch } from "vue";
import { LsItemType, Marked } from "@/service";

import { useItemsStore, useAppStore, useFeedsStore } from "@/store";
import { FeedItem } from "@/service/types";
import { useScroll } from "@/utils/scrollListener";
const props = defineProps(["type", "id"]);

const main = ref();

const { isBottom } = useScroll(main);

const store = useItemsStore();
const app = useAppStore();
const feedStore = useFeedsStore();
const currentItem: Ref<FeedItem | undefined> = ref(undefined);
const onlyUnread = ref(true);
const loading = ref(false);
const itemView = ref("card");

let page = 0;

watch(isBottom, (v) => {
  if (v && !store.isLast) {
    initData(++page);
  }
});

onMounted(initData);

async function loadData(
  id: any,
  type: LsItemType,
  page: number = 0,
  onlyUnread: boolean = false
) {
  store.loadData(id, type, page, onlyUnread);
}

function initData(page0: number = 0) {
  page = page0;
  show.value = false;
  if (props.type == "f") {
    loadData(Number(props.id), LsItemType.FEED, page, onlyUnread.value);
  } else if (props.type == "c") {
    loadData(Number(props.id), LsItemType.GROUP, page, onlyUnread.value);
  } else if (props.type == "next") {
    loadData(null, LsItemType.SAVED, page, onlyUnread.value);
  } else if (props.type == "all") {
    loadData(null, LsItemType.ALL, page, onlyUnread.value);
  }
}

async function refresh() {
  loading.value = true;
  await app.sync();
  loading.value = false;
}

async function markRead() {
  await app.read(
    Number(props.id),
    props.type == "f" ? Marked.FEED : Marked.GROUP
  );
}
function openReader(item: any) {
  show.value = true;
  currentItem.value = item;
}
watch(props, () => {
  initData(0);
  main.value.scrollTo(0, 0);
});
watch(onlyUnread, () => initData(0));
const show = ref(false);
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

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.top-sider {
  position: sticky !important;
  top: 0;
  z-index: 10;
  padding: 0 1rem 0 0;
}
.rotating .v-icon {
  animation: rotate 1s linear infinite;
}
</style>
<style>
.main-warp {
  height: 100vh;
  overflow-y: auto;
}

.v-toolbar {
  background-color: rgb(var(--v-theme-background)) !important;
}
</style>
