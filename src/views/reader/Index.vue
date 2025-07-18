<template>
  <div class="overflow" ref="readerRef">
    <div class="top-sider v-toolbar__content px-2" :class="{
      'top-sider-border': scrollTop > 120 && !mobile,
      'top-sider-hidden':
        isScrollingDown && scrollTop > 960 && viewMode != 'column',
    }">
      <div class="prepend-bar">
        <slot name="prepend-bar"></slot>
      </div>
      <div class="top-sider-title mx-auto w-100">
        <v-dialog-transition>
          <div class="text-truncate text-subtitle-1" v-show="scrollTop > 120 && !mobile">
            {{ item.title }} | <small v-text="getSource()"></small>
          </div>
        </v-dialog-transition>
      </div>
      <div class="append-bar">
        <slot name="append-bar">
          <c-btn icon variant="text" :loading="summarizing" :disabled="!canSummarize" title="AI 总结(快捷键：G)"
            @click="generateSummary()" class="entry-ai-summary" :color="summary ? 'primary' : ''">
            <v-icon>mdi-creation-outline</v-icon>
          </c-btn>
          <!-- <c-btn
            variant="text"
            :color="readerType == 'CONTENT' ? 'primary' : ''"
            title="加载网页全文(快捷键：W)"
            icon="mdi-coffee-outline"
            class="entry-content"
            @click="
              changeReadType(readerType == 'CONTENT' ? 'default' : 'CONTENT')
            "
          >
          </c-btn> -->

          <c-btn variant="text" icon title="稍后阅读(快捷键：F)" @click="toggleSaved" class=" entry-saved">
            <v-icon :color="item.isSaved ? 'primary' : ''">
              mdi-bookmark-outline</v-icon>
          </c-btn>
          <c-btn variant="text" :color="readerType == 'HTML' ? 'primary' : ''" title="内嵌网页(快捷键：I)"
            icon=" mdi-compass-outline" class="entry-inner  "
            @click="readerType = readerType == 'HTML' ? 'default' : 'HTML'">
          </c-btn>
          <c-btn variant="text" icon :title="item.isRead ? '未读(快捷键：M)' : '已读(快捷键：M)'" @click.stop="toggleRead"
            class="entry-read">
            <v-icon>{{
              item.isRead ? "mdi-circle-outline" : "mdi-circle"
              }}</v-icon>
          </c-btn>
        </slot>
      </div>
    </div>
    <slot name="header"></slot>
    <!-- <text-speaker></text-speaker> -->

    <v-container class="reader-warp" @contextmenu.stop>
      <slot name="prepend"></slot>
      <slot>

        <iframe class="iframe" v-if="readerType == 'HTML'" :src="item.link" frameborder="0" referrerpolicy="origin"
          sandbox="allow-same-origin allow-popups allow-downloads allow-forms allow-scripts"></iframe>
        <image-reader v-else-if="item?.type == 'IMAGE'" :item="item" :reader-ref="readerRef" />
        <basic-reader v-else-if="item?.type == 'BASIC'" :item="item" :reader-ref="readerRef"
          @force-refresh="generateSummary(true)">
          <div>
            <slot name="chapter"></slot>
            <v-btn v-show="isScrollingDown && scrollTop > 960" class="mx-5" size="small" variant="text"
              icon="mdi-arrow-up" title="回到顶部" @click="scrollTo(0)"></v-btn>
          </div>
        </basic-reader>
        <podcast-reader v-else-if="item?.type == 'PODCAST'" :item="item" :reader-ref="readerRef" />
        <video-reader :item="item" v-else-if="item.type == 'VIDEO'" />
      </slot>
    </v-container>
    <template v-if="readerType != 'HTML'">
      <slot name="footer"></slot>
    </template>
  </div>
</template>
<script setup lang="ts">
import {
  onMounted,
  watch,
  ref,
  computed,
  provide,
  onUnmounted,
  inject,
  Ref,
} from "vue";
import { useAppStore, useSettingsStore } from "@/store";
import { FeedItem } from "@/service/types";
import { useScroll } from "@/utils/scroll";
import { useDisplay } from "vuetify";
import BasicReader from "./sub/BasicReader.vue";
import ImageReader from "./sub/ImageReader.vue";
import VideoReader from "./sub/VideoReader.vue";
import PodcastReader from "./sub/PodcastReader.vue";
// import { extractContentFromUrl } from "@/utils/extContext";
import { Marked } from "@/service";
import { generateArticleSummary } from "@/utils/aiSummary";
// import { html2md, md2html } from "@/utils/mdUtils";
import { summarySymbol, summarizingSymbol } from "./InjectionSymbols";
import { viewModeSymbol } from "../InjectionSymbols";

const readerRef = ref<HTMLElement | undefined>();

