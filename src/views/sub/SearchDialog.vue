<template>
  <v-dialog v-model="show" max-width="800px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-text-field
          v-model="keyword"
          placeholder="搜索文章或订阅源..."
          density="compact"
          hide-details
          @keyup.enter="handleSearch"
          autofocus
        >
          <template #prepend-inner>
            <v-icon>mdi-magnify</v-icon>
          </template>
          <template #append-inner>
            <v-progress-circular
              v-if="loading"
              size="20"
              width="2"
              indeterminate
              color="primary"
            />
          </template>
        </v-text-field>
      </v-card-title>

      <v-divider></v-divider>
        <v-card-text class="pa-2" style="height: 60vh">
          <template v-if="keyword">

            <div v-if="searchResults.items.length > 0">
              <div class="text-subtitle-2 px-4 py-2">
                文章 ({{ searchResults.items.length }})
              </div>
              <v-list lines="two">
                <v-list-item
                  v-for="item in searchResults.items"
                  :key="item.id"
                  @click="openItem(item)"
                  class="search-item"
                >
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                  <div class="d-flex align-center mt-2 text-caption">
                    <img
                      :src="item.feed?.icon"
                      width="14"
                      height="14"
                      style="border-radius: 4px"
                      loading="lazy"
                      onerror="this.src='/logo.svg'" 
                      class="mr-2"
                    ></img>
                    {{ item.feed?.title }}
                  </div>
                </v-list-item>
              </v-list>
            </div>

            <div v-if="searchResults.feeds.length > 0">
              <div class="text-subtitle-2 px-4 py-2">
                订阅源 ({{ searchResults.feeds.length }})
              </div>
              <v-list>
                <v-list-item
                  v-for="feed in searchResults.feeds"
                  :key="feed.id"
                  class="search-item"
                  @click="openFeed(feed)"
                >
                  <template #prepend>
                    <img
                      :src="feed.icon"
                      :alt="feed.title"
                      width="16"
                      height="16"
                      class="mr-2"
                      style="border-radius: 4px"
                      loading="lazy"
                      onerror="this.src='/logo.svg'" 
                    ></img>
                  </template>
                  <v-list-item-title>{{ feed.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>

            <v-empty-state
              v-if="
                searchResults.items.length === 0 &&
                searchResults.feeds.length === 0
              "
              class="text-center pa-4"
              icon="mdi-magnify"
              title="未找到相关内容"
              text="请尝试其他关键词"
            >
              
            </v-empty-state>
          </template>

          <div v-else class="text-center pa-4 text-medium-emphasis">
            输入关键词开始搜索
          </div>
        </v-card-text>
    </v-card>
  </v-dialog>
  <reader  v-model="showReader" :item="currentItem" to=".v-main-top" />
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { search } from "@/service";
import type { FeedItem, SubscriptionFeed } from "@/service/types";
import { debound } from "@/utils/debound";
import Reader from "../reader";

const showReader = ref(false);

const props = defineProps({
  modelValue: Boolean,
});

const currentItem = ref<FeedItem|undefined>();

const emit = defineEmits(["update:modelValue"]);

const router = useRouter();
const show = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const keyword = ref("");

// 搜索结果
const searchResults = ref<{ items: FeedItem[]; feeds: SubscriptionFeed[] }>({
  items: [],
  feeds: [],
});

// 添加 loading 状态
const loading = ref(false);

// 打开文章
const openItem = (item:FeedItem) => {
  showReader.value = true;
  currentItem.value = item;
  show.value = false;
};

// 打开订阅源
const openFeed = (feed: any) => {
  router.push(`/f/${feed.id}`);
  show.value = false;
};

// 创建防抖的搜索函数
const debouncedSearch = debound(async (kw: string) => {
  if (!kw) {
    searchResults.value = { items: [], feeds: [] };
    return;
  }

  loading.value = true;
  try {
    const { items, feeds } = await search(kw.toLowerCase());
    searchResults.value = { items, feeds };
  } finally {
    loading.value = false;
  }
}, 300);

// 修改 watch 处理函数
watch(keyword, async (newValue) => {
  await debouncedSearch(newValue);
});

// 修改搜索处理函数
const handleSearch = () => {
  debouncedSearch(keyword.value);
};

</script>
