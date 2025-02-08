<template>
  <div
    class="items-list"
    v-if="view == 'card'"
    :class="{ 'items-list-col': itemsType !== ItemType.VIDEO }"
  >
    <card-item
      v-for="(item, index) in items"
      :key="item.id"
      :item="item"
      @click="openReader(index, item)"
      @click-action="clickAction"
      @contextmenu.prevent="showContextMenu($event, item, index)"
      :type="type"
      class="entry-item"
      :class="{ 'fade-in': !settingStore.appearance.lessAnimation }"
      :style="{ animationDelay: `${(index % 50) * 0.05}s` }"
    />
  </div>
  <template v-else-if="view == 'magazine' || view == 'column'">
    <magazine-item
      v-for="(item, index) in items"
      :item="item"
      @click="openReader(index, item)"
      @contextmenu.prevent="showContextMenu($event, item, index)"
      :type="type"
      :key="item.id"
      class="entry-item"
      :class="{ 'fade-in': !settingStore.appearance.lessAnimation }"
      :style="{ animationDelay: `${(index % 50) * 0.05}s` }"
    />
  </template>
  <template v-else-if="view == 'text'">
    <v-list>
      <text-item
        v-for="(item, index) in items"
        :item="item"
        @click="openReader(index, item)"
        @click-action="clickAction"
        @contextmenu.prevent="showContextMenu($event, item, index)"
        :type="type"
        :key="item.id"
        class="entry-item"
        :class="{ 'fade-in': !settingStore.appearance.lessAnimation }"
        :style="{ animationDelay: `${(index % 50) * 0.005}s` }"
      />
    </v-list>
  </template>
  <template v-else>
    <content-item
      v-for="(item, index) in items"
      :item="item"
      @click="openReader(index, item)"
      @click-action="clickAction"
      @contextmenu.prevent="showContextMenu($event, item, index)"
      :type="type"
      :key="item.id"
      class="entry-item"
      :class="{ 'fade-in': !settingStore.appearance.lessAnimation }"
      :style="{ animationDelay: `${(index % 50) * 0.05}s` }"
    />
  </template>
  <!-- 右键菜单 -->
  <v-dialog-transition>
    <v-card
      v-show="contextMenuVisible"
      class="menus"
      style="position: fixed; z-index: 10000"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
    >
      <v-list nav v-if="currentItem">
        <v-list-item
          prepend-icon="mdi-open-in-new"
          :href="currentItem.link"
          target="_blank"
          @click="hideContextMenu"
        >
          在新窗口打开源网页
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item
          :prepend-icon="
            currentItem.isRead ? 'mdi-circle' : 'mdi-circle-outline'
          "
          @click="
            toggleRead(currentItem);
            hideContextMenu();
          "
        >
          {{ currentItem.isRead ? "标记为未读" : "标记为已读" }}
        </v-list-item>
        <v-list-item
          :prepend-icon="
            currentItem.isSaved ? 'mdi-playlist-minus' : 'mdi-playlist-plus'
          "
          @click="
            toggleSaved(currentItem);
            hideContextMenu();
          "
        >
          {{ currentItem.isSaved ? "移出稍后阅读" : "加入稍后阅读" }}
        </v-list-item>
        <v-list-item
          v-if="type != 'f'"
          prepend-icon="mdi-rss"
          :to="'/f/' + currentItem?.feed?.id"
          @click="hideContextMenu"
        >
          查看订阅源
        </v-list-item>
        <v-list-item
          :prepend-icon="
            currentItem.isRead ? 'mdi-check-underline' : 'mdi-read'
          "
          @click="
            upItemsToggleRead(currentItemIndex);
            hideContextMenu();
          "
        >
          {{ currentItem.isRead ? "标记以上为未读" : "标记以上为已读" }}
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog-transition>
</template>

