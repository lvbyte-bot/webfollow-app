<template>
  <v-list-item class="content-item py-3">
    <div class="content">
      <v-icon :color="item.isRead ? '-' : 'primary'">
        {{ item.isRead ? "" : "mdi-circle-medium" }}
      </v-icon>

      <div class="content-wrapper">
        <!-- 主要内容区域 -->
        <div class="content-main">
          <div
            class="content-body"
            :class="{ 'with-side-media': isSingleImage || isVideoOrPodcast }"
          >
            <div class="desc">
              <p class="mb-2 title">{{ item.title }}</p>
            </div>
            <!-- 视频/播客预览 -->
            <div v-if="isVideoOrPodcast" class="video-preview">
              <v-img
                :src="item.thumbnail"
                cover
                min-width="280px"
                min-height="100px"
                max-height="150px"
                class="rounded-lg"
              >
                <div class="play-icon-wrapper">
                  <v-icon size="40">mdi-play</v-icon>
                </div>
                <div class="video-duration">
                  {{ formatDuration(item.duration) }}
                </div>
              </v-img>
            </div>
            <!-- 单图预览 -->
            <div v-else-if="isSingleImage" class="single-image">
              <v-img
                :src="item.thumbnail || item.images[0]"
                cover
                height="150px"
                min-width="230px"
                class="rounded-lg"
              ></v-img>
            </div>
          </div>

          <!-- 其他媒体内容区域 -->
          <div v-if="hasMedia && !isVideoOrPodcast" class="media-content">
            <!-- 多图片预览 -->
            <div v-if="item.images?.length" class="images-preview">
              <div
                class="images-grid"
                :class="getImageGridClass(item.images.length)"
              >
                <v-img
                  v-for="(image, index) in getDisplayImages(item.images)"
                  :key="index"
                  :src="image"
                  cover
                  :aspect-ratio="1"
                  class="image-item rounded-lg"
                >
                  <div
                    v-if="index === 5 && item.images.length > 6"
                    class="more-images"
                  >
                    +{{ item.images.length - 6 }}
                  </div>
                </v-img>
              </div>
            </div>

            <!-- 单图预览 -->
            <div v-else-if="item.thumbnail" class="image-preview">
              <v-img
                :src="item.thumbnail"
                cover
                height="200px"
                class="rounded-lg"
              ></v-img>
            </div>
          </div>

          <!-- 底部信息 -->
          <div class="content-footer">
            <div class="text-body-2 text-medium-emphasis footer-info">
              <router-link :to="'/f/' + item.feedId" @click.stop="">
                {{ getSource() }}
              </router-link>
              <span class="dot-separator">·</span>
              <span>{{ item.datestr }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    default: "f",
  },
});

const isSingleImage = computed(() => {
  return (
    (props.item.thumbnail &&
      !props.item.images?.length &&
      props.item.type !== "VIDEO") ||
    props.item.images?.length === 1
  );
});

const isVideoOrPodcast = computed(() => {
  return props.item.type === "VIDEO" || props.item.type === "PODCAST";
});

const hasMedia = computed(() => {
  return (
    (props.item.thumbnail && !isSingleImage.value && !isVideoOrPodcast.value) ||
    (props.item.images?.length > 0 && !isSingleImage.value)
  );
});

function getSource() {
  return props.type === "f"
    ? props.item.author || props.item.feed?.title
    : props.item.feed?.title;
}

function formatDuration(seconds: number) {
  if (!seconds) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function getImageGridClass(count: number) {
  if (count === 1) return "single";
  if (count === 2) return "two";
  if (count === 3) return "three";
  return count <= 6 ? "grid-" + count : "grid-6";
}

function getDisplayImages(images: string[]) {
  return images.slice(0, 6);
}
</script>

<style lang="scss" scoped>
.content-item {
  padding-left: 5px;
  padding-right: 10px;
}

.content {
  display: grid;
  grid-template-columns: 1rem auto;
  align-items: start;
  grid-gap: 1rem;
  width: 100%;
}

.content-footer {
  margin-top: 0.5rem;
  padding: 0 4px;

  .footer-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .dot-separator {
      color: rgb(var(--v-theme-surface-variant));
    }
  }
}

.content-main {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 0.5rem;
}

.desc {
  .title {
    // font-weight: bold;
    // font-size: 1.1rem;
    line-height: 1.4;
    padding: 0 4px;
  }
}

.images-preview {
  width: 100%;

  .images-grid {
    display: grid;
    gap: 4px;
    width: 100%;

    &.single {
      grid-template-columns: 1fr;
      max-width: 600px;
      margin: 0 auto;

      .image-item {
        height: 200px;
      }
    }

    &.two {
      grid-template-columns: repeat(2, minmax(120px, 1fr));
      max-width: 520px;
    }

    &.three {
      grid-template-columns: repeat(3, minmax(120px, 1fr));
      max-width: 780px;
    }

    &.grid-4 {
      grid-template-columns: repeat(4, minmax(120px, 1fr));
      max-width: 1040px;
    }

    &.grid-5 {
      grid-template-columns: repeat(5, minmax(120px, 1fr));
      max-width: 1200px;
    }

    &.grid-6 {
      grid-template-columns: repeat(6, minmax(120px, 1fr));
    }

    .image-item {
      position: relative;
      border-radius: 4px;
      overflow: hidden;
      height: 150px;

      .more-images {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        font-weight: bold;
      }
    }
  }
}

.video-preview {
  overflow: hidden;
  background-color: rgba(var(--v-theme-surface-variant), 0.6);
  .play-icon-wrapper {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .v-icon {
      color: rgba(var(--v-theme-background), 0.9);
    }
  }

  .video-duration {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
  }
}

a {
  text-decoration: none;
  color: rgb(var(--v-theme-surface-variant));
  &:hover {
    text-decoration: underline;
  }
}

.content-body {
  display: grid;
  grid-template-columns: 1fr minmax(0, auto);
  grid-gap: 1rem;
  &.with-single-image {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-gap: 1rem;
    // align-items: center;
    padding: 0 4px;
  }
}

.single-image,
.video-preview {
  border-radius: 4px;
  overflow: hidden;
}
</style>
