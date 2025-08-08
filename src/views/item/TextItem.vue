<template>
  <v-list-item :class="{ readly: item.isRead }" class="rounded hover-bg ">
    <div class="text-item-warp">
      <div class="text-item">
        <v-icon :color="item.isRead ? 'grey' : 'primary'">
          {{ item.isRead ? "" : "mdi-circle-medium" }}
        </v-icon>
        <div class="text-truncate">
          <span class="mr-2 text-body-1 title" v-text="item.title"></span>
          <span class="text-body-2 text-medium-emphasis" v-text="item.summary">
          </span>
        </div>
        <div class="d-flex align-center ">
          <m-avatar class="noclick mr-2 rounded " :src="item.feed?.icon" :name="item.feed?.title" />
          <small class="text-truncate  text-medium-emphasis " v-text="getSource()"></small>
        </div>
      </div>
      <span class="sub-text text-caption ml-2 flex-shrink-0" v-text="item.datestr">
      </span>
      <div class="buttons">
        <v-btn size="small" height="24" width="24" icon="mdi-open-in-new" variant="text" title="打开原文" class="mr-2"
          :href="item.link"></v-btn>
        <v-btn size="small" variant="text" height="24" width="24" icon title="稍后阅读" @click.stop="toggleSaved">
          <v-icon>{{
            item.isSaved ? "mdi-playlist-minus" : "mdi-playlist-plus"
            }}</v-icon>
        </v-btn>
      </div>
    </div>


  </v-list-item>
</template>

<script setup lang="ts">
import { ClickType } from "./types";
const props = defineProps(["item", "type"]);
const emit = defineEmits(["click-action"]);

function toggleSaved() {
  emit("click-action", ClickType.save, props.item);
}

// function toggleRead() {
//   emit("click-action", ClickType.read, props.item);
// }

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
  opacity: 0.6;
}

.readly .title {
  font-weight: none;
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
  grid-template-columns: 1rem 1fr 8rem;
  gap: 1rem;
}

.hover-bg:hover .buttons {
  display: block;
}

.hover-bg:hover .sub-text {
  display: none;
}

.text-item-warp {
  display: grid;
  grid-template-columns: 1fr 5rem;
  align-items: center;
  gap: 1rem;
}

.title {
  font-weight: 500;
}

@media (max-width: 768px) {
  .text-item {
    grid-template-columns: 1rem 1fr 1rem;
  }
}
</style>
