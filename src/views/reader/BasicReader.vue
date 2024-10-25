<template>
  <div class="ovf" ref="readerRef">
    <div class="px-1">
      <div class="top-sider">
        <div>
          <div class="title">
            <a :href="item.link" :title="item.title">{{ item.title }}</a>
          </div>
          <small class="text-caption">
            {{ getSubtitle() }}
          </small>
        </div>
        <div>
          <!-- <v-btn disabled variant="text" :icon="item.isRead ? 'mdi-radiobox-blank' : 'mdi-radiobox-marked'" title="阅读">
          </v-btn> -->

          <v-btn variant="text" icon title="稍后阅读" @click="toggleSaved">
            <v-icon>{{
              item.isSaved ? "mdi-playlist-minus" : "mdi-playlist-plus"
            }}</v-icon>
          </v-btn>
          <v-btn disabled variant="text" icon title="加载网页原文">
            <v-icon> mdi-book-open-outline</v-icon>
          </v-btn>
          <v-btn disabled variant="text" icon title="调整字体">
            <v-icon> mdi-format-size</v-icon>
          </v-btn>
          <v-btn variant="text" icon title="打开原网站" :href="item.link">
            <v-icon> mdi-open-in-new</v-icon>
          </v-btn>
        </div>
      </div>
      <v-container>
        <slot>
          <div class="toc-list" ref="tocRef"></div>
          <div id="content" class="content" v-html="item.html"></div>
        </slot>
      </v-container>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAppStore } from "@/store";
import { Marked } from "@/service";
import { FeedItem } from "@/service/types";

import { useSideChapter } from "@/utils/useSideChapter";

const readerRef = ref();
const tocRef = ref();

const props = defineProps<{
  item: FeedItem;
}>();

useSideChapter(props.item.description, readerRef, {
  value: () => document.getElementById("chapters"),
});

const store = useAppStore();
onMounted(async () => {
  if (!props.item.isRead) {
    store.read(Number(props.item.id), Marked.ITEM);
  }
});

function toggleSaved() {
  if (props.item.isSaved) {
    store.unsave(props.item.id);
  } else {
    store.save(props.item.id);
  }
}

function getSubtitle() {
  const source = props.item.author + " - " + props.item.feed?.title;
  return `${source} | ${props.item.datestr}`;
}
</script>
<style lang="scss" scoped>
.ovf {
  height: 100vh;
  overflow-y: auto;
}

.top-sider {
  position: sticky !important;
  top: 0;
  z-index: 10;
  background-color: rgb(var(--v-theme-background));
  display: grid;
  grid-template-columns: 1fr 195px;
  // justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.3rem;
  > *:first-child {
    margin-left: 1rem;
  }
  > *:last-child {
    min-width: 195px;
  }
  a {
    text-decoration: none;
    color: rgb(var(--v-border-color));
  }
}

.text-overflow {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.title {
  font-size: 20px;
  // line-height: 48px;
}
.content {
  max-width: 1024px;
  margin: 0 auto;
}
</style>
<style>
.content {
  padding: 0.5rem;
  line-height: 2rem;

  * {
    max-width: 100%;
  }
}
pre {
  margin-top: 1rem;
  margin-bottom: 1rem;
  background-color: rgba(var(--v-theme-on-code), 0.9);
  color: rgb(var(--v-theme-code));
  padding: 1rem;
  border-radius: 0.5rem;
}
</style>
