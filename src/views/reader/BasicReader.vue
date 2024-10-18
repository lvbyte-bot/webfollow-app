<template>
  <v-card flat height="100vh" class="ovf">
    <div class="px-1">
      <div class="top-sider">
        <v-card-title class="text-overflow">{{ item.title }}</v-card-title>
        <div>
          <v-btn
            variant="text"
            :icon="item.is_read ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
            title="阅读"
          >
          </v-btn>

          <v-btn variant="text" icon title="稍后阅读">
            <v-icon>mdi-playlist-plus</v-icon>
          </v-btn>
          <v-btn variant="text" icon title="加载网页原文">
            <v-icon> mdi-book-open-outline</v-icon>
          </v-btn>
          <v-btn variant="text" icon title="调正字体">
            <v-icon> mdi-format-size</v-icon>
          </v-btn>
          <v-btn variant="text" icon title="更多">
            <v-icon> mdi-dots-vertical</v-icon>
          </v-btn>
        </div>
      </div>
      <v-container>
        <slot>
          <v-card-subtitle>{{ item.date }}</v-card-subtitle>
          <div class="content" v-html="item.html"></div>
        </slot>
      </v-container>
    </div>
    <!-- <v-card-actions>
      <v-btn
        color="surface-variant"
        text="Agree"
        variant="flat"
        icon="mdi-chevron-down"
      >
      </v-btn>
    </v-card-actions> -->
  </v-card>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { useBaseStore } from "@/store";
import { watch } from "vue";
import { Marked } from "@/service";
import { FeedItem } from "@/service/types";

const props = defineProps<{
  item: FeedItem;
}>();

const store = useBaseStore();
onMounted(() => {
  if (!props.item.isRead) {
    store.read(Number(props.item.id), Marked.ITEM);
  }
});
watch(
  () => props.item.id,
  () => {
    if (!props.item.isRead) {
      store.read(Number(props.item.id), Marked.ITEM);
    }
  }
);
</script>
<style scoped>
.ovf {
  overflow-y: auto;
}
.top-sider {
  background-color: rgb(var(--v-theme-background));
  display: grid;
  grid-template-columns: 1fr 240px;
  padding: 0.5rem 0.3rem;
}
.text-overflow {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
<style>
.content {
  padding: 0.5rem;
  * {
    max-width: 100%;
  }
}
</style>
