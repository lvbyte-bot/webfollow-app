<template>
  <v-row v-if="view == 'card'">
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
      ></CardItem>
    </v-col>
  </v-row>
  <template v-else-if="view == 'magazine'">
    <MagazineItem
      v-for="(item, index) in items"
      :item="item"
      @click="openReader(index, item)"
      @contextmenu.prevent="showContextMenu($event, item, index)"
      :type="type"
      :key="item.id"
    ></MagazineItem>
  </template>
  <template v-else>
    <TextItem
      v-for="(item, index) in items"
      :item="item"
      @click="openReader(index, item)"
      @click-action="clickAction"
      @contextmenu.prevent="showContextMenu($event, item, index)"
      :type="type"
      :key="item.id"
    ></TextItem>
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
import TextItem from "./TextItem.vue";
import MagazineItem from "./MagazineItem.vue";
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
});

onBeforeUnmount(() => {
  document.removeEventListener("click", hideContextMenu);
});
</script>
