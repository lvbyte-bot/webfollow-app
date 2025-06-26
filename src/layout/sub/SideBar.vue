<template>

  <div class="sidebar" v-bind="$attrs">
    <v-list nav class="sidebar-list" @mousedown.prevent="" @contextmenu.prevent>
      <div class="sidebar-top">
        <slot name="top"></slot>
        <v-list-item prepend-icon="mdi-sun-compass" value="explore" title="今天" to="/explore">
          <template v-slot:append>
            <small v-if="appStore.item7DayUnReadQty" class="font-weight-thin"
              v-text="appStore.item7DayUnReadQty"></small>
          </template>
        </v-list-item>
        <v-list-item prepend-icon="mdi-text-search-variant" value="search" title="订阅搜索" to="/search">
        </v-list-item>
        <v-list-item prepend-icon="mdi-bookmark-outline" value="next" title="稍后阅读" to="/next">
          <template v-slot:append>
            <small v-if="appStore.savedQty" class="font-weight-thin" v-text="appStore.savedQty"></small>
          </template>
        </v-list-item>
      </div>
      <div class="v-list-subheader" style="padding: 0.3rem;">
        <div class="d-flex justify-space-between w-100">
          <span>FILTERS</span>
          <div>
            <router-link to="/filter">
              <v-icon icon="mdi-filter-plus-outline" color="primary"></v-icon>
            </router-link>
          </div>
        </div>
      </div>
      <v-list-item v-for="filter in settingsStore.automation.filters" :key="filter.id" :title="filter.name"
        :to="`/filter/${filter.id}`" :value="filter.id" @contextmenu.prevent="showFilterContextMenu($event, filter)">
        <template #prepend>
          <v-icon size="small">mdi-filter-outline</v-icon>
        </template>
      </v-list-item>
      <!-- <v-list-subheader>FEEDS</v-list-subheader> -->
      <div class="v-list-subheader" style="padding: 0.3rem;">
        <div class="d-flex justify-space-between w-100">
          <span>FEEDS</span>
          <div>
            <v-btn variant="text" to="/subscribe" icon="mdi-plus" size="small" title="订阅" height="20" width="20"
              color="primary"></v-btn>
          </div>
        </div>
      </div>

      <v-list-item prepend-icon="mdi-list-box-outline" value="all" title="全部文章" to="/all">
        <template v-slot:append>
          <small v-if="appStore.unReadQty" class="font-weight-thin" v-text="appStore.unReadQty"></small>
        </template>
      </v-list-item>
      <template v-for="gItem in feedStore.subscriptions">
        <template v-if="gItem.title == 'All'">
          <v-list-item v-for="subItem in gItem.feeds" :key="gItem.id + '-' + subItem.id"
            :class="{ 'text-red-accent-3': subItem.isFailure, 'v-list-item--active': selectedFeeds.map(o => o.id).includes(subItem.id) }"
            :value="isMultiSelectMode || contextMenuVisible ? undefined : gItem.id + '-' + subItem.id"
            :to="isMultiSelectMode || contextMenuVisible ? undefined : '/f/' + subItem.id"
            @click="($event: MouseEvent) => handleFeedSelect($event, subItem)" @mousedown.prevent=""
            @contextmenu.prevent="showContextMenu($event, subItem)">
            <template #prepend>
              <div class="icon-warp">
                <img :src="subItem.icon" onerror="this.src='/logo.svg'" width="17">
                </img>
              </div>

            </template>
            <v-list-item-title :class="{ 'font-weight-bold': subItem.unreadQty }" v-text="subItem.title">
            </v-list-item-title>
            <template v-slot:append>
              <small v-if="subItem.unreadQty" class="font-weight-thin" v-text="subItem.unreadQty"></small>
            </template>
          </v-list-item>
        </template>
        <v-list-group v-else-if="gItem.feeds.length" :value="gItem.id" :key="gItem.id">
          <template v-slot:activator="{ isOpen, props }">
            <v-list-item v-bind="props" @contextmenu.prevent="showContextMenu($event, gItem, true)">
              <v-list-item-title :class="{ 'font-weight-bold': gItem.unreadQty }"
                v-text="gItem.title"></v-list-item-title>
              <template #prepend>
                <v-icon :icon="isOpen ? 'mdi-chevron-down' : ' mdi-chevron-right'">
                </v-icon>
              </template>
              <template #append>
                <small v-if="gItem.unreadQty" class="font-weight-thin" v-text="gItem.unreadQty"></small>
              </template>
            </v-list-item>
          </template>
          <v-list-item title="全部" :value="'/c/' + gItem.id" :to="'/c/' + gItem.id" @click="handlerClear"
            @contextmenu.prevent="showContextMenu($event, gItem, true)">
          </v-list-item>
          <v-list-item v-for="subItem in gItem.feeds" :key="gItem.id + '-' + subItem.id"
            :class="{ 'text-red-accent-3': subItem.isFailure, 'v-list-item--active': selectedFeeds.map(o => o.id).includes(subItem.id) }"
            :value="isMultiSelectMode || contextMenuVisible ? undefined : gItem.id + '-' + subItem.id"
            :to="isMultiSelectMode || contextMenuVisible ? undefined : '/f/' + subItem.id"
            @click="($event: MouseEvent) => handleFeedSelect($event, subItem)" @mousedown.prevent=""
            @contextmenu.prevent="showContextMenu($event, subItem)">
            <template #prepend>
              <div class="icon-warp">
                <img :src="subItem.icon" onerror="this.src='/logo.svg'" width="17">
                </img>
              </div>
            </template>
            <v-list-item-title :class="{ 'font-weight-bold': subItem.unreadQty }" v-text="subItem.title">
            </v-list-item-title>
            <template v-slot:append>
              <small v-if="subItem.unreadQty" class="font-weight-thin" v-text="subItem.unreadQty"></small>
            </template>
          </v-list-item>
        </v-list-group>
      </template>
      <slot name="footer"></slot>
    </v-list>

    <div class="x-tip" v-show="tipStr">
      {{ tipStr }}
    </div>
  </div>

  <v-card v-show="contextMenuVisible" class="menus" style="position: fixed; z-index: 10000"
    :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }">
    <v-list nav>
      <v-list-item v-if="currentGroup" prepend-icon="mdi-read" @click="handleAction('markRead')">
        标记为已读
      </v-list-item>
      <template v-else>
        <v-list-item v-if="!isMultiSelectMode" prepend-icon="mdi-read" @click="handleAction('markRead')">
          标记为已读
        </v-list-item>
        <v-list-item v-if="!isMultiSelectMode" prepend-icon="mdi-dots-horizontal" @click="handleAction('feed')">
          订阅源选项
        </v-list-item>
        <v-list-item prepend-icon="mdi-folder-move-outline" @click="handleAction('edit')">
          {{ selectedFeeds.length > 1 ? '批量移动分组' : '移动分组' }}
        </v-list-item>
        <v-list-item prepend-icon="mdi-delete-outline" @click="handleAction('delete')">
          {{ selectedFeeds.length > 1 ? '批量取消订阅' : '取消订阅' }}
        </v-list-item>
      </template>
    </v-list>
  </v-card>

  <v-card v-show="filterContextMenuVisible" class="menus" style="position: fixed; z-index: 10000"
    :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }">
    <v-list nav>
      <v-list-item prepend-icon="mdi-delete-outline" @click="handleFilterAction('delete')">
        删除过滤项
      </v-list-item>
    </v-list>
  </v-card>
  <v-dialog v-model="editable" max-width="500">
    <v-card prepend-icon="mdi-pencil-box-outline" title="移动分组">
      <v-card-text>
        <v-form ref="form">
          <template v-if="selectedFeeds.length == 1">
            <v-text-field label="标题" disabled required v-model="currentItem.title"></v-text-field>
          </template>
          <v-select label="分组" v-model="currentItem.groupName" required :items="feedStore.groups.map(g => g.title)"
            :rules="[v => !!v || '分组是必填']">
          </v-select>
          <v-btn class="mt-4" block :loading="loading" color="primary"
            @click="selectedFeeds.length > 1 ? onBatchUpdate() : onUpdate()">
            保存
          </v-btn>
        </v-form>
      </v-card-text>

    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" width="auto">
    <v-card width="400" prepend-icon="mdi-delete-outline" :text="selectedFeeds.length > 1 ? '确认批量取消订阅?' : '确认取消订阅?'"
      title="取消订阅">
      <v-card-text>
        <v-btn :loading="loading" block color="error" text="确认"
          @click="selectedFeeds.length > 1 ? onBatchDelete() : onDelete()">
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
  <feed-dialog v-model="feedDialog" :feed="currentItem" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, Ref } from "vue";
