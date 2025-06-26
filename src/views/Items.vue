<template>
  <div class="main-warp" :class="{ 'main-col': viewMode == 'column' && type }">
    <reader v-if="currentItem && store.items?.length" :item="currentItem" :items="store.items" :open-reader="openReader"
      :entry-list-disable="mobile || !(viewMode != 'column' || !type)" :modelValue="appStore.readerMode"
      @update:modelValue="appStore.readerMode = $event"></reader>
    <div class="main-reader"></div>
    <main class="main-container" ref="mainRef">
      <slot v-bind:="{ openReader, loadData }">
        <!-- items -->
        <div class="items-container">
          <slot name="top" v-bind:="{ openReader }">
            <div class="top-bar">
              <div class="v-toolbar-title v-app-bar-title text-truncate">
                {{ (appStore.nav && appStore.nav.title) || "未分类" }}
                <small class="mx-2 text-medium-emphasis font-weight-light" v-if="appStore.nav.qty"
                  v-text="appStore.nav.qty"></small>
              </div>
              <div>
                <c-btn v-show="!(
                  (id == '-1' && type == 'c') ||
                  type == 'next' ||
                  type == 'home' ||
                  type == 'filter'
                )
                  " :disabled="store.items?.filter((o) => !o.isRead).length == 0" icon title="全部标记为已读(快捷键：M)"
                  @click="markRead" class="items-mark-read">
                  <v-icon>mdi-read</v-icon>
                </c-btn>
                <c-btn icon title="刷新(快捷键：R)" @click="refresh" :class="{ rotating: loading }" class="items-reload">
                  <v-icon>{{ loading ? "mdi-loading" : "mdi-reload" }}</v-icon>
                </c-btn>
                <v-menu class="menu">
                  <template v-slot:activator="{ props }">
                    <c-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></c-btn>
                  </template>
                  <v-card>
                    <v-list nav v-model:selected="viewSeleted">
                      <v-list-item v-for="(item, index) in views" :key="index" :value="item.value"
                        :prepend-icon="item.icon">
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                    <v-divider></v-divider>
                    <v-list nav>
                      <v-list-item title="只看未读" @click="changeOnlyUnread(!onlyUnread)">
                        <template v-slot:prepend>
                          <v-list-item-action start>
                            <v-checkbox-btn :model-value="onlyUnread"></v-checkbox-btn>
                          </v-list-item-action>
                        </template>
                      </v-list-item>
                      <v-list-item title="显示AI总结" @click="toggleAISummary">
                        <template v-slot:prepend>
                          <v-list-item-action start>
                            <v-checkbox-btn :model-value="general.enableListAISummary"></v-checkbox-btn>
                          </v-list-item-action>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-menu>
              </div>
            </div>
          </slot>
          <v-container class="mx-auto items-warp">
            <v-alert class="my-3" v-show="appStore.nav.isFailure" border="top" border-color="warning">
              <div class="d-flex justify-space-between">
                <v-icon class="mr-3">mdi-alert-circle-outline</v-icon>
                此订阅源有问题。请检查并在必要时重新订阅。
                <v-btn class="ml-3" variant="text" :href="appStore.nav.url">
                  查看订阅源
                </v-btn>
              </div>
            </v-alert>
            <!-- <div
          v-show="!appStore.nav.isFailure && (loading || appStore.loading)"
          class="ma-6 text-center"
        >
          <div class="rotating">
            <v-icon>mdi-loading</v-icon>
          </div>
          <div class="mt-2 text-body-2">正在刷新...</div>
        </div> -->
            <template v-if="store.items?.length">
              <Items :items="store.items" :view="viewMode" :type="type" @open-reader="openReader"></Items>
            </template>

            <template v-if="store.isLast && !loading">
              <v-empty-state icon="mdi-book-open-page-variant-outline" v-if="feedStore.nextUnReadUrl"
                height="calc(100vh - 70px)" class="next-unreadlist">
                <v-btn variant="text" :to="feedStore.nextUnReadUrl">
                  <template #prepend>
                    <v-icon color="primary"> mdi-circle-medium </v-icon>
                  </template>
                  打开下一个未读的订阅源
                </v-btn>
              </v-empty-state>
              <v-empty-state v-else-if="!store.items?.length" height="calc(100vh - 70px)" icon="mdi-fruit-watermelon"
                text="全部已读">
              </v-empty-state>
              <v-empty-state v-else height="calc(100vh - 70px)" icon="mdi-fruit-cherries" text="我是有底线的">
              </v-empty-state>
              <v-empty-state v-if="!onlyUnread && type == 'f' && store.items?.length == 0" height="calc(100vh - 70px)"
                icon="mdi-cloud-download-outline">
                <v-btn variant="text" @click="pullFeedItems" :disabled="loading">
                  <template #prepend>
                    <v-icon>mdi-sync</v-icon>
                  </template>
                  加载归档
                </v-btn>
              </v-empty-state>
            </template>
          </v-container>
        </div>
      </slot>
    </main>
  </div>
