<template>
  <div
    class="main-warp"
    :class="{ 'main-col': general.defaultView == 'magazine' }"
  >
    <!-- reader -->
    <v-dialog-transition>
      <div class="cover" v-show="show">
        <Reader :item="currentItem">
          <template #prepend>
            <div id="chapters" class="chapter-list"></div>
          </template>
          <template #prepend-bar>
            <c-btn
              variant="text"
              icon="mdi-close"
              @click="show = false"
              title="关闭"
              class="mr-2"
            ></c-btn>
            <c-btn
              :disabled="currentItemIndex == 0"
              variant="text"
              icon="mdi-chevron-up"
              title="上一篇文章"
              @click="openReader(currentItemIndex - 1, undefined)"
              class="mr-2"
            ></c-btn>
            <c-btn
              :disabled="currentItemIndex + 1 == store.items?.length"
              variant="text"
              icon="mdi-chevron-down"
              title="下一篇文章"
              @click="openReader(currentItemIndex + 1, undefined)"
            ></c-btn>
          </template>
        </Reader>
      </div>
    </v-dialog-transition>
    <!-- items -->
    <div class="main-container" ref="mainRef">
      <div class="top-sider">
        <div class="v-toolbar-title v-app-bar-title text-truncate">
          {{ (appStore.nav && appStore.nav.title) || "未分类" }}
          <small
            class="mx-3 text-medium-emphasis"
            v-text="appStore.nav.qty"
          ></small>
        </div>
        <div>
          <c-btn
            :icon="onlyUnread ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
            :title="onlyUnread ? '只看未读' : '看全部'"
            @click="changeOnlyUnread(!onlyUnread)"
            class="mr-2"
          >
          </c-btn>
          <c-btn
            :disabled="
              (id == '-1' && type == 'c') ||
              type == 'next' ||
              type == 'all' ||
              store.items?.filter((o) => !o.isRead).length == 0
            "
            icon
            title="标记为已读"
            @click="markRead"
            class="mr-2"
          >
            <v-icon>mdi-read</v-icon>
          </c-btn>

          <c-btn
            icon
            title="刷新"
            @click="refresh"
            :class="{ rotating: loading }"
            class="mr-2"
          >
            <v-icon>{{ loading ? "mdi-loading" : "mdi-reload" }}</v-icon>
          </c-btn>
          <c-btn
            :icon="
              general.defaultView == 'card'
                ? 'mdi-view-gallery-outline'
                : general.defaultView == 'magazine'
                ? 'mdi-view-column-outline'
                : 'mdi-view-list-outline'
            "
            :title="
              general.defaultView == 'card'
                ? '卡片视图'
                : general.defaultView == 'magazine'
                ? '三栏视图'
                : '列表视图'
            "
            @click="changeItemView()"
          >
          </c-btn>
        </div>
      </div>

      <v-container class="mx-auto items-warp">
        <template v-if="store.items?.length">
          <v-row v-if="general.defaultView == 'card'">
            <v-col
              cols="12"
              sm="12"
              md="4"
              lg="3"
              xl="2"
              xxl="1"
              v-for="(item, index) in store.items"
              :key="item.id"
            >
              <Item
                :item="item"
                @click="openReader(index, item)"
                :type="type"
              ></Item>
            </v-col>
          </v-row>
          <template v-else-if="general.defaultView == 'magazine'">
            <MagazineItem
              v-for="(item, index) in store.items"
              :item="item"
              @click="openReader(index, item)"
              :type="type"
              :key="item.id"
            ></MagazineItem>
          </template>
          <template v-else>
            <TextItem
              v-for="(item, index) in store.items"
              :item="item"
              @click="openReader(index, item)"
              :type="type"
              :key="item.id"
            ></TextItem>
          </template>
        </template>

        <template v-if="store.isLast && !loading">
          <v-empty-state
            v-if="type == 'f' && store.isLast && store.items?.length == 0"
          >
            <v-btn variant="text" @click="pullFeedItems" :disabled="loading">
              <template #prepend>
                <v-icon> mdi-database-arrow-down-outline </v-icon>
              </template>
              加载归档
            </v-btn>
          </v-empty-state>
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
  </div>
</template>
<script setup lang="ts">
import { computed, ref, Ref } from "vue";

import Reader from "./reader/Index.vue";
import Item from "./item/CardItem.vue";
import TextItem from "./item/TextItem.vue";
import MagazineItem from "./item/MagazineItem.vue";
import { onMounted, watch } from "vue";
import { Marked } from "@/service";
import { storeToRefs } from "pinia";
import {
  useItemsStore,
  useAppStore,
  useFeedsStore,
  useSettingsStore,
} from "@/store";
import { FeedItem, LsItemType } from "@/service/types";
import { useScroll } from "@/utils/scrollListener";
import { useImgPreview } from "@/utils/useImgPreview";
const props = defineProps(["type", "id"]);