import { useFeedsStore, useAppStore, useSettingsStore } from "@/store";
import FeedDialog from "./FeedDialog.vue";

// import { useDisplay } from "vuetify";
import { Marked } from "@/service";

// const { mobile } = useDisplay();
const feedStore = useFeedsStore();
const appStore = useAppStore();
const settingsStore = useSettingsStore();
const editable = ref(false);
const deleteDialog = ref(false);
const feedDialog = ref(false);
const form: Ref<any> = ref();
const currentItem: Ref<any> = ref({ title: undefined });
const loading = ref(false);
const tipStr = ref("");

onMounted(() => {
  document.addEventListener("click", hideContextMenu);
  let clear: any;
  webfollowApp.tip = (tip: string, time: number = 8000) => {
    tipStr.value = tip;
    if (clear) {
      clearTimeout(clear);
    }
    clear = setTimeout(() => {
      tipStr.value = "";
    }, time);
  };
});

onBeforeUnmount(() => {
  document.removeEventListener("click", hideContextMenu);
});

const hideContextMenu = () => {
  contextMenuVisible.value = false;
  filterContextMenuVisible.value = false;
};

const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const selectedFeeds = ref<any[]>([]);
const isMultiSelectMode = ref(false);
const lastSelectedFeed = ref<any>(null);

