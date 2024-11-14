<template>
  <div class="basic-reader">
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
    <div class="toc-list" ref="tocRef"></div>
    <div id="content" class="content" v-html="item.html"></div>
  </div>
</template>
<script setup lang="ts">
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
</script>
<style lang="scss" scoped>
.text-overflow {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
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
.content {
  max-width: 730px;
  margin: 0 auto;
}
.basic-reader {
  background-color: rgb(var(--v-theme-background));
}
.a {
  color: rgb(var(--v-theme-surface-variant));
  text-decoration: none;
  &:hover {
    text-decoration: underline;
    color: rgb(var(--v-theme-success));
  }
}
</style>
<style>
.content {
  padding: 0.5rem;
  line-height: var(--line-height);
  * {
    max-width: 100%;
  }
  h1,
  h2,
  h3,
  h4 {
    margin-top: var(--line-height);
    margin-bottom: 1rem;
  }
  p {
    padding: 0.8rem 0;
  }
  pre {
    margin-top: 1rem;
    margin-bottom: 1rem;
    background-color: rgba(var(--v-theme-on-code), 0.9);
    color: rgb(var(--v-theme-code));
    padding: 1rem;
    border-radius: 0.5rem;
    font-family: var(--code-font);
  }
}

.bar-left {
  width: 150px;
}
</style>
