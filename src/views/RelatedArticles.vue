<template>
  <Items ref="itemsRef">
    <template #="{ openReader }">
      <div class="warp">
        <div class="feed-assistant mt-12 pa-3">
          <div class="text-center my-12">
            <div class="text-h3">文章过滤</div>
            <p class="my-6 text-subtitle-2">
              用SQL风格语法过滤文章, 支持复杂条件查询
            </p>
          </div>

          <div class="border rounded-lg pa-5">
            <v-textarea v-model="sqlQuery" label="输入SQL风格查询语句"
              placeholder="例如: title LIKE '技术' AND pubDate > 1600000000 ORDER BY pubDate DESC"
              @keyup.enter="handleSearch" rows="3" variant="plain" auto-grow hide-details>
            </v-textarea>
            <div class="d-flex align-center justify-space-between">
              <v-chip-group v-if="savedQueries.length" v-model="selectedQueryIndex"
                @update:model-value="handleSavedQuerySelect" column multiple selected-class="text-primary">
                <v-chip v-for="(query, index) in savedQueries" :key="index" :text="query.name" class="ma-1" size="small"
                  filter>
                </v-chip>
              </v-chip-group>
              <div class="d-flex gap-2">
                <c-btn v-if="sqlQuery" icon="mdi-filter-plus-outline" @click="saveAsFilter" :disabled="loading">
                </c-btn>
                <c-btn icon="mdi-magnify" @click="handleSearch" :loading="loading" :disabled="loading"></c-btn>
              </div>
            </div>
          </div>

          <div class="mt-4 border rounded-lg pa-3">
            <div class="text-subtitle-1 mb-3">常用查询示例</div>
            <v-chip-group>
              <v-chip v-for="(example, index) in queryExamples" :key="index" :text="example.name" class="ma-1"
                size="small" @click="applyExample(example.query)">
              </v-chip>
            </v-chip-group>
          </div>

          <v-card v-if="total || loading || isSearching" class="mt-4 border rounded-lg" :loading="loading" flat>
            <v-card-text>
              <div class="text-subtitle-2 ma-2">
                {{
                  loading
                    ? "加载中..."
                    : "搜索到 " + total + " 条相关结果"
                }}
              </div>
              <v-row v-if="loading">
                <v-col cols="12" md="12" v-for="index in 6" :key="index">
                  <v-skeleton-loader type="paragraph"></v-skeleton-loader>
                  <v-skeleton-loader type="card-avatar" class="mx-5"></v-skeleton-loader>
                </v-col>
              </v-row>
              <v-empty-state v-else-if="total == 0" icon="mdi-magnify" text="尝试使用其他查询条件"
                title="没有找到相关文章"></v-empty-state>
              <v-expand-transition>
                <v-row v-if="total && !loading">
                  <v-col cols="12" v-for="(item, index) in itemStore.items" :key="item.id">
                    <ContentItem :item="item" @click="openReader(index, item)"></ContentItem>
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
import { ref, onMounted } from "vue";
import { useItemsStore } from "@/store";
import { useSettingsStore } from "@/store";
import { filterItems } from "@/service/itemsFilter";
import { Item } from "@/repository";
import { QueryFilterItem } from "@/store/settings";

const sqlQuery = ref("");
const loading = ref(false);
const savedQueries = ref<QueryFilterItem[]>([]);
const selectedQueryIndex = ref([]);
const articles = ref<Item[]>([]);
const total = ref(0);
const itemStore = useItemsStore();
const itemsRef = ref();
const isSearching = ref(false);
const settingsStore = useSettingsStore();

// 预设查询示例
const queryExamples = [
  { name: "最近一周文章", query: "pubDate > " + Math.floor((Date.now() / 1000) - 7 * 24 * 60 * 60) },
  { name: "技术相关", query: "title LIKE '技术' OR title LIKE 'tech' OR feed.title LIKE '技术'" },
  { name: "新闻文章", query: "feed.title LIKE '新闻' OR feed.title LIKE 'news'" },
  { name: "最新文章(降序)", query: "pubDate > 0 ORDER BY pubDate DESC LIMIT 50" },
  { name: "最早文章(升序)", query: "pubDate > 0 ORDER BY pubDate ASC LIMIT 50" },
  { name: "特定日期范围", query: "pubDate BETWEEN " + Math.floor((Date.now() / 1000) - 30 * 24 * 60 * 60) + " AND " + Math.floor(Date.now() / 1000) },
  { name: "未读文章", query: "isRead = false" },
  { name: "已保存文章", query: "isSaved = true" },
];

// 加载保存的查询
onMounted(() => {
  loadSavedQueries();
});

function loadSavedQueries() {
  savedQueries.value = settingsStore.automation.filters || [];
}

function applyExample(query: string) {
  sqlQuery.value = query;
  handleSearch();
}

async function handleSavedQuerySelect() {
  if (selectedQueryIndex.value.length === 0) {
    articles.value = [];
    itemsRef.value.loadData(0, [], true);
    return;
  }

  const selectedQuery = savedQueries.value[selectedQueryIndex.value[0]];
  if (selectedQuery) {
    sqlQuery.value = selectedQuery.query || "";
    await handleSearch();
  }
}

async function handleSearch() {
  if (!sqlQuery.value.trim()) return;
  loading.value = true;
  isSearching.value = true;
  init();

  try {
    // 使用itemsFilter进行查询
    const result = await filterItems(sqlQuery.value, 0, 300);
    total.value = result.total;
    articles.value = result.data;

    // 加载到itemsStore中
    if (articles.value.length > 0) {
      itemsRef.value.loadData(
        0,
        articles.value.map((item) => item.id)
      );
    }
  } catch (error) {
    console.error("查询失败:", error);
    alert(error instanceof Error ? error.message : "查询失败");
  } finally {
    loading.value = false;
  }
}

function init() {
  articles.value = [];
  selectedQueryIndex.value = [];
  itemsRef.value.loadData(0, []);
}

async function saveAsFilter() {
  const name = prompt("请输入过滤器名称");
  if (!name) return;

  // 保存SQL查询
  const query = {
    id: Date.now().toString(),
    name,
    keywords: [],
    query: sqlQuery.value,
    createTime: Date.now(),
  };

  // 检查是否已存在sqlQueries数组
  if (!settingsStore.automation.filters) {
    settingsStore.automation.filters = [];
  }

  settingsStore.automation.filters.push(query);
  settingsStore.saveToLocalStorage();

  // 重新加载保存的查询
  loadSavedQueries();

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
