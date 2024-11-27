<template>
  <div class="play-list-warp">
    <div>
      <div class="podcat-reader">
        <div class="warp">
          <div class="glass">
            <MPlayer
              v-model="store.currentPlaying"
              @onplay="store.setPlaying"
              ref="playerRef"
            ></MPlayer>
          </div>
        </div>
      </div>
    </div>
    <v-list>
      <v-list-subheader>播放列表</v-list-subheader>
    </v-list>
    <div class="play-list">
      <v-list :items="store.playlist" lines="two">
        <template v-for="item in store.playlist" :key="item.id">
          <v-list-item
            @click="store.play(item)"
            :active="store.currentPlaying?.id === item.id"
          >
            <template #prepend>
              <v-avatar :image="item.thumbil || ''"></v-avatar>
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ item.subtitle }}</v-list-item-subtitle>
            <template #append>
              <v-btn
                size="small"
                color="grey-lighten-1"
                icon="mdi-delete"
                variant="text"
                @click.stop="store.remove(item.id)"
              ></v-btn>
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
  store.setTogglePlaying(playerRef.value.togglePlay);
});
</script>

<style scoped>
.play-list {
  overflow: scroll;
  height: calc(100vh - 540px);
  margin-left: 0.5rem;
}
.podcat-reader {
  width: 100%;
  position: sticky;
  padding: 1rem;
  height: 480px;
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
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .v-card {
    margin: 0 auto;
    background-color: transparent;
  }
}
</style>