<script setup lang="ts">
import { useAppStore, useSettingsStore } from "@/store";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import CardItem from "./CardItem.vue";
import MagazineItem from "./MagazineItem.vue";
import ContentItem from "./ContentItem.vue";
import TextItem from "./TextItem.vue";
import { FeedItem } from "@/service/types";
import { ClickType } from "./types";
import { useCalItemType } from "@/utils/useCalView";
import { ViewMode } from "@/store/types";
import { ItemType } from "@/service/types";
const props = defineProps<{
  view: ViewMode;
  items: FeedItem[];
  type: string;
}>();
const emit = defineEmits(["open-reader"]);
const store = useAppStore();
const settingStore = useSettingsStore();
const currentItem = ref<FeedItem | undefined>(undefined);
const items = computed(() => props.items);
const { itemsType } = useCalItemType(items);

function openReader(index: number, item: FeedItem) {
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
  items.forEach((item) => {
    if (item.isRead == isRead) {
      if (isRead) {
        store.unread(item.id);
      } else {
        store.read(item.id);
      }
    }
  });
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
  webfollowApp.upItemsToggleRead = upItemsToggleRead;
});

onBeforeUnmount(() => {
  document.removeEventListener("click", hideContextMenu);
  webfollowApp.upItemsToggleRead = undefined;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-items: start; /* 顶部对齐 */
  gap: 0.5rem;
  & > div {
    padding: 0.5rem;
  }
  & .v-card {
    padding: 9px;
  }
}
.m-main .items-list-col {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}
/**
.items-list {
  .v-col-xxl,
  .v-col-xxl-auto,
  .v-col-xxl-12,
  .v-col-xxl-11,
  .v-col-xxl-10,
  .v-col-xxl-9,
  .v-col-xxl-8,
  .v-col-xxl-7,
  .v-col-xxl-6,
  .v-col-xxl-5,
  .v-col-xxl-4,
  .v-col-xxl-3,
  .v-col-xxl-2,
  .v-col-xxl-1,
  .v-col-xl,
  .v-col-xl-auto,
  .v-col-xl-12,
  .v-col-xl-11,
  .v-col-xl-10,
  .v-col-xl-9,
  .v-col-xl-8,
  .v-col-xl-7,
  .v-col-xl-6,
  .v-col-xl-5,
  .v-col-xl-4,
  .v-col-xl-3,
  .v-col-xl-2,
  .v-col-xl-1,
  .v-col-lg,
  .v-col-lg-auto,
  .v-col-lg-12,
  .v-col-lg-11,
  .v-col-lg-10,
  .v-col-lg-9,
  .v-col-lg-8,
  .v-col-lg-7,
  .v-col-lg-6,
  .v-col-lg-5,
  .v-col-lg-4,
  .v-col-lg-3,
  .v-col-lg-2,
  .v-col-lg-1,
  .v-col-md,
  .v-col-md-auto,
  .v-col-md-12,
  .v-col-md-11,
  .v-col-md-10,
  .v-col-md-9,
  .v-col-md-8,
  .v-col-md-7,
  .v-col-md-6,
  .v-col-md-5,
  .v-col-md-4,
  .v-col-md-3,
  .v-col-md-2,
  .v-col-md-1,
  .v-col-sm,
  .v-col-sm-auto,
  .v-col-sm-12,
  .v-col-sm-11,
  .v-col-sm-10,
  .v-col-sm-9,
  .v-col-sm-8,
  .v-col-sm-7,
  .v-col-sm-6,
  .v-col-sm-5,
  .v-col-sm-4,
  .v-col-sm-3,
  .v-col-sm-2,
  .v-col-sm-1,
  .v-col,
  .v-col-auto,
  .v-col-12,
  .v-col-11,
  .v-col-10,
  .v-col-9,
  .v-col-8,
  .v-col-7,
  .v-col-6,
  .v-col-5,
  .v-col-4,
  .v-col-3,
  .v-col-2,
  .v-col-1 {
    padding: 0;
    padding-top: 12px;
  }
}
.v-list-item .v-card {
  padding: 9px;
}
*/
.fade-in {
  opacity: 0;
  transform: translateY(-20px);
  animation: fadeIn 0.3s forwards; /* 动画效果 */
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
