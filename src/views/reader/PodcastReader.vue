<template>
  <v-card flat height="100vh">
    <div class="grid">
      <div class="podcat-reader">
        <div class="warp">
          <div class="glass">
            <MPlayer
              v-if="item.enclosure"
              :src="item.enclosure"
              :img-src="item.thumbnail || ''"
              :title="item.title"
              :subtitle="item.feed?.title || ''"
            ></MPlayer>
          </div>
        </div>
      </div>
      <div class="ovf">
        <basic-reader :item="item"></basic-reader>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
import BasicReader from "./BasicReader.vue";
import MPlayer from "@/components/MPlayer.vue";
import { FeedItem } from "@/service/types";
defineProps<{
  item: FeedItem;
}>();
</script>

<style scoped>
.grid {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(20vw, 1fr) 2fr;
}
.podcat-reader {
  padding: 1rem;
  &:first-child {
    margin-top: 64px;
  }
  .warp {
    height: 100%;
    border-radius: 1rem;
    background: linear-gradient(
      to right bottom,
      rgb(95, 234, 131),
      rgb(65, 184, 131)
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
</style>
