<template>
  <!-- reader -->
  <v-scale-transition>
    <div class="cover" v-show="show">
      <div class="cover-action">
        <v-btn
          size="small"
          variant="text"
          icon="mdi-close"
          @click="show = false"
          title="关闭"
        ></v-btn>
        <div id="chapters" class="chapter-list"></div>
        <!-- <v-btn size="small" color="surface-variant" icon="mdi-chevron-up" title="上一篇文章"></v-btn>
        <v-btn size="small" color="surface-variant" icon="mdi-chevron-down" title="下一篇文章"></v-btn> -->
      </div>
      <div>
        <image-reader :item="currentItem" v-if="currentItem?.type == 'IMAGE'" />
        <basic-reader
          v-else-if="currentItem?.type == 'BASIC'"
          :item="currentItem"
        />

        <podcast-reader v-else-if="currentItem?.type == 'PODCAST'" />
        <video-reader v-else-if="currentItem.type == 'VIDEO'" />
      </div>
    </div>
  </v-scale-transition>
  <!-- items -->
  <div class="main-warp" ref="mainRef">
    <v-container class="top-sider">
      <v-toolbar>
        <div class="v-toolbar-title v-app-bar-title">
          {{ (appStore.nav && appStore.nav.title) || "未分类" }}
          <small
            class="mx-3 text-medium-emphasis"
            v-text="appStore.nav.qty"
          ></small>
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
          <v-icon>{{ loading ? "mdi-loading" : "mdi-reload" }}</v-icon>
        </v-btn>
        <v-btn
          :icon="
            itemView == 'card'
              ? 'mdi-card-bulleted-outline'
              : 'mdi-format-list-bulleted'
          "
          :title="itemView == 'card' ? '卡片视图' : '列表视图'"
          @click="changeItemView(itemView == 'text' ? 'card' : 'text')"
        >
        </v-btn>
      </v-toolbar>
    </v-container>

    <v-container class="mx-auto items-warp">
      <!-- <v-scroll-y-transition> -->
      <template v-if="store.items?.length">
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
      </template>
      <!-- </v-scroll-y-transition> -->

      <template v-if="store.isLast">
        <v-empty-state
          icon="mdi-book-open-page-variant-outline"
          v-if="feedStore.nextUnReadUrl"
          height="calc(100vh - 64px)"
        >
          <v-btn variant="text" :to="feedStore.nextUnReadUrl">
            <template #prepend>
              <v-icon color="primary"> mdi-circle-medium </v-icon>
            </template>
            点击打开下一个未读的订阅源
          </v-btn>
        </v-empty-state>
        <v-empty-state
          v-else
          height="calc(100vh - 64px)"
          icon=" mdi-book-open-outline"
          text="我是有底线的"
        >
        </v-empty-state>
      </template>
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
import { Marked } from "@/service";
import { useItemsStore, useAppStore, useFeedsStore } from "@/store";
import { FeedItem, LsItemType } from "@/service/types";
import { useScroll } from "@/utils/scrollListener";
const props = defineProps(["type", "id"]);

const mainRef = ref();

const { isBottom } = useScroll(mainRef);

const store = useItemsStore();
const appStore = useAppStore();
const feedStore = useFeedsStore();
const currentItem: Ref<FeedItem> = ref({
  id: 0,
  title: "",
  description: "",
  type: "",
  html: "",
  summary: "",
  datestr: "",
  feedId: 0,
  author: "",
  pubDate: 0,
  link: "",
});
const onlyUnread = ref(true);
const loading = ref(false);
const itemView = ref(localStorage.getItem("layout") || "card");

function changeItemView(view: string) {
  localStorage.setItem("layout", view);
  itemView.value = view;
}

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
  await appStore.sync();
  loading.value = false;
}

async function markRead() {
  console.log(appStore.lastRefeshTime);
  await appStore.read(
    Number(props.id),
    props.type == "f" ? Marked.FEED : Marked.GROUP,
    appStore.lastRefeshTime
  );
}
function openReader(item: any) {
  show.value = true;
  currentItem.value = item;
}
watch(props, () => {
  initData(0);
  mainRef.value.scrollTo(0, 0);
});
watch(onlyUnread, () => initData(0));
const show = ref(false);
</script>
<style lang="scss" scoped>
.items-warp {
  position: relative;
  padding-top: 0;
  padding-bottom: 0;
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
    grid-gap: 0.5rem;
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
<style lang="scss">
.main-warp {
  height: 100vh;
  overflow-y: scroll;
}

.v-toolbar {
  background-color: rgb(var(--v-theme-background)) !important;
}
.chapter-list {
  position: sticky;
  padding: 1rem;
  border-radius: 0.5rem;
  display: inline-block;
  top: 0;
  color: rgba(var(--v-theme-on-code), 0.3);
  margin-bottom: 3rem;
  max-width: 150px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0);
  background-color: rgba(var(--v-theme-background), 0.1);
  max-height: calc(100vh - 100px);
  overflow: auto;

  img {
    height: 1.3rem;
  }
  ul {
    list-style: none;
    font-size: 12px;
    line-height: 24px;
    li {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      > * {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      &:hover {
        color: rgba(var(--v-theme-on-code), 0.9);
        cursor: pointer;
      }
    }
  }
  .active {
    color: rgb(var(--v-theme-on-code));
  }
  &:hover {
    max-width: none;
    background-color: rgb(var(--v-theme-background));
    box-shadow: 3px 3px 2px rgba(var(--v-theme-on-code), 0.1);
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }
}
</style>
