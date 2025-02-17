<template>
  <v-list-item class="magazine-item py-3" v-bind="$attrs">
    <div class="magazine" :class="{ readly: item.isRead }">
      <div class="magazine-left">
        <img :src="item.feed?.icon" alt="" />
        <v-icon :color="item.isRead ? '-' : 'primary'">
          {{ item.isRead ? "" : "mdi-circle-medium" }}
        </v-icon>
      </div>
      <div>
        <div class="magazine-info mb-2">
          <div class="text-body-2 text-truncate text-medium-emphasis">
            <router-link :to="'/f/' + item.feedId" @click.stop="">
              {{ getSource() }}</router-link
            >
          </div>
          <div class="text-body-2 text-medium-emphasis text-right">
            {{ item.datestr }}
          </div>
        </div>
        <div
          class="magazine-sec"
          :class="{ nomagazinethumb: !item.thumbnail && !isVideoOrPodcast }"
        >
          <div class="desc text-ellipsis">
            <p class="mb-2 text-body-1 title">
              {{ item.title }}
            </p>
            <p class="text-medium-emphasis text-body-2">
              {{ item.summary }}
            </p>
          </div>
          <div v-if="isVideoOrPodcast">
            <v-img
              :src="item.thumbnail || item.feed?.icon"
              class="play-preview"
              cover
              height="80px"
            >
              <template v-if="item.type == 'VIDEO' || item.type == 'PODCAST'">
                <div class="play-icon-wrapper">
                  <div class="play-icon">
                    <v-icon size="20">mdi-play</v-icon>
                  </div>
                </div>
                <div class="play-duration">
                  {{ formatDuration(item.duration) }}
                </div>
              </template>
            </v-img>
          </div>
          <v-img
            v-else-if="item.thumbnail"
            :src="item.thumbnail"
            cover
            height="80px"
          >
          </v-img>
        </div>
      </div>
    </div>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps(["item", "type"]);

function getSource() {
  const source =
    props.type === "f"
      ? props.item.author || props.item.feed?.title
      : props.item.feed?.title;
  return source;
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
</script>

<style lang="scss" scoped>
.magazine-item {
  padding-left: 5px;
  padding-right: 10px;
}
.magazine {
  display: grid;
  grid-template-columns: 1rem auto;
  align-items: center;
  grid-gap: 0.5rem;

  .magazine-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-self: flex-start;
    justify-content: space-between;
    .v-icon {
      margin-top: 1rem;
    }
    img {
      width: 14px;
      border-radius: 2px;
    }
  }
}
.readly {
  .title {
    opacity: 0.8;
  }
  .text-body-2 {
    opacity: 0.5;
  }
}
.magazine-info {
  display: grid;
  grid-template-columns: auto 6rem;
}
.magazine-sec {
  display: grid;
  grid-template-columns: 3fr minmax(80px, auto);
  grid-gap: 0.5rem;
  .v-img {
    border-radius: 0.5rem;
  }
}
.nomagazinethumb {
  grid-template-columns: 1fr;
}
.text-right {
  text-align: right;
}
.desc {
  --line-clamp: 4;
  width: 100%;
  align-self: flex-start;
  .title {
    font-weight: 500;
  }
}
a {
  text-decoration: none;
  color: rgb(var(--v-theme-surface-variant));
  &:hover {
    text-decoration: underline;
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
      padding: 0.3rem;
    }
  }

  .play-duration {
    position: absolute;
    bottom: 4px;
    right: 4px;
    color: rgba(var(--v-theme-background), 0.9);
    background: rgba(var(--v-theme-surface-variant), 0.7);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
    display: none;
  }
}
</style>
