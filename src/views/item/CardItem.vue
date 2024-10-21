<template>
  <v-card flat max-width="480px">
    <v-img
      v-if="item.thumbnail"
      class="align-end text-white"
      :src="
        item.thumbnail
          ? item.thumbnail
          : 'http://img.netbian.com/file/2024/0515/191947LFJ2P.jpg'
      "
    >
      <v-card-title class="bg-cover" v-text="item.title"></v-card-title>
    </v-img>
    <template v-else>
      <v-card-title v-text="item.title"></v-card-title>
    </template>

    <v-card-subtitle class="pt-4">
      {{ getSubtitle() }}
    </v-card-subtitle>
    <v-card-text>
      <p class="color-surface" v-text="item.summary"></p>
    </v-card-text>
    <v-card-actions>
      <v-icon
        class="ml-1"
        color="primary"
        :icon="item.isRead ? '' : 'mdi-circle-medium'"
      ></v-icon>
      <v-spacer></v-spacer>
      <v-btn
        class="button"
        icon="mdi-open-in-new"
        variant="text"
        title="打开原文"
        :href="item.link"
      ></v-btn>
      <v-btn
        class="button"
        variant="text"
        icon
        title="稍后阅读"
        @click.stop="toggleSaved"
      >
        <v-icon>{{
          item.isSaved ? "mdi-playlist-minus" : "mdi-playlist-plus"
        }}</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script setup lang="ts">
import { useAppStore } from "@/store";

const props = defineProps(["item", "type"]);

const store = useAppStore();

function toggleSaved() {
  if (props.item.isSaved) {
    store.unsave(props.item.id);
  } else {
    store.save(props.item.id);
  }
}

function getSubtitle() {
  const source =
    props.type === "f"
      ? props.item.author || props.item.feed.title
      : props.item.feed.title;
  return `${source} | ${props.item.datestr}`;
}
</script>
<style scoped>
.bg-cover {
  background-color: rgba(var(--v-theme-surface-variant), 0.8);
}
.v-card .button {
  opacity: 0;
  transition: opacity 0.3s;
}
.v-card-text {
  padding-bottom: 0;
}

.v-card:hover .button {
  opacity: 1;
}
</style>
