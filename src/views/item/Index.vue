<template>
  <div class="items-list" v-if="view == 'card'" :class="{ 'items-list-col': itemsType !== ItemType.VIDEO }">
    <card-item v-for="(item, index) in items" :key="item.id" :item="item" @click="openReader(index, item)"
      @click-action="clickAction" @contextmenu.prevent="showContextMenu($event, item, index)" :type="type"
      class="entry-item" :class="{ 'fade-in': !settingStore.appearance.lessAnimation }"
      :style="{ animationDelay: `${(index % 50) * 0.05}s` }" />
  </div>
  <template v-else-if="view == 'magazine' || view == 'column'">
    <template v-if="general.enableListAISummary">
      <ai-summary-item v-for="(item, index) in items" :item="item" @click="openReader(index, item)"
        @contextmenu.prevent="showContextMenu($event, item, index)" :type="type" :key="item.id" class="entry-item"
        :class="{ 'fade-in': !settingStore.appearance.lessAnimation }"
        :style="{ animationDelay: `${(index % 50) * 0.03}s` }" />
    </template>
    <template v-else>
      <magazine-item v-for="(item, index) in items" :item="item" @click="openReader(index, item)"
        @contextmenu.prevent="showContextMenu($event, item, index)" :type="type" :key="item.id" class="entry-item"
        :class="{ 'fade-in': !settingStore.appearance.lessAnimation }"
        :style="{ animationDelay: `${(index % 50) * 0.03}s` }" />
    </template>
  </template>
  <template v-else-if="view == 'text'">
    <v-list>
      <text-item v-for="(item, index) in items" :item="item" @click="openReader(index, item)"
        @click-action="clickAction" @contextmenu.prevent="showContextMenu($event, item, index)" :type="type"
        :key="item.id" class="entry-item" :class="{ 'fade-in': !settingStore.appearance.lessAnimation }"
        :style="{ animationDelay: `${(index % 50) * 0.005}s` }" />
    </v-list>
  </template>
  <template v-else>
    <v-list max-width="600" class="mx-auto">
      <tweet-item v-for="(item, index) in items" :item="item" @click="openReader(index, item)"
        @click-action="clickAction" @contextmenu.prevent="showContextMenu($event, item, index)" :type="type"
        :key="item.id" class="entry-item" :class="{ 'fade-in': !settingStore.appearance.lessAnimation }"
        :style="{ animationDelay: `${(index % 50) * 0.005}s` }" />
    </v-list>
    <!-- <content-item v-for="(item, index) in items" :item="item" @click="openReader(index, item)"
      @click-action="clickAction" @contextmenu.prevent="showContextMenu($event, item, index)" :type="type"
      :key="item.id" class="entry-item" :class="{ 'fade-in': !settingStore.appearance.lessAnimation }"
      :style="{ animationDelay: `${(index % 50) * 0.03}s` }" /> -->
  </template>
  <!-- 右键菜单 -->
  <v-dialog-transition>
    <v-card v-show="contextMenuVisible" class="menus" style="position: fixed; z-index: 10000"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }">
      <v-list nav v-if="currentItem">
        <v-list-item prepend-icon="mdi-open-in-new" :href="currentItem.link" target="_blank" @click="hideContextMenu">
          在新窗口打开源网页
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item :prepend-icon="currentItem.isRead ? 'mdi-circle' : 'mdi-circle-outline'
          " @click="
            toggleRead(currentItem);
          hideContextMenu();
          ">
          {{ currentItem.isRead ? "标记为未读" : "标记为已读" }}
        </v-list-item>
        <v-list-item :prepend-icon="currentItem.isSaved ? 'mdi-playlist-minus' : 'mdi-playlist-plus'
          " @click="
            toggleSaved(currentItem);
          hideContextMenu();
          ">
          {{ currentItem.isSaved ? "移出稍后阅读" : "加入稍后阅读" }}
        </v-list-item>
        <v-list-item v-if="type != 'f'" prepend-icon="mdi-rss" :to="'/f/' + currentItem?.feed?.id"
          @click="hideContextMenu">
          查看订阅源
        </v-list-item>
        <v-list-item :prepend-icon="currentItem.isRead ? 'mdi-check-underline' : 'mdi-read'
          " @click="
            upItemsToggleRead(currentItemIndex);
          hideContextMenu();
          ">
          {{ currentItem.isRead ? "标记以上为未读" : "标记以上为已读" }}
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog-transition>
</template>

