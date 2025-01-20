<template>
  <div class="overflow" ref="readerRef">
    <div
      class="top-sider v-toolbar__content px-2"
      :class="{
        'top-sider-border': scrollTop > 120 && !mobile,
        'top-sider-hidden':
          isScrollingDown &&
          scrollTop > 960 &&
          settingsStore.general.defaultView != 'magazine',
      }"
    >
      <div class="prepend-bar">
        <slot name="prepend-bar"></slot>
      </div>
      <div class="top-sider-title mx-auto w-100">
        <v-dialog-transition>
          <div
            class="text-truncate text-subtitle-1"
            v-show="scrollTop > 120 && !mobile"
          >
            {{ item.title }} | <small v-text="getSource()"></small>
          </div>
        </v-dialog-transition>
      </div>
      <div class="append-bar">
        <slot name="append-bar">
          <c-btn
            icon
            variant="text"
            :loading="summarizing"
            :disabled="!canSummarize"
            title="AI 总结"
            @click="generateSummary"
            class="mr-2"
          >
            <v-icon>mdi-auto-fix</v-icon>
          </c-btn>
          <c-btn
            variant="text"
            icon
            title="稍后阅读"
            @click="toggleSaved"
            class="mr-2"
          >
            <v-icon>{{
              item.isSaved ? "mdi-playlist-minus" : "mdi-playlist-plus"
            }}</v-icon>
          </c-btn>
          <c-btn
            variant="text"
            :color="readerType == 'default' ? '' : 'primary'"
            title="内嵌网页"
            icon=" mdi-apple-safari"
            @click="readerType = readerType == 'default' ? 'HTML' : 'default'"
          >
          </c-btn>
          <c-btn
            variant="text"
            icon
            :title="item.isRead ? '未读' : '已读'"
            @click.stop="toggleRead"
          >
            <v-icon>{{
              item.isRead ? "mdi-circle-outline" : "mdi-circle"
            }}</v-icon>
          </c-btn>
        </slot>
      </div>
    </div>
    <slot name="header"></slot>
    <v-container class="reader-warp" @contextmenu.stop>
      <slot name="prepend"></slot>
      <slot>
        <iframe
          class="iframe"
          v-if="readerType == 'HTML'"
          :src="item.link"
          frameborder="0"
          referrerpolicy="origin"
          sandbox="allow-same-origin allow-popups allow-downloads allow-forms allow-scripts"
        ></iframe>
        <image-reader
          v-else-if="item?.type == 'IMAGE'"
          :item="item"
          :reader-ref="readerRef"
        />
        <basic-reader
          v-else-if="item?.type == 'BASIC'"
          :item="item"
          :reader-ref="readerRef"
        >
          <slot name="chapter"></slot>
        </basic-reader>
        <podcast-reader
          v-else-if="item?.type == 'PODCAST'"
          :item="item"
          :reader-ref="readerRef"
        />
        <video-reader :item="item" v-else-if="item.type == 'VIDEO'" />
      </slot>
    </v-container>
    <slot name="footer"></slot>
  </div>
</template>
<script setup lang="ts">
import { onMounted, watch, ref, computed, provide } from "vue";
import { useAppStore, useSettingsStore } from "@/store";
import { FeedItem } from "@/service/types";
// import { useSideChapter } from "@/utils/useSideChapter";
import { useScroll } from "@/utils/scroll";
import { useDisplay } from "vuetify";
import BasicReader from "./BasicReader.vue";
import ImageReader from "./ImageReader.vue";
import VideoReader from "./VideoReader.vue";
import PodcastReader from "./PodcastReader.vue";
import { Marked } from "@/service";
import { summarySymbol, summarizingSymbol } from "./InjectionSymbols";

const readerRef = ref();

const props = defineProps<{
  item: FeedItem;
}>();
const { scrollTop } = useScroll(readerRef);
const { mobile } = useDisplay();
const readerType = ref("default");
const lastScrollTop = ref(0);
const isScrollingDown = ref(false);

// 监听滚动方向
watch(scrollTop, (newScrollTop) => {
  if (newScrollTop > lastScrollTop.value) {
    isScrollingDown.value = true;
  } else {
    isScrollingDown.value = false;
  }
  lastScrollTop.value = newScrollTop;
});

watch(
  () => props.item.id,
  () => {
    setTimeout(() => {
      readerRef.value.scrollTop = 0;
      summary.value = "";
    }, 100);
    if (!props.item.isRead && props.item.id) {
      appStore.read(
        Number(props.item.id),
        Marked.ITEM,
        appStore.lastRefeshTime,
        props.item.feedId
      );
    }
  }
);

const appStore = useAppStore();
const settingsStore = useSettingsStore();

const summarizing = ref(false);
const summary = ref<string | null>(null);

// 检查是否可以使用 AI
const canSummarize = computed(() => {
  const settings = settingsStore.integrated;
  return (
    settings.isApiValid &&
    settings.selectedModel &&
    settings.apiKey &&
    props.item?.description
  );
});

async function generateSummary() {
  if (summarizing.value) return;

  const settings = settingsStore.integrated;
  summarizing.value = true;

  try {
    const response = await fetch(settings.apiUrl + "/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.selectedModel,
        messages: [
          {
            role: "system",
            content: settings.summaryPrompt,
          },
          {
            role: "user",
            content: props.item.description,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.statusText}`);
    }

    const data = await response.json();
    summary.value = data.choices[0].message.content;
  } catch (error: any) {
    alert("生成总结失败：" + error.message);
  } finally {
    summarizing.value = false;
  }
}

onMounted(async () => {
  if (!props.item.isRead && props.item.id) {
    appStore.read(
      Number(props.item.id),
      Marked.ITEM,
      appStore.lastRefeshTime,
      props.item.feedId
    );
  }
});

function toggleSaved() {
  if (props.item.isSaved) {
    appStore.unsave(props.item.id);
  } else {
    appStore.save(props.item.id);
  }
}

function toggleRead() {
  if (props.item.isRead) {
    appStore.unread(props.item.id);
  } else {
    appStore.read(props.item.id);
  }
}

function getSource() {
  return (
    props.item.feed?.title +
    (props.item.author ? " - " + props.item.author : "")
  );
}

provide(summarySymbol, summary);
provide(summarizingSymbol, summarizing);
</script>
<style lang="scss" scoped>
.overflow {
  height: 100vh;
  overflow-y: scroll;
}
.top-sider {
  position: sticky !important;
  top: 0;
  z-index: 10;
  background-color: rgb(var(--v-theme-background));
  display: grid;
  grid-template-columns: minmax(180px, auto) minmax(0, 1fr) minmax(180px, auto);
  align-items: center;
  padding: 0.5rem 0.3rem;
  border-bottom: 1px solid rgba(var(--v-border-color), 0);
  height: 56px;
  transition: transform 0.5s ease;

  &.top-sider-hidden {
    transform: translateY(-100%);
  }

  > * {
    min-width: 120px;
    max-width: 650px;
  }
  a {
    text-decoration: none;
    color: rgb(var(--v-border-color));
  }
  .top-sider-title {
    text-align: center;
  }
}
.top-sider-border {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.text-overflow {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.title {
  margin-bottom: 1rem;
}
.iframe {
  position: relative;
  width: 100%;
  height: calc(100vh - 102px);
  z-index: 10;
}

:deep(.reader-warp) .content {
  max-width: 664px;
  margin: 0 auto;
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
</style>
