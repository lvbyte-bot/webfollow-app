<template>
  <Items ref="itemsRef">
    <template #="{ openReader }">
      <div class="warp">
        <div class="feed-assistant mt-12 pa-3">
          <h2 class="text-center my-12">相关文章搜索</h2>
          <div class="border rounded-lg pa-5">
            <v-textarea
              v-model="searchQuery"
              label="输入关键词搜索相关内容"
              @keyup.enter="handleSearch"
              rows="3"
              variant="plain"
              auto-grow
              hide-details
            >
            </v-textarea>
            <div class="d-flex align-center justify-space-between">
              <v-chip-group
                v-if="keywords.length"
                v-model="selectedKeywords"
                @update:model-value="handleKeywordsChange"
                column
                multiple
                selected-class="text-primary"
              >
                <v-chip
                  v-for="kw in keywords"
                  :key="kw.keyword"
                  :text="kw.keyword"
                  :color="getTagColor(kw.weight)"
                  class="ma-1"
                  size="small"
                  filter
                >
                </v-chip>
              </v-chip-group>
              <div class="d-flex gap-2">
                <c-btn
                  v-if="keywords.length"
                  icon="mdi-filter-plus-outline"
                  @click="saveAsFilter"
                  :disabled="loading"
                >
                </c-btn>
                <c-btn
                  icon="mdi-magnify"
                  @click="handleSearch"
                  :loading="loading"
                  :disabled="loading"
                ></c-btn>
              </div>
            </div>
          </div>

          <v-card
            v-if="articles.length || loading || isSearching"
            class="mt-4 border rounded-lg"
            :loading="loading"
            flat
          >
            <v-card-text>
              <div class="text-subtitle-2 ma-2">
                {{
                  loading
                    ? "加载中..."
                    : "搜索到 " + articles.length + " 条相关结果"
                }}
              </div>
              <v-row v-if="loading">
                <v-col cols="12" md="12" v-for="index in 6" :key="index">
                  <v-skeleton-loader type="paragraph"></v-skeleton-loader>
                  <v-skeleton-loader
                    type="card-avatar"
                    class="mx-5"
                  ></v-skeleton-loader>
                </v-col>
              </v-row>
              <v-empty-state
                v-else-if="articles.length == 0"
                icon="mdi-magnify"
                text="尝试使用其他关键词"
                title="没有找到相关文章"
              ></v-empty-state>
              <v-expand-transition>
                <v-row v-if="articles.length && !loading">
                  <v-col
                    cols="12"
                    v-for="(item, index) in itemStore.items"
                    :key="item.id"
                  >
                    <ContentItem
                      :item="item"
                      @click="openReader(index, item)"
                    ></ContentItem>
                  </v-col>
                </v-row>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </template>
  </Items>
</template>

<script setup lang="ts">
import Items from "./Items.vue";
import ContentItem from "./item/ContentItem.vue";
import { ref } from "vue";
import { getRelatedKeywords, retrieveRelevantContexts } from "@/service/rag";
import type { KeywordWeight, FeedContext } from "@/service/rag";
import { useItemsStore } from "@/store";
import { useSettingsStore } from "@/store";

const searchQuery = ref("");
const loading = ref(false);
const keywords = ref<KeywordWeight[]>([]);
const selectedKeywords = ref<number[]>([]);
const articles = ref<FeedContext[]>([]);
const itemStore = useItemsStore();
const itemsRef = ref();
const isSearching = ref(false);
const settingsStore = useSettingsStore();

const getTagColor = (weight: number) => {
  if (weight >= 50) return "error";
  if (weight >= 20) return "warning";
  if (weight >= 10) return "success";
  return "info";
};

async function handleKeywordsChange() {
  const newVal = selectedKeywords.value;
  loading.value = true;
  if (newVal.length > 0) {
    const selectedWords = newVal.map((index) => keywords.value[index]);
    articles.value = await retrieveRelevantContexts("", selectedWords, 300);
    itemsRef.value.loadData(
      0,
      articles.value.map((item) => item.id)
    );
  } else {
    articles.value = [];
    itemsRef.value.loadData(0, [], true);
  }
  loading.value = false;
}

async function handleSearch() {
  if (!searchQuery.value.trim()) return;
  loading.value = true;
  isSearching.value = true;
  init();

  try {
    // 获取相关关键词
    keywords.value = await getRelatedKeywords(searchQuery.value);
    selectedKeywords.value = keywords.value.map((_, index) => index);
    await handleKeywordsChange();
  } catch (error: any) {
    console.error("搜索失败:", error);
    alert(error.message || "搜索失败");
  } finally {
    loading.value = false;
  }
}

function init() {
  keywords.value = [];
  articles.value = [];
  selectedKeywords.value = [];
  itemsRef.value.loadData(0, []);
}

async function saveAsFilter() {
  const name = prompt("请输入过滤项名称");
  if (!name) return;

  const filter = {
    id: Date.now().toString(),
    name,
    keywords: selectedKeywords.value.map((index) => keywords.value[index]),
    createTime: Date.now(),
  };

  settingsStore.automation.filters.push(filter);
  settingsStore.saveToLocalStorage();

  alert("保存成功");
}
</script>

<style scoped>
.feed-assistant {
  max-width: 700px;
  margin: 0 auto;
}

:deep(.v-list-item) {
  margin-bottom: 8px;
}

:deep(.v-list-item__subtitle) {
  opacity: 0.7;
  font-size: 0.9em;
}

:deep(.v-field__input) {
  font-size: 0.95rem;
}
</style>
