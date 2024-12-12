<template>
  <div class="basic-reader">
    <div class="title-container">
      <a class="title-warp" :href="item.link">
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
    <div class="chapter-warp">
      <slot></slot>
    </div>
    <div class="content" v-html="item.html"></div>
  </div>
</template>
<script setup lang="ts">
import { computed, Ref } from "vue";
import { FeedItem } from "@/service/types";
import { useSideChapter } from "@/utils/useSideChapter";
const props = defineProps<{
  readonly item: FeedItem;
  readonly readerRef: Ref<any, any> | null;
}>();
const description = computed(() => props.item?.description || "");
const readerRef = computed(() => props.readerRef);
useSideChapter(description, readerRef, {
  value: () => document.getElementById("chapters"),
});
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
  return `${formattedDate}`;
}
function getSource() {
  return props.item.author ? " - " + props.item.author : "";
}
</script>
<style lang="scss" scoped>
.text-overflow {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
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
.chapter-warp {
  float: left;
  position: sticky;
  top: 80px;
  left: calc(50% + 340px);
  max-width: 210px;
}
</style>
<style>
.bar-left {
  width: 150px;
}
</style>
