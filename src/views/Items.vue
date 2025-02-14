<template>
  <div class="main-warp" :class="{ 'main-col': viewMode == 'column' && type }">
    <reader
      v-if="currentItem && store.items?.length"
      :item="currentItem"
      :items="store.items"
      :open-reader="openReader"
      :entry-list-disable="mobile || !(viewMode != 'column' || !type)"
      :modelValue="appStore.readerMode"
      @update:modelValue="appStore.readerMode = $event"
    ></reader>
    <div class="main-reader"></div>
    <main class="main-container" ref="mainRef">
      <slot v-bind:="{ openReader, loadData }">
        <!-- items -->
        <div class="items-container">
          <slot name="top" v-bind:="{ openReader }">
            <div class="top-bar">
              <div class="v-toolbar-title v-app-bar-title text-truncate">
                {{ (appStore.nav && appStore.nav.title) || "未分类" }}
                <small
                  class="mx-2 text-medium-emphasis font-weight-light"
                  v-if="appStore.nav.qty"
                  v-text="appStore.nav.qty"
                ></small>
              </div>
              <div>
                <c-btn
                  v-show="
                    !(
                      (id == '-1' && type == 'c') ||
                      type == 'next' ||
                      type == 'home' ||
                      type == 'filter'
                    )
                  "
                  :disabled="store.items?.filter((o) => !o.isRead).length == 0"
                  icon
                  title="标记为已读"
                  @click="markRead"
                  class="items-mark-read"
                >
                  <v-icon>mdi-read</v-icon>
                </c-btn>

                <c-btn
                  icon
                  title="刷新"
                  @click="refresh"
                  :class="{ rotating: loading }"
                  class="items-reload"
                >
                  <v-icon>{{ loading ? "mdi-loading" : "mdi-reload" }}</v-icon>
                </c-btn>
                <c-btn
                  :icon="onlyUnread ? 'mdi-circle' : 'mdi-circle-outline'"
                  :title="onlyUnread ? '只看未读' : '看全部'"
                  @click="changeOnlyUnread(!onlyUnread)"
                  class="items-unread-toggle"
                >
                </c-btn>
                <c-btn
                  v-if="!mobile"
                  :icon="
                    general.defaultView == 'card'
                      ? 'mdi-view-grid-outline'
                      : general.defaultView == 'column'
                      ? 'mdi-view-column-outline'
                      : general.defaultView == 'magazine'
                      ? 'mdi-view-sequential-outline'
                      : general.defaultView == 'list'
                      ? 'mdi-list-box-outline'
                      : general.defaultView == 'text'
                      ? 'mdi-text-box-outline'
                      : 'mdi-view-dashboard-outline'
                  "
                  :title="
                    general.defaultView == 'card'
                      ? '卡片视图'
                      : general.defaultView == 'column'
                      ? '三栏视图'
                      : general.defaultView == 'magazine'
                      ? '杂志视图'
                      : general.defaultView == 'list'
                      ? '列表视图'
                      : general.defaultView == 'text'
                      ? '清单视图'
                      : '跟随文章'
                  "
                  @click="changeItemView()"
                  class="items-view-toggle"
                >
                </c-btn>
              </div>
            </div>
          </slot>
          <v-container class="mx-auto items-warp">
            <v-alert
              class="my-3"
              v-show="appStore.nav.isFailure"
              border="top"
              border-color="warning"
            >
              <div class="d-flex justify-space-between">
                <v-icon class="mr-3">mdi-alert-circle-outline</v-icon>
                此订阅源有问题。请检查并在必要时重新订阅。
                <v-btn
                  class="ml-3"
                  size="small"
                  variant="text"
                  :href="appStore.nav.url"
                >
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
              <Items
                :items="store.items"
                :view="viewMode"
                :type="type"
                @open-reader="openReader"
              ></Items>
            </template>

            <template v-if="store.isLast && !loading">
              <v-empty-state
                icon="mdi-book-open-page-variant-outline"
                v-if="feedStore.nextUnReadUrl"
                height="calc(100vh - 56px)"
                class="next-unreadlist"
              >
                <v-btn variant="text" :to="feedStore.nextUnReadUrl">
                  <template #prepend>
                    <v-icon color="primary"> mdi-circle-medium </v-icon>
                  </template>
                  打开下一个未读的订阅源
                </v-btn>
              </v-empty-state>
              <v-empty-state
                v-else-if="!store.items?.length"
                height="calc(100vh - 56px)"
                icon="mdi-fruit-watermelon"
                text="全部已读"
              >
              </v-empty-state>
              <v-empty-state
                v-else
                height="calc(100vh - 56px)"
                icon="mdi-fruit-cherries"
                text="我是有底线的"
              >
              </v-empty-state>
              <v-empty-state
                v-if="!onlyUnread && type == 'f' && store.items?.length == 0"
                height="calc(100vh - 56px)"
                icon="mdi-cloud-download-outline"
              >
                <v-btn
                  variant="text"
                  @click="pullFeedItems"
                  :disabled="loading"
                >
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

function changeItemView() {
  if (general.value.defaultView == "list") {
    general.value.defaultView = "card";
  } else if (general.value.defaultView == "card") {
    general.value.defaultView = "column";
  } else if (general.value.defaultView == "column") {
    general.value.defaultView = "magazine";
  } else if (general.value.defaultView == "magazine") {
    general.value.defaultView = "text";
  } else if (general.value.defaultView == "text") {
    general.value.defaultView = "auto";
  } else {
    general.value.defaultView = "list";
  }
  mainRef.value.style.width = "";
  mainRef.value.scrollTo(0, 0);
  settingsStore.saveToLocalStorage();
}

function watchLoadMore() {
  watch(isBottom, (v) => {
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

let autoRefresh: NodeJS.Timeout;

async function loadData0(
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
      loadData();
    }, general.value.refreshInterval * 1000);
  }

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
  const confirmed = await confirm({
    title: "标记已读",
    message: "确定要将全部文章标记为已读吗？",
  });

  if (confirmed) {
    await appStore.read(
      Number(props.id),
      props.type == "f" ? Marked.FEED : Marked.GROUP,
      appStore.lastRefeshTime
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

defineExpose({ loadData, openReader });
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
    // border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    overflow-y: scroll;
    resize: horizontal;
    min-width: 360px;
    max-width: 36vw;
    width: 380px;
    background-color: rgb(var(--sidbar-bg));
    .top-bar {
      background-color: rgb(var(--sidbar-bg));
    }
  }
}

@media (max-width: 760px) {
  .main-col {
    display: block;
    .main-container {
      width: 100%;
      max-width: 100%;
      resize: none;
    }
  }
}
</style>