</template>
<script setup lang="ts">
import { computed, provide, ref, Ref } from "vue";
import Reader from "./reader";
import Items from "./item/Index.vue";
import { viewModeSymbol, itemsTypeSymbol } from "./InjectionSymbols";
import { onMounted, watch } from "vue";
import { ViewMode } from "@/store/types";
import { Marked } from "@/service";
import { retrieveRelevantContexts } from "@/service/rag";
import { storeToRefs } from "pinia";
import { useDisplay } from "vuetify";
import { debound } from "@/utils/debound";
import {
  useItemsStore,
  useAppStore,
  useFeedsStore,
  useSettingsStore,
  useBaseStore,
} from "@/store";
import { FeedItem, LsItemType } from "@/service/types";
import { useScroll } from "@/utils/scrollListener";
import { confirm } from "@/plugins/confirm";
import { useCalViewMode } from "@/utils/useCalView";

const props = defineProps(["type", "id"]);

const mainRef = ref();

const { mobile } = useDisplay();
const store = useItemsStore();
const appStore = useAppStore();
const feedStore = useFeedsStore();
const baseStore = useBaseStore();
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

// const show = ref(false);
const loading = ref(false);
const settingsStore = useSettingsStore();
const { general } = storeToRefs(settingsStore);
const items = computed(() => store.items);
const view = computed(() => general.value.defaultView);
const onlyUnread = computed(() => general.value.hideReadArticles);
const { viewMode, itemsType } = useCalViewMode(view, items);
const { isBottom } = useScroll(mainRef);

provide(viewModeSymbol, viewMode);
provide(itemsTypeSymbol, itemsType);

const views = [
  {
    icon: "mdi-view-dashboard-outline",
    title: "跟随文章",
    value: "auto",
  },
  {
    icon: "mdi-list-box-outline",
    title: "列表视图",
    value: "list",
  },
  {
    icon: "mdi-view-grid-outline",
    title: "卡片视图",
    value: "card",
  },
  {
    icon: "mdi-view-column-outline",
    title: "三栏视图",
    value: "column",
  },
  {
    icon: "mdi-view-sequential-outline",
    title: "杂志视图",
    value: "magazine",
  },
  {
    icon: "mdi-text-box-outline",
    title: "清单视图",
    value: "text",
  },
];

const viewSeleted: Ref<ViewMode[]> = ref([general.value.defaultView]);

watch(viewSeleted, (vs) => {
  general.value.defaultView = vs[0];
  mainRef.value.style.width = "";
  mainRef.value.scrollTo(0, 0);
  settingsStore.saveToLocalStorage();
});

function watchLoadMore() {
  watch(isBottom, (v) => {
    if (v) {
      // 加载时自动将文章已读
      if (settingsStore.general.autoRead) {
        webfollowApp.markCurrentPageRead();
      }
    }
    if (v && !store.isLast) {
      loadData(++page);
    }
  });
}

const debounceLoadData = debound(() => {
  loadData(0);
  // show.value = false;
  appStore.readerMode = false;
  mainRef.value.scrollTo(0, 0);
}, 360);

function watchRefresh() {
  watch(props, () => {
    debounceLoadData();
  });
}

let page = 0;

onMounted(() => {
  if (mainRef.value) {
    watchRefresh();
    watchLoadMore();
    if (props.type) {
      loadData();
      appStore.readerMode = false;
    }
  }
});

async function loadData0(
  id: any,
  type: LsItemType,
  page: number = 0,
  onlyUnread: boolean = false
) {
  if (type == LsItemType.FILTER) {
    const filter = settingsStore.getFilter(id);
    const articles = await retrieveRelevantContexts(
      "",
      filter?.keywords || [],
      300
    );
    await store.loadData(
      articles.map((item) => item.id),
      LsItemType.ITEMS,
      page,
      onlyUnread,
      {
        title: filter?.name || "过滤文章",
        qty: onlyUnread
          ? articles.filter((item) => baseStore.unread_item_ids.has(item.id))
            .length
          : articles.length,
      }
    );
  } else {
    await store.loadData(id, type, page, onlyUnread);
  }
}
let tmpIds: number[] = [];
async function loadData(
  page0: number = 0,
  itemIds: number[] = [],
  clearItemIds: boolean = false,
  onlyUnread0: boolean = false
) {
  loading.value = true;
  page = page0;
  initRefresh();
  // log(onlyUnread.value);
  if (props.type == "f") {
    await loadData0(Number(props.id), LsItemType.FEED, page, onlyUnread.value);
  } else if (props.type == "c") {
    await loadData0(Number(props.id), LsItemType.GROUP, page, onlyUnread.value);
  } else if (props.type == "next") {
    await loadData0(null, LsItemType.SAVED, page, onlyUnread.value);
  } else if (props.type == "all") {
    await loadData0(null, LsItemType.ALL, page, onlyUnread.value);
  } else if (props.type == "home" || props.type == "explore") {
    await loadData0(null, LsItemType.RECOMMEND, page, onlyUnread.value);
  } else if (props.type == "filter") {
    await loadData0(props.id, LsItemType.FILTER, page, onlyUnread.value);
  } else {
    if (itemIds.length > 0) {
      tmpIds = itemIds;
    }
    if (clearItemIds) {
      tmpIds = [];
    }
    await loadData0(tmpIds, LsItemType.ITEMS, page, onlyUnread0);
  }
  loading.value = false;
}

