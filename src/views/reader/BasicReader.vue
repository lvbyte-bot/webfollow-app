<template>
  <div class="ovf" ref="readerRef">
    <div class="px-1">
      <div class="top-sider">
        <div class="ml-12">
          <v-expand-x-transition>
            <v-card-title
              style="max-width: 40vw"
              class="text-truncate"
              v-if="scrollTop > 120 && !mobile"
              >{{ item.title }} | <small v-text="getSource()"></small>
            </v-card-title>
          </v-expand-x-transition>
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
          <v-btn
            variant="text"
            icon
            :title="item.feed?.title"
            :to="'/f/' + item?.feed?.id"
          >
          <img :src=" item?.feed?.icon" onerror="this.src='/logo.svg'" width="18">
          </img>
          </v-btn>
          <v-btn variant="text" icon title="打开原网站" :href="item.link">
            <v-icon> mdi-open-in-new</v-icon>
          </v-btn>
        </div>
      </div>
      <v-container>
        <slot>
          <div class="title">
            <v-list-item
              :href="item.link"
              :title="item.title"
              :subtitle="getSubtitle()"
            ></v-list-item>
          </div>
          <div class="toc-list" ref="tocRef"></div>
          <div id="content" class="content" v-html="item.html"></div>
        </slot>
      </v-container>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, watch,ref } from "vue";
import { useAppStore } from "@/store";
import { Marked } from "@/service";
import { FeedItem } from "@/service/types";

import { useSideChapter } from "@/utils/useSideChapter";
import { useScroll } from "@/utils/scroll";
import { useDisplay } from "vuetify";

const readerRef = ref();

const props = defineProps<{
  item: FeedItem ;
}>();
const { scrollTop } = useScroll(readerRef);
const { mobile } = useDisplay();
const description = computed(()=>props.item.description)

useSideChapter(description, readerRef, {
  value: () => document.getElementById("chapters"),
});

watch(description,()=>{
  setTimeout(() => {
    readerRef.value.scrollTop=0
  }, 100);
})

const appStore = useAppStore();

onMounted(async () => {
  if (!props.item.isRead) {
    appStore.read(Number(props.item.id), Marked.ITEM);
  }
});

function toggleSaved() {
  if (props.item.isSaved) {
    appStore.unsave(props.item.id);
  } else {
    appStore.save(props.item.id);
  }
}

function getSubtitle() {
  const options: any = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24小时制
  };
  const formattedDate = new Date(props.item.pubDate * 1000).toLocaleString(
    "zh-CN",
    options
  );
  return `${getSource()} | ${formattedDate}`;
}
function getSource() {
  return props.item.author + " - " + props.item.feed?.title;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.3rem;
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
  margin-bottom: 1rem;
}
:deep(.title) .v-list-item-title {
  font-size: 18px;
  margin-bottom: 1rem;
}
.v-list-item {
  padding: 1.5rem;
  max-width: 760px;
  margin: 0 auto;
}
.content {
  max-width: 730px;
  margin: 0 auto;
}
</style>
<style>
.content {
  padding: 0.5rem;
  line-height: 3rem;
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