const viewMode = inject(viewModeSymbol);
const props = defineProps<{
  item: FeedItem;
}>();
const { scrollTop, scrollTo } = useScroll(readerRef);
const { mobile } = useDisplay();
const readerType: Ref<"HTML" | "default" | "CONTENT"> = ref("default");
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
  async () => {
    setTimeout(() => {
      if (readerRef.value) {
        readerRef.value.scrollTo(0, 0);
      }
      summary.value = "";
    }, 100);
    if (!props.item.isRead && props.item.id) {
      await appStore.read(
        Number(props.item.id),
        Marked.ITEM,
        appStore.lastRefeshTime,
        0,
        props.item.feedId
      );
      props.item.isRead = true;
    }
    setTimeout(() => {
      document.querySelectorAll(".reading .content pre").forEach((pre: any) => {
        pre?.addEventListener("click", copyCode);
      });
    }, 100);
    // changeReadType(readerType.value);
  }
);

// let cacheItems: any = {};

// async function changeReadType(type: "HTML" | "default" | "CONTENT") {
//   readerType.value = type;
//   if (type == "CONTENT") {
//     if (!cacheItems[props.item.id]) {
//       cacheItems[props.item.id] = {
//         html: props.item.html,
//         description: props.item.description,
//       };
//     }
//     const r = await extractContentFromUrl(props.item.link);
//     props.item.description = html2md(r.content || r.error || "-");
//     props.item.html = md2html(props.item.description);
//   } else if (type == "default") {
//     if (cacheItems[props.item.id]) {
//       props.item.description = cacheItems[props.item.id].description;
//       props.item.html = cacheItems[props.item.id].html;
//     }
//   }
// }

const appStore = useAppStore();
const settingsStore = useSettingsStore();

const summarizing = ref(false);
const summary = ref<string | null>(null);

// 检查是否可以使用 AI
const canSummarize = computed(() => {
  const settings = settingsStore.proxyIntegrated;
  return (
    settings.isApiValid &&
    settings.selectedModel &&
    settings.apiKey &&
    props.item?.description
  );
});

async function generateSummary(forceRefresh = false) {
  if (summarizing.value) return;

  summarizing.value = true;

  try {
    const result = await generateArticleSummary({
      link: props.item.link,
      title: props.item.title,
      description: props.item.description,
      feedItemId: props.item.id,
      forceRefresh
    });

    if (result.error) {
      throw new Error(result.error);
    }

    summary.value = result.summary;
  } catch (error: any) {
    alert("生成总结失败：" + error.message);
  } finally {
    summarizing.value = false;
  }
}

onMounted(async () => {
  if (!props.item.isRead && props.item.id) {
    await appStore.read(
      Number(props.item.id),
      Marked.ITEM,
      appStore.lastRefeshTime,
      0,
      props.item.feedId
    );
    props.item.isRead = true;
  }
});

function copyCode(event: any) {
  event.preventDefault();
  event.stopPropagation();
  const rect = event.target.closest("pre").getBoundingClientRect();

  const right = rect.right - event.clientX;
  const y = event.clientY - rect.top;
  console.log(right, y);
  if (right < 42 && y < 35) {
    navigator.clipboard.writeText(event.target.textContent);
    event.target.closest("pre").classList.add("copy-success");
    setTimeout(() => {
      event.target.closest("pre").classList.remove("copy-success");
    }, 2000);
  }
}

onUnmounted(() => {
  document.querySelectorAll(".reading .content pre").forEach((pre: any) => {
    pre?.removeEventListener("click", copyCode);
  });
});

async function toggleSaved() {
  if (props.item.isSaved) {
    await appStore.unsave(props.item.id);
  } else {
    await appStore.save(props.item.id);
  }
  // props.item.isSaved = !props.item.isSaved;
}

async function toggleRead() {
  if (props.item.isRead) {
    await appStore.unread(props.item.id);
  } else {
    await appStore.read(props.item.id);
  }
  // props.item.isRead = !props.item.isRead;
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
  grid-template-columns: minmax(160px, auto) minmax(0, 1fr) minmax(160px, auto);
  align-items: center;
  padding: 0.5rem 0.3rem;
  border-bottom: 1px solid rgba(var(--v-border-color), 0);
  height: 56px;
  transition: transform 0.3s ease;

  &.top-sider-hidden {
    transform: translateY(-50%);
    opacity: 0;

    &:hover {
      transform: translateY(0);
      opacity: 1;
    }
  }

  >* {
    min-width: 120px;
    max-width: var(--reader-main-max-width);
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

.append-bar {
  text-align: right;
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
  max-width: calc(var(--reader-main-max-width) + 1rem);
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
    position: relative;
    margin-top: 1rem;
    margin-bottom: 1rem;
    background-color: rgba(var(--v-theme-code), 0.8);
    color: rgb(var(--v-theme-on-code));
    padding: 1rem;
    border-radius: 1rem;
    font-family: var(--code-font);
    overflow-x: auto;
    pointer-events: hover;

    :before {
      display: none;
      cursor: pointer;
      content: "复制";
      position: absolute;
      top: 0;
      right: 0;
      height: 35px;
      width: 42px;
      background-color: rgba(var(--v-theme-primary), 0.8);
      color: rgb(var(--v-theme-on-primary));
      padding: 0.2rem 0.5rem;
      border-radius: 0 0.5rem 0 0.5rem;
      pointer-events: auto;
    }

    &:hover {
      :before {
        display: block;
      }
    }
  }

  .copy-success {
    :before {
      content: "✓";
      font-size: 2rem;
      font-weight: bold;
      padding-left: 1rem;
    }
  }
}
</style>