const filterContextMenuVisible = ref(false);
const currentFilter = ref<any>(null);

const handlerClear = () => {
  selectedFeeds.value = [];
  lastSelectedFeed.value = null;
  isMultiSelectMode.value = false;
};

// 添加选择处理函数
const handleFeedSelect = (event: MouseEvent | KeyboardEvent, feed: any) => {
  if (event.ctrlKey) {
    // Ctrl 键多选
    event.preventDefault();
    isMultiSelectMode.value = true;
    if (selectedFeeds.value.find((f) => f.id === feed.id)) {
      selectedFeeds.value = selectedFeeds.value.filter((f) => f.id !== feed.id);
    } else {
      selectedFeeds.value.push(feed);
    }
    lastSelectedFeed.value = feed;
  } else if (event.shiftKey && lastSelectedFeed.value) {
    event.preventDefault();
    isMultiSelectMode.value = true;

    let allFeeds: any[] = [];

    feedStore.subscriptions?.forEach((group) => {
      allFeeds = [...allFeeds, ...group.feeds];
    });

    const startIndex = allFeeds.findIndex(
      (f) => f.id === lastSelectedFeed.value.id
    );
    const endIndex = allFeeds.findIndex((f) => f.id === feed.id);

    if (startIndex !== -1 && endIndex !== -1) {
      // 获取范围内的所有feeds
      const start = Math.min(startIndex, endIndex);
      const end = Math.max(startIndex, endIndex);

      selectedFeeds.value = allFeeds.slice(start, end + 1);
    }
  } else {
    selectedFeeds.value = [feed];
    lastSelectedFeed.value = feed;
    isMultiSelectMode.value = false;
  }
};

async function markRead(id: number, marked: Marked) {
  await appStore.read(id, marked, appStore.lastRefeshTime);
}

// 添加批量操作函数
async function onBatchUpdate() {
  loading.value = true;
  if (!currentItem.value.groupName) {
    alert("请选择分组");
    return;
  }
  const groupId = feedStore.groups.filter(
    (g) => g.title == currentItem.value.groupName
  )[0].id;
  for (const feed of selectedFeeds.value) {
    try {
      await feedStore.updateFeed(feed.id, groupId);
    } catch (e) {
      err(e, "feed删除失败[" + feed.title + "]");
    }
  }
  loading.value = false;
  editable.value = false;
  handlerClear();
}

