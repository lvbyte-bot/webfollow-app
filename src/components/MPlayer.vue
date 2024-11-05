src/components/MPlayer.vue
<template>
  <v-card flat maxWidth="300px">
    <v-img :src="imgSrc" class="d-flex align-center">
      <div class="d-flex justify-center">
        <!-- 播放暂停按钮 -->
        <v-btn @click="togglePlay" :icon="isPlaying ? 'mdi-pause' : 'mdi-play'">
        </v-btn>
      </div>
    </v-img>
    <v-card-title :title="title"> {{ title }}</v-card-title>
    <v-card-subtitle class="text-center">{{ subtitle }}</v-card-subtitle>
    <v-card-text>
      <audio
        ref="audio"
        @timeupdate="updateProgress"
        @loadedmetadata="setDuration"
        @ended="onEnded"
        :src="src"
      ></audio>

      <p class="mt-3 text-center">
        当前时间: {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </p>
      <!-- 播放进度条 -->
      <v-slider
        v-model="currentTime"
        :max="duration"
        @update:modelValue="seek"
      ></v-slider>
      <p class="text-center">
        音量: <span>{{ (volume * 100).toFixed(0) }}%</span>
      </p>

      <!-- 音量控制 -->
      <v-slider
        v-model="volume"
        min="0"
        max="1"
        step="0.01"
        @update:modelValue="changeVolume"
      ></v-slider>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from "vue";

const props = defineProps<{
  src: string;
  imgSrc: string;
  title: string;
  subtitle: string;
}>();

const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.8); // 音量从 0 到 1
const audio = ref<HTMLAudioElement | null>(null);

watch(
  () => props.src,
  () => {
    isPlaying.value = false;
    currentTime.value = 0;
  }
);

const togglePlay = () => {
  if (audio.value) {
    if (isPlaying.value) {
      audio.value.pause();
    } else {
      audio.value.play();
    }
    isPlaying.value = !isPlaying.value;
  }
};

const updateProgress = () => {
  if (audio.value) {
    currentTime.value = audio.value.currentTime;
  }
};

const setDuration = () => {
  if (audio.value) {
    duration.value = audio.value.duration;
  }
};

const seek = () => {
  console.log(currentTime.value);
  if (audio.value) {
    audio.value.currentTime = currentTime.value;
  }
};

const changeVolume = () => {
  if (audio.value) {
    audio.value.volume = volume.value;
  }
};

const onEnded = () => {
  isPlaying.value = false;
};

const formatTime = (value: number) => {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};
</script>