const mainRef = ref();

const { isBottom } = useScroll(mainRef);
useImgPreview();
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
const currentItemIndex = ref(0);

const show = ref(false);
const loading = ref(false);
const settingsStore = useSettingsStore();
const { general } = storeToRefs(settingsStore);
const onlyUnread = computed(() => general.value.hideReadArticles);

function changeItemView() {
  if (general.value.defaultView == "text") {
    general.value.defaultView = "card";
  } else if (general.value.defaultView == "card") {
    general.value.defaultView = "magazine";
  } else {
    general.value.defaultView = "text";
  }
  mainRef.value.style.width = "";
  settingsStore.saveToLocalStorage();
}

let page = 0;

watch(isBottom, (v) => {
  if (v && !store.isLast) {
    initData(++page);
  }
});

onMounted(initData);

let autoRefresh: any;

async function loadData(
  id: any,
  type: LsItemType,
  page: number = 0,
  onlyUnread: boolean = false
) {
  // 自动刷新功能
  if (general.value.autoRefresh) {
    if (autoRefresh) {
      clearTimeout(autoRefresh);
    }
    autoRefresh = setTimeout(() => {
      log("autoRefresh");
      initData();
    }, general.value.refreshInterval * 1000);
  }
  await store.loadData(id, type, page, onlyUnread);
}

async function initData(page0: number = 0) {
  loading.value = true;
  page = page0;
  if (props.type == "f") {
    await loadData(Number(props.id), LsItemType.FEED, page, onlyUnread.value);
  } else if (props.type == "c") {
    await loadData(Number(props.id), LsItemType.GROUP, page, onlyUnread.value);
  } else if (props.type == "next") {
    await loadData(null, LsItemType.SAVED, page, onlyUnread.value);
  } else if (props.type == "all") {
    await loadData(null, LsItemType.ALL, page, onlyUnread.value);
  }
  loading.value = false;
}

async function refresh() {
  loading.value = true;
  await appStore.sync();
  loading.value = false;
}

async function pullFeedItems() {
  if (props.type == "f") {
    loading.value = true;
    await store.pullFeedItems(Number(props.id));
    changeOnlyUnread(false);
    loading.value = false;
  }
}

async function markRead() {
  await appStore.read(
    Number(props.id),
    props.type == "f" ? Marked.FEED : Marked.GROUP,
    appStore.lastRefeshTime
  );
}
function openReader(index: number, item: any | undefined) {
  show.value = true;
  currentItemIndex.value = index;
  if (item) {
    currentItem.value = item;
  } else if (store.items) {
    currentItem.value = store.items[index];
  }
}

async function changeOnlyUnread(onlyUnread0: boolean) {
  general.value.hideReadArticles = onlyUnread0;
  settingsStore.saveToLocalStorage();
  await initData(0);
}

watch(props, () => {
  initData(0);
  show.value = false;
  mainRef.value.scrollTo(0, 0);
});
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
    padding: 0.8rem;
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
  background-color: rgb(var(--v-theme-background));
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 0 1rem 0 1rem;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  height: 64px;
  &:last-child {
    min-width: 170px;
  }
}
.rotating .v-icon {
  animation: rotate 1s linear infinite;
}
.reader-warp {
  font-size: 1.2em;
}
.main-warp {
  font-size: var(--font-size);
}
</style>
<style lang="scss">
.main-container {
  height: 100vh;
  overflow-y: scroll;
}

.v-toolbar {
  background-color: rgb(var(--v-theme-background)) !important;
}
.chapter-list {
  position: absolute;
  padding: 0.5rem 0.8rem;
  border-radius: 0.3rem;
  top: 100px;
  z-index: 1;
  color: rgba(var(--v-theme-on-code), 0.3);
  margin-bottom: 3rem;
  max-width: 150px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0);
  max-height: calc(100vh - 150px);
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
@media (max-width: 1280px) {
  .chapter-list {
    display: none;
    background: rgb(var(--v-theme-background));
  }
}
.main-col {
  display: grid;
  grid-template-columns: auto 1fr;

  .cover {
    grid-area: 1/2/2/2;
  }
  .main-container {
    position: relative;
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    overflow-y: scroll;
    resize: horizontal;
    min-width: 360px;
    max-width: 36vw;
    width: 360px;
    background-color: rgb(var(--sidbar-bg));
    .top-sider {
      background-color: rgb(var(--sidbar-bg));
    }
  }
}
</style>