async function onBatchDelete() {
  loading.value = true;
  for (let i = 0; i < selectedFeeds.value.length; i++) {
    const feed = selectedFeeds.value[i];
    try {
      await feedStore.deleteFeed(feed.id, i + 1 == selectedFeeds.value.length);
    } catch (e) {
      err(e, "feed更新失败[" + feed.title + "]");
    }
  }
  loading.value = false;
  deleteDialog.value = false;
  handlerClear();
}

async function onUpdate() {
  // console.log(currentItem.value)
  loading.value = true;
  if (!currentItem.value.groupName) {
    alert("请选择分组");
    return;
  }
  const group_id = feedStore.groups.filter(
    (g) => g.title == currentItem.value.groupName
  )[0].id;
  try {
    await feedStore.updateFeed(currentItem.value.id, group_id);
  } catch (e) {
    err(e, "feed更新失败[" + currentItem.value.title + "]");
  }
  loading.value = false;
  editable.value = false;
}

async function onDelete() {
  loading.value = true;
  try {
    await feedStore.deleteFeed(currentItem.value.id);
  } catch (e) {
    err(e, "feed删除失败[" + currentItem.value.title + "]");
  }
  loading.value = false;
  deleteDialog.value = false;
}

let currentGroup: any = null;

// 修改右键菜单处理函数
const showContextMenu = (event: any, item: any, isGroup = false) => {
  filterContextMenuVisible.value = false;
  contextMenuX.value =
    event.clientX > 130 ? event.clientX - 120 : event.clientX;
  contextMenuY.value = event.clientY;
  contextMenuVisible.value = true;
  if (isGroup) {
    currentGroup = item;
    selectedFeeds.value = [];
  } else {
    currentGroup = null;
    currentItem.value = item;
    if (!isMultiSelectMode.value && item) {
      item.groupName = feedStore.groups.filter(
        (g) => g.id == item.groupId
      )[0].title;
      selectedFeeds.value = [item];
    }
  }
};

const handleAction = async (action: string) => {
  contextMenuVisible.value = false;
  if (action === "edit") {
    editable.value = true;
  } else if (action === "feed") {
    feedDialog.value = true;
  } else if (action === "delete") {
    deleteDialog.value = true;
  } else if (action === "markRead") {
    let id = currentGroup ? currentGroup.id : currentItem.value.id;
    try {
      markRead(id, currentGroup ? Marked.GROUP : Marked.FEED);
    } catch (e) {
      console.error(e);
    }
  }
};

const showFilterContextMenu = (event: MouseEvent, filter: any) => {
  contextMenuVisible.value = false;
  event.preventDefault();
  contextMenuX.value =
    event.clientX > 130 ? event.clientX - 120 : event.clientX;
  contextMenuY.value = event.clientY;
  filterContextMenuVisible.value = true;
  currentFilter.value = filter;
};

const handleFilterAction = (action: string) => {
  filterContextMenuVisible.value = false;

  if (action === "delete" && currentFilter.value) {
    if (confirm("确定要删除这个过滤项吗？")) {
      const index = settingsStore.automation.filters.findIndex(
        (f) => f.id === currentFilter.value.id
      );
      if (index !== -1) {
        settingsStore.automation.filters.splice(index, 1);
        settingsStore.saveToLocalStorage();
      }
    }
  }
};
</script>
<style scoped>
.sidebar-list {
  position: relative;
  overflow: scroll;
  background-color: transparent;
  padding-top: 0;
  height: 100vh;
}

.sidebar-top {
  padding-top: 0.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: rgb(var(--sidbar-bg));
}

.plus,
.x-tip {
  display: inline-block;
  position: fixed;
  bottom: 0;
  padding: 1rem;
  z-index: 1000;
}

.x-tip {
  background-color: rgba(var(--v-theme-background), 1);
  padding: 0.3rem 0.5rem;
  bottom: 1rem;
  left: 1rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(var(--v-theme-kbd), 0.3);
  font-size: small;
}

.v-list .v-list-item--nav:not(:only-child) {
  margin-bottom: 1px;
}

.font-weight-thin {
  opacity: 0.6;
}

.icon-warp {
  width: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>