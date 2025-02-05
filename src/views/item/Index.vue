<template>
  <v-row class="items-list" v-if="view == 'card'">
    <v-col
      :cols="itemsType == 'VIDEO' ? 12 : 6"
      sm="4"
      md="4"
      lg="3"
      xl="2"
      xxl="1"
      v-for="(item, index) in items"
      :key="item.id"
    >
      <CardItem
        :item="item"
        @click="openReader(index, item)"
        @click-action="clickAction"
        @contextmenu.prevent="showContextMenu($event, item, index)"
        :type="type"
        class="entry-item"
      ></CardItem>
    </v-col>
  </v-row>
  <template v-else-if="view == 'magazine' || view == 'column'">
    <MagazineItem
      v-for="(item, index) in items"
      :item="item"
      @click="openReader(index, item)"
      @contextmenu.prevent="showContextMenu($event, item, index)"
      :type="type"
      :key="item.id"
      class="entry-item"
    ></MagazineItem>
  </template>
  <template v-else>
    <ContentItem
      v-for="(item, index) in items"
      :item="item"
      @click="openReader(index, item)"
      @click-action="clickAction"
      @contextmenu.prevent="showContextMenu($event, item, index)"
      :type="type"
      :key="item.id"
      class="entry-item"
    ></ContentItem>
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
import { useAppStore } from "@/store";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import CardItem from "./CardItem.vue";
import MagazineItem from "./MagazineItem.vue";
import ContentItem from "./ContentItem.vue";
import { FeedItem } from "@/service/types";
import { ClickType } from "./types";
const props = defineProps<{
  view: String;
  items: FeedItem[];
  type: string;
}>();
const emit = defineEmits(["open-reader"]);
const store = useAppStore();
const currentItem = ref<FeedItem | undefined>(undefined);
const itemsType = computed(() => {
  const counts = props.items.slice(0, 50).reduce((acc: any, item: FeedItem) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0][0];
});

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
</style>
