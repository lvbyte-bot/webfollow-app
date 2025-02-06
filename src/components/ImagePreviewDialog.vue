<script lang="ts" setup>
import { ref, watch } from "vue";
import { useSettingsStore } from "@/store";

const props = defineProps<{
  modelValue: boolean;
  imgSrc: string;
  images: string[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  navigate: [direction: "prev" | "next" | "goto" | number];
}>();

const settingsStore = useSettingsStore();

const showThumbnails = ref(false);

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      showThumbnails.value = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    fullscreen
    @update:model-value="emit('update:modelValue', $event)"
    :theme="settingsStore.appearance.themeMode"
  >
    <div class="preview-container" @click="showThumbnails = false">
      <v-img
        :src="imgSrc"
        max-height="calc(100vh - 3rem)"
        max-width="calc(100vw - 4rem)"
      />

      <!-- 导航按钮 -->
      <v-btn
        icon="mdi-chevron-left"
        class="nav-btn left"
        @click="emit('navigate', 'prev')"
      />
      <v-btn
        icon="mdi-chevron-right"
        class="nav-btn right"
        @click="emit('navigate', 'next')"
      />
      <v-btn
        icon=" mdi-image-filter-center-focus-strong-outline"
        class="nav-btn bottom"
        @click="emit('navigate', 'goto')"
        title="在文章中查看"
      >
      </v-btn>

      <!-- 顶部按钮组 -->
      <div class="top-buttons">
        <v-btn
          icon="mdi-image-multiple-outline"
          @click.stop="showThumbnails = !showThumbnails"
        />
        <v-btn icon="mdi-close" @click="emit('update:modelValue', false)" />
      </div>

      <!-- 缩略图面板 -->
      <div v-if="showThumbnails" class="thumbnails-panel" @click.stop="">
        <div class="thumbnails-container">
          <v-img
            v-for="(img, index) in images"
            :key="index"
            :src="img"
            class="rounded-lg thumbnail"
            :class="{ active: img === imgSrc }"
            @click="emit('navigate', index)"
            cover
          />
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<style scoped>
.preview-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.nav-btn {
  position: absolute;
}

.nav-btn.left {
  left: 1rem;
}

.nav-btn.right {
  right: 1rem;
}

.nav-btn.bottom {
  bottom: 1rem;
}

.top-buttons {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1rem;
}

.thumbnails-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
  border-top-right-radius: 0.5rem;
  border-top-left-radius: 0.5rem;
  background: rgba(var(--v-theme-background), 0.8);
}

.thumbnails-container {
  padding-bottom: 0.5rem;
  column-count: 5;
  column-gap: 1rem;
}

.thumbnail {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.2s ease;
  background-color: #f0f0f0;
  border: 2px solid #ccc;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem; /* 项目间距 */
  break-inside: avoid; /* 防止项目在列中断开 */
}

.thumbnail:hover {
  transform: scale(1.05);
  border-color: rgb(var(--v-theme-primary));
}

.thumbnail.active {
  border-color: rgb(var(--v-theme-primary));
}
</style>
