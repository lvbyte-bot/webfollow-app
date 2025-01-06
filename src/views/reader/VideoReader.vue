<template>
  <v-card flat>
    <div class="title-container">
      <a class="title-warp" :href="item.link" target="_blank">
        <p class="text-h4 title">{{ item.title }}</p>
        <p class="text-subtitle-2 mb-2">
          <router-link
            @click.stop=""
            class="a"
            title="前往订阅源"
            :to="'/f/' + item?.feed?.id"
            v-text="props.item.feed?.title"
          ></router-link>
          <span v-text="getSource()"></span>
        </p>
        <p class="text-subtitle-2 text-body-2" v-text="getDate()"></p>
      </a>
    </div>

    <div class="content">
      <iframe
        id="ytplayer"
        type="text/html"
        class="iframe"
        :src="videoUrl()"
        frameborder="0"
        allow="fullscreen"
        mozallowfullscreen="mozallowfullscreen"
        msallowfullscreen="msallowfullscreen"
        oallowfullscreen="oallowfullscreen"
        webkitallowfullscreen="webkitallowfullscreen"
      ></iframe>
      <div class="mt-6" v-html="item.html"></div>
    </div>
  </v-card>
</template>
<script lang="ts" setup>
import { FeedItem } from "@/service/types";

const props = defineProps<{
  item: FeedItem;
}>();

function getDate() {
  const options: any = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24小时制
  };
  const formattedDate = new Date(props.item.pubDate * 1000).toLocaleString(
    "zh-CN",
    options
  );
  return ` | ${formattedDate}`;
}
function getSource() {
  return " - " + props.item.author;
}

function videoUrl() {
  const link = props.item.link;
  return link.indexOf("youtube.com/watch")
    ? `https://www.youtube.com/embed/${link.split("?v=")[1]}?autoplay=1`
    : link;
}
</script>
<style lang="scss" scoped>
.title-container {
  margin: 0 auto 2rem;
  text-align: center;
  max-width: 692px;
  padding: 1.5rem;
  border-radius: 0.5rem;
  &:hover {
    background-color: rgb(var(--v-theme-surface-light));
  }
  a {
    text-decoration: none;
    color: rgb(var(--v-theme-surface-variant));
  }
  .title-warp {
    text-align: start;
  }
  .title {
    margin-bottom: 1rem;
    line-height: 3rem;
  }
}
.iframe {
  position: relative;
  width: 100%;
  height: 390px;
  z-index: 10;
}
</style>
