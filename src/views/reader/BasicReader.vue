<template>
  <v-card flat height="100vh" class="ovf">
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
          <div class="content" v-html="item.description"></div>
        </slot>
      </v-container>
    </div>
  </v-card>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { useAppStore } from "@/store";
import { Marked } from "@/service";
import { FeedItem } from "@/service/types";

const props = defineProps<{
  item: FeedItem;
}>();

const store = useAppStore();
onMounted(() => {
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
  overflow-y: auto;
}

.top-sider {
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
</style>
<style>
.content {
  padding: 0.5rem;

  * {
    max-width: 100%;
  }
}
</style>