<script setup lang="ts">
import { useAppStore, useSettingsStore } from "@/store";
import { ref, onMounted, onBeforeUnmount, computed, inject } from "vue";
import { itemsTypeSymbol } from "../InjectionSymbols";
import CardItem from "./CardItem.vue";
import MagazineItem from "./MagazineItem.vue";
import AiSummaryItem from "./AISummaryItem.vue";

// import ContentItem from "./ContentItem.vue";
import TextItem from "./TextItem.vue";
import TweetItem from "./TweetItem.vue";
import { FeedItem } from "@/service/types";
import { ClickType } from "./types";
import { ViewMode } from "@/store/types";
import { ItemType } from "@/service/types";
import { storeToRefs } from "pinia";
const props = defineProps<{
  view: ViewMode;
  items: FeedItem[];
  type: string;
}>();
const emit = defineEmits(["open-reader"]);
const store = useAppStore();
const settingStore = useSettingsStore();
const { general } = storeToRefs(settingStore);
const currentItem = ref<FeedItem | undefined>(undefined);
const items = computed(() => props.items);
const itemsType = inject(itemsTypeSymbol);

function openReader(index: number, item: FeedItem) {
  ifeedApp.view.changeEntryCurrentIndex(index);
  emit("open-reader", index, item);
}

function clickAction(action: ClickType, item: FeedItem) {
  if (action == ClickType.read) {
    toggleRead(item);
  } else if (action == ClickType.save) {
    toggleSaved(item);
  }
}

function toggleSaved(item: FeedItem) {
  if (item.isSaved) {
    store.unsave(item.id);
  } else {
    store.save(item.id);
  }
}

function toggleRead(item: FeedItem) {
  if (item.isRead) {
    store.unread(item.id);
  } else {
    store.read(item.id);
  }
}

function upItemsToggleRead(index: number) {
  const isRead = props.items[index].isRead;
  const items = props.items.slice(0, index + 1);
  const itemIds = items
    .filter((item) => item.isRead == isRead)
    .map((item) => item.id);
  if (isRead) {
    store.unreadItemBatch(itemIds);
  } else {
    store.readItemBatch(itemIds);
  }
  // items.forEach((item) => {
  //   if (item.isRead == isRead) {
  //     if (isRead) {
  //       store.unread(item.id);
  //     } else {
  //       store.read(item.id);
  //     }
  //   }
  // });
}

const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
let currentItemIndex = 0;

const showContextMenu = (event: MouseEvent, item: FeedItem, index: number) => {
  event.preventDefault();
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  contextMenuVisible.value = true;
  currentItem.value = item;
  currentItemIndex = index;
};

const hideContextMenu = () => {
  contextMenuVisible.value = false;
};

onMounted(() => {
  document.addEventListener("click", hideContextMenu);
  ifeedApp.upItemsToggleRead = upItemsToggleRead;
});

onBeforeUnmount(() => {
  document.removeEventListener("click", hideContextMenu);
  ifeedApp.upItemsToggleRead = undefined;
});

defineExpose({
  upItemsToggleRead,
});
</script>
<style lang="scss">
.v-list-item .v-card:hover,
.v-list-item:focus .v-card {
  background-color: rgb(var(--v-theme-on-surface-variant));
}


.items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  align-items: start;
  /* 顶部对齐 */
  gap: 0.5rem;

  &>div {
    padding: 0.5rem;
  }

  & .v-card {
    padding: 9px;
  }
}

.m-main .items-list-col {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.fade-in {
  opacity: 0;
  transform: translateY(-20px);
  animation: fadeIn 0.3s forwards;
  /* 动画效果 */
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }

  50% {
    opacity: 0.1;
    transform: translateY(5px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
<style scoped>
.v-list {
  background-color: transparent;
}
</style>