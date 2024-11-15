<template>
  <v-card flat>
    <div class="title">
      <v-list-item :href="item.link" :title="item.title">
        <template #subtitle>
          <router-link
            @click.stop=""
            class="a"
            title="前往订阅源"
            :to="'/f/' + item?.feed?.id"
            v-text="props.item.feed?.title"
          ></router-link>
          <span v-text="getSource()"></span>

          <span v-text="getDate()"></span>
        </template>
      </v-list-item>
    </div>

    <div class="content">
      <iframe
        id="ytplayer"
        type="text/html"
        class="iframe"
        :src="videoUrl()"
        frameborder="0"
        allow="fullscreen;"
        allowfullscreen="allowfullscreen"
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
<style lang="css" scoped>
.title {
  margin-bottom: 1rem;
}
:deep(.title) .v-list-item-title {
  font-size: 18px;
  margin-bottom: 1rem;
}
.v-list-item {
  padding: 1.5rem;
  max-width: 760px;
  margin: 0 auto;
}
.iframe {
  position: relative;
  width: 100%;
  height: 390px;
  z-index: 10;
}
</style>
