<template>
  <div class="overflow" ref="readerRef">
      <div class="top-sider v-toolbar__content">
        <div class="bar-left">
          <slot name="prepend-bar"></slot>
        </div>
        <v-expand-x-transition>
          <v-card-title
            style="max-width: 730px;"
            class="text-truncate"
            v-if="scrollTop > 120 && !mobile"
            >{{ item.title }} | <small v-text="getSource()"></small>
          </v-card-title>
        </v-expand-x-transition>
        <div>
          <slot name="append-bar">
            <c-btn  variant="text" icon title="稍后阅读" @click="toggleSaved"  class="mr-2">
              <v-icon>{{
                item.isSaved ? "mdi-playlist-minus" : "mdi-playlist-plus"
              }}</v-icon>
            </c-btn>
            <c-btn
              variant="text"
              icon
              :title="item.feed?.title"
              :to="'/f/' + item?.feed?.id"
              class="mr-2"
            >
            <img class="noclick" :src=" item?.feed?.icon" onerror="this.src='/logo.svg'" style="width:18px">
            </img>
            </c-btn>
            <c-btn  variant="text" icon title="打开原网站" :href="item.link">
              <v-icon> mdi-open-in-new</v-icon>
            </c-btn>
          </slot>
        </div>
      </div>
      <v-container>
        <slot name="prepend"></slot>
        <slot>
        <image-reader :item="item" v-if="item?.type == 'IMAGE'" />
        <basic-reader
          v-else-if="item?.type == 'BASIC'"
          :item="item"
        />

        <podcast-reader
          :item="item"
          v-else-if="item?.type == 'PODCAST'"
        />
        <video-reader v-else-if="item.type == 'VIDEO'" />
        </slot>
      </v-container>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, watch,ref } from "vue";
import { useAppStore } from "@/store";
import { FeedItem } from "@/service/types";
import { useSideChapter } from "@/utils/useSideChapter";
import { useScroll } from "@/utils/scroll";
import { useDisplay } from "vuetify";
import BasicReader from "./BasicReader.vue";
import ImageReader from "./ImageReader.vue";
import VideoReader from "./VideoReader.vue";
import PodcastReader from "./PodcastReader.vue";

const readerRef = ref();

const props = defineProps<{
  item: FeedItem ;
}>();
const { scrollTop } = useScroll(readerRef);
const { mobile } = useDisplay();
const description = computed(()=>props.item?.description||'')

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
    appStore.read(Number(props.item.id));
  }
});

function toggleSaved() {
  if (props.item.isSaved) {
    appStore.unsave(props.item.id);
  } else {
    appStore.save(props.item.id);
  }
}

function getSource() {
  return props.item.author + " - " + props.item.feed?.title;
}
</script>
<style lang="scss" scoped>
.overflow {
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
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  height: 64px;
  > *:last-child {
    // min-width: 195px;
    min-width: 130px;
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
</style>