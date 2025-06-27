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

          <!-- AI助手区域 -->
          <div class="border rounded-lg pa-5 mb-4">
            <!-- <div class="d-flex align-center mb-5">
              <v-icon class="mr-2" color="primary">mdi-creation-outline</v-icon>
              <div class="text-h6">AI 过滤助手</div>
            </div> -->
            <v-textarea v-model="aiQuestion" label="描述你想要查找的文章" placeholder="例如: 我想找最近一周关于人工智能的技术文章" rows="3"
              variant="plain" auto-grow hide-details class="mb-3" @keyup.enter="generateSQL">
            </v-textarea>
            <div class="d-flex gap-2 align-center justify-end">
              <c-btn icon="mdi-send" @click="generateSQL" :loading="aiLoading" title="发送"
                :disabled="!aiQuestion.trim() || aiLoading" flat>
              </c-btn>
            </div>
          </div>

          <!-- 手动SQL输入区域 - 可折叠 -->
          <div class="border rounded-lg">
            <v-expansion-panels v-model="sqlPanelOpen" flat>
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex align-center">
                    <v-icon class="mr-2">mdi-code-tags</v-icon>
                    手动输入SQL查询
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="py-2">
                    <v-textarea v-model="sqlQuery" label="输入SQL风格查询语句"
                      placeholder="例如: title LIKE '技术' AND pubDate > 1600000000 ORDER BY pubDate DESC"
                      @keyup.enter="handleSearch" rows="3" auto-grow hide-details>
                    </v-textarea>
                    <div class="d-flex align-center justify-space-between mt-3">
                      <v-chip-group v-if="savedQueries.length" v-model="selectedQueryIndex"
                        @update:model-value="handleSavedQuerySelect" column multiple selected-class="text-primary">
                        <v-chip v-for="(query, index) in savedQueries" :key="index" :text="query.name" class="ma-1"
                          size="small" filter>
                        </v-chip>
                      </v-chip-group>
                      <div class="d-flex gap-2">
                        <c-btn v-if="sqlQuery" icon="mdi-filter-plus-outline" @click="saveAsFilter" :disabled="loading">
                        </c-btn>
                        <c-btn icon="mdi-text-search" @click="handleSearch" :loading="loading"
                          :disabled="loading"></c-btn>
                      </div>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
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

// AI相关的响应式变量
const aiQuestion = ref("");
const aiLoading = ref(false);
// 不再需要显示生成的SQL，但仍需要变量用于内部处理
const generatedSQL = ref("");
const sqlPanelOpen = ref<number[]>([]);

// 预设查询示例
const queryExamples = [
  { name: "最近一周文章", query: "pubDate > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 WEEK))" },
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

// AI生成SQL相关函数
async function generateSQL() {
  if (!aiQuestion.value.trim()) return;

  const settings = settingsStore.proxyIntegrated;
  if (!settings.isApiValid || !settings.apiKey) {
    alert("请先在设置中配置AI服务");
    return;
  }

  aiLoading.value = true;
  generatedSQL.value = "";

  try {
    const prompt = `你是一个MYSQL SQL查询生成助手。根据用户的自然语言描述，生成对应的SQL风格查询语句。

    数据库表结构说明：
    - 主表：文章表，包含以下字段：
      - id: 文章ID
      - title: 文章标题
      - content: 文章内容
      - pubDate: 发布时间戳（Unix时间戳）
      - isRead: 是否已读（true/false）
      - isSaved: 是否已保存（true/false）
      - feed.title: 订阅源标题
      - feed.id: 订阅源ID

    支持的SQL语法：
    - 条件语法：title LIKE '关键词', content LIKE '关键词'
    - 时间条件：pubDate > 时间戳, pubDate BETWEEN 开始时间 AND 结束时间
    - 布尔条件：isRead = true/false, isSaved = true/false
    - 排序：ORDER BY pubDate DESC/ASC
    - 限制：LIMIT 数量

    注意：不要生成完整的SELECT语句，只需要生成WHERE条件部分（不包含WHERE关键字）以及可能的ORDER BY和LIMIT子句。

    用户需求：${aiQuestion.value}

    请直接返回SQL查询条件，不要包含SELECT语句，也不要包含WHERE关键字，不要包含任何解释文字。`;

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
            content: "你是一个SQL查询生成助手。根据用户描述生成准确的SQL查询条件。只返回条件部分，不要包含SELECT语句或WHERE关键字。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.statusText}`);
    }

    const data = await response.json();
    let sqlResult = data.choices[0].message.content.trim();

    // 清理返回的SQL，移除可能的markdown格式
    sqlResult = sqlResult.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();

    // 移除可能的SELECT语句和WHERE关键字
    sqlResult = sqlResult
      .replace(/^SELECT\s+.*?\s+FROM\s+.*?\s+WHERE\s+/i, '')
      .replace(/^SELECT\s+.*?\s+FROM\s+.*?$/i, '')
      .replace(/^WHERE\s+/i, '')
      .replace(/%/g, '')
      .trim();

    generatedSQL.value = sqlResult;

    // 自动应用SQL并执行查询
    sqlQuery.value = sqlResult;
    await handleSearch();

  } catch (error: any) {
    console.error("AI生成SQL失败:", error);
    alert("AI调用失败：" + error.message);
  } finally {
    aiLoading.value = false;
  }
}

// function copySQL() {
//   if (generatedSQL.value) {
//     navigator.clipboard.writeText(generatedSQL.value).then(() => {
//       alert("SQL已复制到剪贴板");
//     }).catch(() => {
//       alert("复制失败，请手动复制");
//     });
//   }
// }

// function useGeneratedSQL() {
//   if (generatedSQL.value) {
//     sqlQuery.value = generatedSQL.value;
//     // 展开手动SQL面板
//     sqlPanelOpen.value = [0];
//     // 自动执行搜索
//     handleSearch();
//   }
// }
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
