<template>
  <v-card flat class="rounded-lg card" v-bind="$attrs">
    <div
      v-if="item.thumbnail"
      @mouseover="showIframe = true"
      @mouseleave="showIframe = false"
      :style="{
        maxHeight:
          item.type == 'VIDEO' && !mobile ? imageHeight + 'px' : 'none',
      }"
      class="rounded-lg"
      :class="{
        'iframe-container': showIframe && item.type == 'VIDEO',
      }"
    >
      <template v-if="item.type == 'VIDEO' && showIframe">
        <iframe
          type="text/html"
          class="iframe"
          :src="videoUrl()"
          :style="{ height: imageHeight + 2 + 'px' }"
          frameborder="0"
          allow="fullscreen"
          mozallowfullscreen="mozallowfullscreen"
          msallowfullscreen="msallowfullscreen"
          oallowfullscreen="oallowfullscreen"
          webkitallowfullscreen="webkitallowfullscreen"
        ></iframe>
        <div
          class="video-warp"
          :style="{
            height: imageHeight + 'px',
          }"
        ></div>
      </template>
      <v-img
        v-else
        ref="imageRef"
        class="align-end text-white rounded-lg play-preview"
        :title="item.title"
        :aspect-ratio="
          mobile ? (item.enclosure ? 1.78 : 0.7) : item.enclosure ? 1.79 : 0
        "
        max-height="360px"
        min-height="80px"
        :cover="mobile || item.enclosure"
        :src="item.thumbnail"
      >
        <template v-if="item.type == 'VIDEO' || item.type == 'PODCAST'">
          <div class="play-duration">
            {{ formatDuration(item.duration) }}
          </div>
        </template>
      </v-img>
    </div>
    <p
      v-else
      v-text="item.summary"
      :style="{ '--line-clamp': mobile ? 12 : 7 }"
      class="text-ellipsis text-body-2 px-5 py-4 text-grey border rounded-lg summary-warp"
    ></p>
    <div class="mt-2 mx-2">
      <p class="text-ellipsis">
        <v-icon
          v-if="!item.isRead"
          style="margin-left: -5px"
          color="primary"
          :icon="item.isRead ? '' : 'mdi-circle-medium'"
        ></v-icon>
        <span class="text-subtitle-1" v-text="item.title"></span>
      </p>
      <div class="my-2 d-flex justify-space-between">
        <div class="text-subtitle-2 text-truncate d-flex align-center">
          <img
            :src="item?.feed?.icon"
            onerror="this.src='/logo.svg'"
            style="width: 1.1rem"
            class="mr-2"
          />
          {{ getSubtitle() }}
        </div>
        <small v-text="item.datestr"></small>
      </div>
    </div>
  </v-card>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useDisplay } from "vuetify";
const props = defineProps(["item", "type"]);
const { mobile } = useDisplay();
const showIframe = ref(false);
const imageHeight = ref(0);
const imageRef = ref();

onMounted(() => {
  const imgElement = imageRef.value;
  if (imgElement) {
    imageHeight.value = imgElement.$el.clientHeight;
  }
});

watch(showIframe, (newValue) => {
  if (newValue) {
    const imgElement = imageRef.value;
    if (imgElement) {
      imageHeight.value = imgElement.$el.clientHeight;
    }
  }
});

function getSubtitle() {
  const source =
    props.type === "f"
      ? props.item.author || props.item.feed?.title
      : props.item.feed?.title;
  return `${source}`;
}

function videoUrl() {
  const link = props.item.link;
  return link.indexOf("youtube.com/watch")
    ? `https://www.youtube-nocookie.com/embed/${
        link.split("?v=")[1]
      }?autoplay=1&controls=0&mute=1`
    : link;
}

function formatDuration(seconds: number) {
  if (!seconds) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}
</script>
<style lang="scss" scoped>
.summary-warp {
  min-height: 152px;
  background-color: rgba(var(--v-theme-surface-light), 0.2);
}
.iframe-container {
  background-color: #111;
  overflow: hidden;
  position: relative;
}
.video-warp {
  position: absolute;
  top: 0;
  z-index: 10;
  width: 100%;
  background-color: rgba(var(--v-theme-surface-light), 0);
}
iframe {
  width: 100%;
  margin: 0;
  padding: 0;
}
.play-preview {
  overflow: hidden;

  .play-duration {
    position: absolute;
    bottom: 8px;
    right: 8px;
    color: rgba(var(--v-theme-background), 0.9);
    background: rgba(var(--v-theme-surface-variant), 0.7);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
  }
}
</style>
