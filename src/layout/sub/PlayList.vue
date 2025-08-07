<template>
  <div class="playlist-container">
    <div class="player-section"
      :style="{ backgroundImage: store.currentPlaying ? `url(${store.currentPlaying.thumbil})` : 'none' }">
      <div class="player-overlay">
        <div v-if="store.currentPlaying" class="player-wrapper">
          <MPlayer v-model="store.currentPlaying" @onplay="store.setPlaying" ref="playerRef"></MPlayer>
        </div>
        <div v-else class="empty-state-content">
          <v-icon size="64" color="white">mdi-headphones</v-icon>
          <div class="text-h6 mt-4">听你喜爱的内容</div>
        </div>
      </div>
    </div>
    <div class="player-list">
      <v-list lines="two">
        <v-list-subheader>播放列表</v-list-subheader>
        <v-divider></v-divider>
        <template v-for="item in store.playlist" :key="item.id">
          <v-list-item @click="store.play(item)" :active="store.currentPlaying?.id === item.id" color="primary">
            <template #prepend>
              <v-avatar rounded="lg" :image="item.thumbil || ''"></v-avatar>
            </template>
            <v-list-item-title class="font-weight-medium">{{ item.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ item.subtitle }}</v-list-item-subtitle>
            <template #append>
              <v-icon v-if="store.currentPlaying?.id === item.id && store.isPlaying"
                color="primary">mdi-volume-high</v-icon>
              <v-btn size="small" icon="mdi-delete-outline" variant="text" @click.stop="store.remove(item.id)"></v-btn>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </div>
  </div>
</template>

<script lang="ts" setup>
import MPlayer from "@/components/MPlayer.vue";
import { usePlayListStore } from "@/store/playlist";
import { ref, onMounted } from "vue";

const store = usePlayListStore();
const playerRef = ref();

onMounted(() => {
  if (playerRef.value) {
    store.setTogglePlaying(playerRef.value.togglePlay);
  }
});
</script>

<style scoped>
.playlist-container {
  flex-direction: column;
  height: 100%;
}

.player-section {
  position: relative;
  height: 380px;
  margin-bottom: 1rem;
  background-repeat: repeat;
  background-position: center;
  background-color: rgb(var(--v-theme-on-kbd));
}

.player-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(var(--v-theme-kbd), 0.6), rgba(var(--v-theme-background), 0.6));
  /* rgba(var(--v-theme-kbd), 0.4); */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 7.8rem 1rem 1rem;
}

.player-wrapper {
  width: 100%;
  padding: 1rem;
}

.empty-state-content {
  text-align: center;
  color: rgb(var(--v-theme-on-kbd));
}

.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.player-list {
  overflow: scroll;
  height: calc(100vh - 380px - 1rem);
  margin-left: 0.5rem;
}
</style>
