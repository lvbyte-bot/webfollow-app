<template>
  <div class="grid">
    <div>
      <div class="podcat-reader">
        <div class="warp">
          <div class="glass">
            <v-img
              :src="item.thumbnail"
              cover
              max-height="300px"
              max-width="300px"
              class="d-flex align-center mx-auto"
            >
              <div class="d-flex justify-center">
                <!-- 播放暂停按钮 -->
                <v-btn
                  @click="togglePlay"
                  :icon="curretIsPlaying ? 'mdi-pause' : 'mdi-play'"
                >
                </v-btn>
              </div>
            </v-img>
          </div>
        </div>
      </div>
    </div>
    <div>
      <basic-reader :item="item" :reader-ref="readerRef"></basic-reader>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BasicReader from "./BasicReader.vue";
import { FeedItem } from "@/service/types";
import { usePlayListStore } from "@/store/playlist";
import { computed, Ref } from "vue";

const props = defineProps<{
  readonly item: FeedItem;
  readonly readerRef: Ref<any, any>;
}>();
const store = usePlayListStore();

const curretIsPlaying = computed(() =>
  store.currentPlaying?.id == props.item.id ? store.isPlaying : false
);

function togglePlay() {
  const item = props.item;
  if (store.currentPlaying?.id == item.id) {
    store.togglePlaying();
  } else {
    store.play({
      id: item.id,
      url: item.enclosure,
      thumbil: item.thumbnail || "",
      title: item.title,
      subtitle: item.feed?.title || "",
      feedId: item.feedId,
      currentTime: 0,
    });
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: minmax(20vw, 1fr) 2fr;
}
.podcat-reader {
  width: 100%;
  position: sticky;
  top: calc(64px + 16px);
  padding: 1rem;
  .warp {
    height: calc(100vh - 64px - 4rem);
    border-radius: 1rem;
    background: linear-gradient(
      to right bottom,
      rgba(var(--v-theme-primary), 0.6),
      rgba(var(--v-theme-primary), 1)
    );
  }
  .glass {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 20px;
    color: white;
    font-size: 20px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 1rem;
    backdrop-filter: blur(10px); /* 模糊效果 */
    -webkit-backdrop-filter: blur(10px);
  }
  .v-card {
    margin: 0 auto;
    background-color: transparent;
  }
}
@media (max-width: 760px) {
  .grid {
    grid-template-columns: 1fr;
    .warp {
      height: 30vh;
    }
  }
}
</style>
