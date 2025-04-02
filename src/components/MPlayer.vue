<template>
  <div class="play">
    <v-img
      :src="modelValue?.thumbil"
      cover
      max-height="160px"
      max-width="160px"
      class="d-flex align-center mx-auto"
      :class="{ 'spinner-2': isPlaying }"
      style="border-radius: 50%"
    >
    </v-img>

    <v-card-text>
      <p class="text-body-1" v-text="modelValue?.title"></p>
      <p
        class="text-center text-subtitle-2 my-2"
        v-text="modelValue?.subtitle"
      ></p>
      <audio
        ref="audio"
        @timeupdate="updateProgress"
        @loadedmetadata="setDuration"
        @ended="onEnded"
        :src="modelValue?.url || ''"
        controls
        hidden
      ></audio>

      <v-slider
        v-model="currentTime"
        :max="duration"
        @update:modelValue="seek"
        hide-details
      ></v-slider>
      <div class="d-flex align-center justify-space-between">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
      <div class="d-flex justify-center mt-3">
        <v-btn
          @click="togglePlay"
          :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
          color="primary"
        >
        </v-btn>
      </div>
    </v-card-text>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, watch, onMounted } from "vue";
import { Audio } from "@/store/playlist";

const props = defineProps<{
  modelValue: Audio | null;
}>();

const emit = defineEmits(["update:modelValue", "onplay"]);

const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const audio = ref<HTMLAudioElement | null>(null);

watch(
  () => props.modelValue?.url,
  (newUrl) => {
    isPlaying.value = false;
    currentTime.value = props.modelValue?.currentTime || 0;
    updateMediaSessionMetadata(); // 更新媒体元数据
  }
);

watch(
  () => props.modelValue?.currentTime,
  (v) => {
    if ((v || 0) - currentTime.value > 3 || (v || 0) - currentTime.value < -3) {
      currentTime.value = v || 0;
      seek();
    }
  }
);

onMounted(() => {
  if (audio.value) {
    audio.value.currentTime = props.modelValue?.currentTime || 0;
    currentTime.value = audio.value.currentTime;
    setupMediaSession(); // 初始化 Media Session
  }
});

// 初始化 Media Session
const setupMediaSession = () => {
  if ("mediaSession" in navigator && audio.value) {
    // 设置媒体控制操作
    navigator.mediaSession.setActionHandler("play", () => {
      togglePlay();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      togglePlay();
    });

    navigator.mediaSession.setActionHandler("stop", () => {
      if (audio.value) {
        audio.value.pause();
        audio.value.currentTime = 0;
        isPlaying.value = false;
        emit("onplay", false);
      }
    });

    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (audio.value && details.seekTime !== undefined) {
        currentTime.value = details.seekTime;
        seek();
      }
    });

    // 更新播放状态
    audio.value.addEventListener("play", () => {
      navigator.mediaSession.playbackState = "playing";
    });

    audio.value.addEventListener("pause", () => {
      navigator.mediaSession.playbackState = "paused";
    });

    updateMediaSessionMetadata(); // 初始加载时设置元数据
  }
};

// 更新 Media Session 元数据
const updateMediaSessionMetadata = () => {
  if ("mediaSession" in navigator && props.modelValue) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: props.modelValue.title || "未知标题",
      artist: props.modelValue.subtitle || "未知艺术家",
      artwork: [
        {
          src: props.modelValue.thumbil || "",
          sizes: "160x160",
          type: "image/jpeg",
        },
      ],
    });
  }
};

const togglePlay = () => {
  if (audio.value) {
    if (isPlaying.value) {
      audio.value.pause();
    } else {
      audio.value.play();
    }
    isPlaying.value = !isPlaying.value;
    emit("onplay", isPlaying.value);
  }
};

const updateProgress = () => {
  if (audio.value) {
    currentTime.value = audio.value.currentTime;
    const item = { ...props.modelValue, currentTime: currentTime.value };
    emit("update:modelValue", item);
  }
};

const setDuration = () => {
  if (audio.value) {
    duration.value = audio.value.duration;
  }
};

const seek = () => {
  if (audio.value) {
    audio.value.currentTime = currentTime.value;
    const item = { ...props.modelValue, currentTime: currentTime.value };
    emit("update:modelValue", item);
  }
};

const onEnded = () => {
  isPlaying.value = false;
  emit("onplay", false);
};

const formatTime = (value: number) => {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

defineExpose({ togglePlay });
</script>

<style lang="css" scoped>
.play {
  width: 100%;
}
</style>
