<template>
  <!-- reader -->
  <v-scale-transition>
    <div class="cover" v-if="show && currentItem.title">
      <div class="cover-action">
        <v-btn size="small" variant="text" icon="mdi-close" @click="show = false" title="关闭"></v-btn>
        <!-- <v-btn size="small" color="surface-variant" icon="mdi-chevron-up" title="上一篇文章"></v-btn>
        <v-btn size="small" color="surface-variant" icon="mdi-chevron-down" title="下一篇文章"></v-btn> -->
      </div>
      <v-container class="pa-0 pl-16">
        <image-reader :item="currentItem" v-if="currentItem.type == 'IMAGE'" />
        <basic-reader :item="currentItem" v-else-if="currentItem.type == 'BASIC'" />
        <podcast-reader v-else-if="currentItem.type == 'PODCAST'" />
        <video-reader v-else />
      </v-container>
    </div>
  </v-scale-transition>
  <!-- items -->
  <div class="main-warp">
    <v-container class="top-sider">
      <v-toolbar>
        <div class="v-toolbar-title v-app-bar-title">{{ store.nav&&store.nav.title||'未分类' }}</div>
        <!-- <v-spacer></v-spacer> -->
        <v-btn :icon="onlyUnread ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'" :title="onlyUnread?'只看未读':'看全部'"
          @click="onlyUnread = !onlyUnread">
        </v-btn>
        <v-btn :disabled="id=='-1'&&type=='c'" icon title="标记为已读" @click="markRead">
          <v-icon> mdi-checkbox-multiple-marked-circle-outline</v-icon>
        </v-btn>

        <v-btn icon title="刷新" @click="refresh"  :class="{ 'rotating': loading }">
          <v-icon>mdi-reload</v-icon>
        </v-btn>
      </v-toolbar>
    </v-container>

    <v-container class="mx-auto items-warp">
      <v-row>
        <v-col v-for="item in store.items"  xl="2" lg="3" sm="4" xs="6" :key="item.id">
          <Item :item="item" @click="openReader(item)" :type="type"></Item>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import BasicReader from "./reader/BasicReader.vue";
import ImageReader from "./reader/ImageReader.vue";
import VideoReader from "./reader/VideoReader.vue";
import PodcastReader from "./reader/PodcastReader.vue";
import Item from "./item/Item.vue";
import { onMounted, watch } from "vue";
import { LsItemType ,Marked} from "@/service";
const props = defineProps(["type", "id"]);
import { useItemsStore, useAppStore } from "@/store";

const store = useItemsStore();
const app = useAppStore()
const currentItem = ref({ title: "" ,id:0, type:undefined});
const onlyUnread = ref(false)
const loading = ref(false)
onMounted(initData);

async function loadData(
  id: any,
  type: LsItemType,
  page: number = 0,
  onlyUnread: boolean = false
) {
  store.loadData(id, type, page, onlyUnread);
}

function initData() {

  show.value=false
  if (props.type == "f") {
    loadData(Number(props.id), LsItemType.FEED, 0, onlyUnread.value);
  } else if (props.type == "c") {
    loadData(Number(props.id), LsItemType.GROUP, 0, onlyUnread.value);
  }else if (props.type == "next") {
    loadData(null, LsItemType.SAVED, 0, onlyUnread.value);
  }else if (props.type == "all") {
    loadData(null, LsItemType.ALL, 0, onlyUnread.value);
  }
}

async function refresh() {
  loading.value=true
  await app.sync()
  await initData()
  loading.value=false
}

async function markRead() {
  await app.read(Number(props.id), props.type == "f" ? Marked.FEED : Marked.GROUP)
}
function openReader(item){
  show.value = true
  currentItem.value = item
}
watch(props, initData);
watch(onlyUnread, initData)
const show = ref(false);
</script>
<style lang="scss" scoped>
.items-warp {
  position: relative;
}

.cover {
  position: sticky;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 100;

  .cover-action {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    padding: 1rem;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 2rem;
  }
}


@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotating .v-icon {
  animation: rotate 1s linear infinite;
}
</style>
<style>
.top-sider {
  position: sticky !important;
  top: 0;
  z-index: 10;
  padding: 0;
}

.main-warp {
  height: 100vh;
  overflow-y: auto;
}

.v-toolbar {
  background-color: rgb(var(--v-theme-background)) !important;
}
</style>
