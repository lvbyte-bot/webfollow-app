<template>
  <v-list-item class="content-item py-3 mb-2">
    <div class="content">
      <v-icon :color="item.isRead ? '-' : 'primary'">
        {{ item.isRead ? "" : "mdi-circle-medium" }}
      </v-icon>

      <div class="content-wrapper">
        <!-- 主要内容区域 -->
        <div class="content-main">
          <div
            class="content-body"
            :class="{
              'with-side-media': isSingleImage || isVideoOrPodcast,
              'with-not-side':
                (!isSingleImage && !isVideoOrPodcast) || !item.thumbnail,
              'with-media': isVideoOrPodcast,
            }"
          >
            <div class="desc">
              <p class="mb-1 title">{{ item.title }}</p>
            </div>
            <!-- 视频/播客预览 -->
            <div v-if="isVideoOrPodcast">
              <v-img
                :src="item.thumbnail"
                cover
                class="rounded image-item play-preview"
                :aspect-ratio="1.77"
              >
                <div class="play-icon-wrapper">
                  <div class="play-icon">
                    <v-icon size="20">mdi-play</v-icon>
                  </div>
                </div>
                <div class="play-duration">
                  {{ formatDuration(item.duration) }}
                </div>
              </v-img>
            </div>
            <!-- 单图预览 -->
            <div v-else-if="isSingleImage" class="single-image">
              <v-img
                :src="item.thumbnail || item.images[0]"
                cover
                :aspect-ratio="1.77"
                class="rounded image-item"
              ></v-img>
            </div>
          </div>

          <!-- 其他媒体内容区域 -->
          <div v-if="hasMedia && !isVideoOrPodcast" class="media-content">
            <!-- 多图片预览 -->
            <div v-if="item.images?.length" class="images-preview">
              <div class="images-grid grid-6">
                <v-img
                  v-for="(image, index) in getDisplayImages(item.images)"
                  :key="index"
                  :src="image"
                  cover
                  :aspect-ratio="1.77"
                  class="image-item rounded"
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
  grid-gap: 0.5rem;
  width: 100%;
  .v-icon {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
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
  grid-gap: 0.3rem;
}

.desc {
  .title {
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
      max-width: 150px;
      margin: 0 auto;

      .image-item {
        height: 100px;
      }
    }

    &.grid-6 {
      grid-template-columns: repeat(8, minmax(var(--img-min-width), 1fr));
    }

    .image-item {
      position: relative;
      border-radius: 4px;
      overflow: hidden;

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

.play-preview {
  overflow: hidden;
  background-color: rgba(var(--v-theme-surface-variant), 0.6);
  .play-icon-wrapper {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .play-icon {
      color: rgba(var(--v-theme-background), 0.9);
      background: rgba(var(--v-theme-surface-variant), 0.9);
      border-radius: 50%;
      padding: 0.5rem;
    }
  }

  .play-duration {
    position: absolute;
    bottom: 8px;
    right: 8px;
    color: rgba(var(--v-theme-background), 0.9);
    background: rgba(var(--v-theme-surface-variant), 0.7);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
    display: none;
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
  grid-template-columns: 7fr minmax(var(--img-min-width), 1fr);
  grid-gap: 1rem;
  &.with-single-image {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-gap: 1rem;
    // align-items: center;
    padding: 0 4px;
  }
}
.with-not-side,
.with-media {
  grid-template-columns: 1fr;
}
.single-image,
.video-preview {
  border-radius: 4px;
  overflow: hidden;
  min-height: 60px;
  max-height: 200px;
  max-width: 300px;
}
.image-item {
  min-height: 60px;
  max-height: 200px;
  max-width: 300px;
}
@media (max-width: 768px) {
  .images-preview .images-grid.grid-6 {
    grid-template-columns: repeat(3, minmax(var(--img-min-width), 1fr));
    gap: 0.5rem;
  }
  .content-body .play-preview {
    max-width: 100%;
  }
}
</style>
