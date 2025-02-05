<template>
  <v-list-item :class="{ 'hover-bg': true, readly: item.isRead }">
    <template v-slot:prepend>
      <v-icon :color="item.isRead ? 'grey' : 'primary'">
        {{ item.isRead ? "" : "mdi-circle-medium" }}
      </v-icon>
    </template>

    <v-list-item-title class="d-flex justify-space-between align-center">
      <div class="text-item">
        <div class="d-flex align-center ">
          <img class="noclick mr-2" :src=" item?.feed?.icon" onerror="this.src='/logo.svg'" style="width:1rem" >
            </img>
            <span
          class="text-truncate  text-medium-emphasis"
          v-text="getSource()"
        ></span>
        </div>
        
        <div class="text-truncate">
          <span class="mr-2 title" v-text="item.title"></span>
          <span class="text-body-2 text-medium-emphasis" v-text="item.summary">
          </span>
        </div>
      </div>
      <span
        class="sub-text text-caption ml-2 flex-shrink-0"
        v-text="item.datestr"
      >
      </span>
      <div class="buttons">
        <!-- <v-btn
            size="small"
              variant="text"
              icon
              :title="item.feed?.title"
              :to="'/f/' + item?.feed?.id"
              @click.stop="()=>{}"
            >
            <img class="noclick" :src=" item?.feed?.icon" onerror="this.src='/logo.svg'" style="width:16px">
            </img>
        </v-btn> -->
        <!-- <v-btn
          size="small"
          variant="text"
          icon
          :title="item.isRead ? '未读' : '已读'"
          @click.stop="toggleRead"
        >
          <v-icon>{{
            item.isRead ? "mdi-radiobox-blank" : "mdi-radiobox-marked"
          }}</v-icon>
        </v-btn> -->

        <v-btn
          size="small"
          icon="mdi-open-in-new"
          variant="text"
          title="打开原文"
          :href="item.link"
        ></v-btn>
        <v-btn
          size="small"
          variant="text"
          icon
          title="稍后阅读"
          @click.stop="toggleSaved"
        >
          <v-icon>{{
            item.isSaved ? "mdi-playlist-minus" : "mdi-playlist-plus"
          }}</v-icon>
        </v-btn>
      </div>
    </v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
import { ClickType } from "./types";
const props = defineProps(["item", "type"]);
const emit = defineEmits(["click-action"]);

function toggleSaved() {
  emit("click-action", ClickType.save, props.item);
}

function toggleRead() {
  emit("click-action", ClickType.read, props.item);
}

function getSource() {
  const source =
    props.type === "f"
      ? props.item.author || props.item.feed?.title
      : props.item.feed?.title;
  return `${source}`;
}
</script>

<style scoped>
.readly {
  opacity: 0.8;
}
.readly .title {
  font-weight: 300;
}
.hover-bg:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.v-list-item-title,
.v-list-item-subtitle {
  white-space: nowrap;
  overflow: hidden;
}

.buttons {
  display: none;
}
.text-item {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
}
.hover-bg:hover .buttons {
  display: block;
}
.hover-bg:hover .sub-text {
  display: none;
}

.v-list-item-title {
  flex: 1;
  min-width: 0;
}
.v-list-item--density-default {
  min-height: 48px;
}

.title {
  font-weight: bold;
}
</style>
