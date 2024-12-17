<template>
  <v-row v-if="view == 'card'">
    <v-col
      cols="12"
      sm="12"
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
        @contextmenu.prevent="showContextMenu($event, item)"
        :type="type"
      ></CardItem>
    </v-col>
  </v-row>
  <template v-else-if="view == 'magazine'">
    <MagazineItem
      v-for="(item, index) in items"
      :item="item"
      @click="openReader(index, item)"
      @contextmenu.prevent="showContextMenu($event, item)"
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
      @contextmenu.prevent="showContextMenu($event, item)"
      :type="type"
      :key="item.id"
    ></TextItem>
  </template>
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
          在新窗口打开
        </v-list-item>
        <v-list-item
          :prepend-icon="
            currentItem.isRead ? 'mdi-radiobox-blank' : 'mdi-radiobox-marked'
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
      </v-list>
    </v-card>
  </v-dialog-transition>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";
import { ref, onMounted, onBeforeUnmount } from "vue";
import CardItem from "./CardItem.vue";
import TextItem from "./TextItem.vue";
import MagazineItem from "./MagazineItem.vue";
import { FeedItem } from "@/service/types";
import { ClickType } from "./types";
defineProps<{
  view: String;
  items: FeedItem[];
  type: string;
}>();
const emit = defineEmits(["open-reader"]);
const store = useAppStore();
const currentItem = ref<FeedItem | undefined>(undefined);

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

const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const showContextMenu = (event: MouseEvent, item: FeedItem) => {
  event.preventDefault();
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  contextMenuVisible.value = true;
  currentItem.value = item;
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