async function refresh() {
  loading.value = true;
  await appStore.sync();
  mainRef.value.scrollTo(0, 0);
  await loadData()
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
  // console.log(props.type);
  const confirmed = await confirm({
    title: "标记已读",
    message: "确定要将全部文章标记为已读吗？",
  });

  if (confirmed) {
    await appStore.read(
      Number(props.id),
      props.type == "f" ? Marked.FEED : Marked.GROUP,
      appStore.lastRefeshTime,
      props.type == "all" ? undefined : appStore.item7DayTime
    );
  }
}

function openReader(index: number, item: FeedItem | undefined) {
  // show.value = true;
  appStore.readerMode = true;
  if (item) {
    currentItem.value = item;
  } else if (store.items) {
    currentItem.value = store.items[index];
  }
}

async function changeOnlyUnread(onlyUnread0: boolean) {
  general.value.hideReadArticles = onlyUnread0;
  settingsStore.saveToLocalStorage();
  await loadData(0);
  mainRef.value.scrollTo(0, 0);
}

async function toggleAISummary() {
  general.value.enableListAISummary = !general.value.enableListAISummary;
  settingsStore.saveToLocalStorage();
  await loadData(0);
  mainRef.value.scrollTo(0, 0);
}

defineExpose({ loadData, openReader });

let autoRefresh: NodeJS.Timeout;

function initRefresh() {
  if (general.value.autoRefresh) {
    if (autoRefresh) {
      clearTimeout(autoRefresh);
    }
    autoRefresh = setTimeout(() => {
      log("autoRefresh");
      refresh();
      initRefresh()
    }, general.value.refreshInterval * 1000);
  }
}


onMounted(() => {

  function initWatchRefresh() {
    // 自动刷新功能
    initRefresh()
    // 页面出显触发检查时间
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState == "visible" && general.value.autoRefresh) {
        if (appStore.lastRefeshTime + general.value.refreshInterval < Math.round(new Date().getTime() / 1000)) {
          initRefresh()
        }
      }
    });
    watch(
      () => general.value.autoRefresh,
      (v) => {
        if (v) {
          initRefresh()
        } else {
          if (autoRefresh) {
            clearTimeout(autoRefresh);
          }
        }
      }
    );
  }
  webfollowApp.toggleItemUnread = () => changeOnlyUnread(!onlyUnread.value);
  webfollowApp.toggleItemView = () => {
    const currentView = viewSeleted.value[0];
    const index = views.map((v) => v.value).findIndex((v) => v == currentView);
    const next = (index + 1) % views.length;
    viewSeleted.value = [views[next].value as ViewMode];
  };
  // 当前页标记已读 （按最后一条item之前的时间）
  webfollowApp.markCurrentPageRead = () => {
    const itemIds = store.items
      .filter((item) => item.isRead == false)
      .map((item) => item.id);
    if (itemIds.length) {
      appStore.readItemBatch(itemIds);
    }
  };
  initWatchRefresh()
});
</script>
<style lang="scss" scoped>
.items-warp {
  position: relative;
  padding-top: 0;
  padding-bottom: 0;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.top-bar {
  position: sticky !important;
  top: 0;
  z-index: 10;
  background-color: rgb(var(--v-theme-background));
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 0 1rem 0 1rem;
  // border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  // height: 64px;
  height: 56px;

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

.main-col {
  display: grid;
  grid-template-columns: auto 1fr;

  .main-reader {
    grid-area: 1/2/2/2;
  }

  .main-container {
    position: relative;
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    // border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    overflow-y: scroll;
    resize: horizontal;
    min-width: 360px;
    max-width: 36vw;
    width: 380px;

    //  background-color: rgb(var(--sidbar-bg));
    .top-bar {
      //    background-color: rgb(var(--sidbar-bg));
    }
  }
}

.menu {
  .v-list-item--density-default.v-list-item--one-line {
    min-height: 32px;
  }
}

@media (max-width: 767px) {
  .main-col {
    display: block;

    .main-container {
      width: 100%;
      max-width: 100%;
      resize: none;
    }
  }
}

@media (max-width: 1024px) {
  .main-col {

    .main-container {
      min-width: 38vw;
      width: 38vw;
      max-width: 39vw;
      resize: none;
    }
  }
}
</style>
<style lang="css">
/* checkbox */
.menu .v-selection-control--density-default {
  --v-selection-control-size: 1.5rem;
}

.menu .v-list-item-action--start {
  margin-inline-end: 0;
  margin-inline-start: 0;
}
</style>
