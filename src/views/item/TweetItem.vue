<template>
  <v-list-item class="tweet-item py-3" v-bind="$attrs">
    <div class="tweet" :class="{ readly: item.isRead }">
      <div class="tweet-left">
        <img :src="item.feed?.icon" alt="" />
        <v-icon :color="item.isRead ? '-' : 'primary'">
          {{ item.isRead ? "" : "mdi-circle-medium" }}
        </v-icon>
      </div>
      <div class="tweet-content">
        <div class="tweet-header mb-1">
          <router-link :to="'/f/' + item.feedId" @click.stop="" class="text-body-2 font-weight-bold">
            {{ item.feed ? item.feed.title : '-' }}
          </router-link>
          <span class="text-body-2 text-medium-emphasis ml-2">
            {{ getHandle() }}
          </span>
          <span class="text-body-2 text-medium-emphasis ml-2">&middot;</span>
          <span class="text-body-2 text-medium-emphasis ml-2">
            {{ item.datestr }}
          </span>
        </div>
        <div class="tweet-body">
          <p class="mb-2 text-body-1 title">
            {{ item.title }}
          </p>
          <p class="text-medium-emphasis text-body-2 summary">
            {{ item.summary }}
          </p>
          <div v-if="hasMedia" class="tweet-media mt-2" :class="`media-count-${imageCount}`">
            <template v-if="isVideoOrPodcast">
              <v-img :src="item.thumbnail || item.feed?.icon" class="media-preview video-preview" cover>
                <div class="play-icon-wrapper">
                  <div class="play-icon">
                    <v-icon size="24">mdi-play</v-icon>
                  </div>
                </div>
                <div class="play-duration">
                  {{ formatDuration(item.duration) }}
                </div>
              </v-img>
            </template>
            <template v-else-if="item.images && item.images.length > 0">
              <v-img v-for="(image, index) in item.images.slice(0, 4)" :key="index" :src="image" class="media-preview"
                cover></v-img>
            </template>
            <template v-else-if="item.thumbnail">
              <v-img :src="item.thumbnail" class="media-preview" cover></v-img>
            </template>
          </div>
        </div>
      </div>
    </div>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps(["item", "type"]);

function getSource() {
  return props.item.author || props.item.feed?.title;
}
function getHandle() {
  return props.item.feed?.description || getSource() ? '@' + getSource().toLowerCase().replace(/\s/g, '') : '';
}
function formatDuration(seconds: number) {
  if (!seconds) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}
const isVideoOrPodcast = computed(() => {
  return props.item.type === "VIDEO" || props.item.type === "PODCAST";
});
const imageCount = computed(() => {
  const images = props.item.images || [];
  return Math.min(images.length, 4);
});
const hasMedia = computed(() => {
  return isVideoOrPodcast.value || imageCount.value > 0;
});
</script>

<style lang="scss" scoped>
.tweet-item {
  padding-left: 1rem;
  padding-right: 1rem;
  margin-bottom: 1rem;
  border-radius: 1rem !important;
}

.tweet {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 600px;
  /* 添加最大宽度 */
  margin: 0 auto;
  /* 居中 */
}

.tweet-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  .v-icon {
    margin-top: 0.5rem;
    // font-size: 1rem;
  }

  img {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }
}

.tweet-content {
  flex-grow: 1;

  .tweet-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .title {
    font-weight: 500;
  }

  .summary {
    display: -webkit-box;
    -webkit-line-clamp: 10;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tweet-media {
    display: grid;
    gap: 0.5rem;
    border-radius: 1rem;
    overflow: hidden;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(auto-fill, minmax(150px, 1fr));
    border: 1.5px solid rgb(var(--v-theme-on-surface-variant));

    .media-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: relative;
      aspect-ratio: 1 / 1; // Make images square
    }

    &.media-count-1 {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;

      .media-preview {
        height: auto;
        aspect-ratio: 16 / 9; // A single image can be wider
      }
    }

    &.media-count-3 {
      .media-preview:first-child {
        grid-column: span 2;
        aspect-ratio: 16 / 9; // First image is wider
      }
    }

    .video-preview {
      .play-icon-wrapper {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        .play-icon {
          color: white;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 50%;
          padding: 0.5rem;
        }
      }

      .play-duration {
        position: absolute;
        bottom: 8px;
        right: 8px;
        color: white;
        background: rgba(0, 0, 0, 0.7);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.8rem;
      }
    }
  }
}

.readly {
  .title {
    color: rgba(var(--v-theme-on-surface), 0.7);
  }

  .text-medium-emphasis {
    opacity: 0.6;
  }
}

a {
  text-decoration: none;
  color: rgb(var(--v-theme-on-surface));

  &:hover {
    text-decoration: underline;
  }
}

.text-medium-emphasis {
  opacity: 0.8;
}
</style>