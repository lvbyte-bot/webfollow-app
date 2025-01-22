<template>
  <div class="rss-config">
    <!-- 路由信息 -->
    <v-card-text class="my-3">
      <code class="route-path">{{ routePath }}</code>
    </v-card-text>

    <!-- 参数配置 -->
    <v-card-text v-if="currentParameters">
      <v-form ref="form">
        <div v-for="(param, key) in currentParameters" :key="key">
          <template v-if="param.options">
            <v-select
              v-model="paramValues[key]"
              :items="param.options"
              :label="key"
              item-title="label"
              item-value="value"
              density="compact"
              class="param-select"
              hide-details
              :hint="param.description"
              persistent-hint
            />
          </template>
          <template v-else>
            <v-text-field
              v-model="paramValues[key]"
              :label="key"
              density="compact"
              class="param-input"
              hide-details
              :hint="param.description"
              persistent-hint
            />
          </template>
        </div>
      </v-form>
    </v-card-text>

    <!-- 描述信息 -->
    <v-card-text v-if="currentRoute?.description" class="description">
      <div v-html="marked(currentRoute.description)"></div>
    </v-card-text>

    <!-- 预览按钮组 -->
    <v-card-actions class="pa-4">
      <v-btn
        variant="outlined"
        @click="copyUrl"
        prepend-icon="mdi-content-copy"
      >
        复制
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        variant="outlined"
        :href="generatedUrl"
        target="_blank"
        prepend-icon="mdi-eye"
      >
        预览
      </v-btn>

      <v-btn
        color="primary"
        variant="flat"
        @click="addToSub"
        :loading="loading"
        :disabled="generatedUrl.includes('/:') || loading"
        prepend-icon="mdi-rss"
      >
        {{ loading ? "添加中..." : "添加到订阅" }}
      </v-btn>
    </v-card-actions>

    <!-- 提示消息 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { marked } from "marked";
import { useAppStore } from "@/store";
import { extFeed } from "@/api";
const rsshub = "https://rsshub.app";

// 添加 appStore
const appStore = useAppStore();

interface Parameter {
  description?: string;
  options?: Array<{
    value: string;
    label: string;
  }>;
  default?: string;
}

interface Route {
  path: string;
  name: string;
  parameters?: Record<string, Parameter>;
  example?: string;
  description?: string;
}

interface Service {
  name: string;
  url: string;
  routes: Record<string, Route>;
  description?: string;
}

const props = defineProps<{
  serviceKey: string;
  routePath: string;
}>();

const jsonData = ref<Record<string, Service>>();
const paramValues = ref<Record<string, string>>({});

const snackbar = ref({
  show: false,
  text: "",
  color: "success",
});

// 添加 loading 状态
const loading = ref(false);

// 获取当前路由对象
const currentRoute = computed(() => {
  if (!jsonData.value?.[props.serviceKey]) return null;
  return jsonData.value[props.serviceKey].routes[props.routePath];
});

// 获取当前路由的参数配置
const currentParameters = computed(() => {
  if (!currentRoute.value) return null;
  return currentRoute.value.parameters || {};
});

// 生成 RSS URL
const generatedUrl = computed(() => {
  let url = `${rsshub}/${props.serviceKey}${props.routePath}`;

  // 替换路径参数
  Object.entries(paramValues.value).forEach(([key, value]) => {
    if (value) {
      url = url.replace(`:${key}`, value);
    }
  });

  return url;
});

// 复制 URL
const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(generatedUrl.value);
    snackbar.value = {
      show: true,
      text: "URL已复制到剪贴板",
      color: "info",
    };
  } catch (err) {
    snackbar.value = {
      show: true,
      text: "复制失败",
      color: "error",
    };
  }
};

// 添加订阅
const addToSub = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    await extFeed({ group_id: 0, feed_url: generatedUrl.value, as: "create" });
    setTimeout(() => {
      appStore.sync();
    }, 6000);

    snackbar.value = {
      show: true,
      text: "已添加到订阅列表",
      color: "info",
    };
  } catch (err) {
    snackbar.value = {
      show: true,
      text: "添加失败",
      color: "error",
    };
  } finally {
    loading.value = false;
  }
};

// 加载配置数据
const loadData = async () => {
  try {
    const response = await fetch("/data.json");
    const data = await response.json();
    jsonData.value = data.data;

    // 设置默认值
    if (currentParameters.value) {
      Object.entries(currentParameters.value).forEach(([key, param]) => {
        if (param.default) {
          paramValues.value[key] = param.default;
        }
      });
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      text: "加载配置数据失败",
      color: "error",
    };
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.rss-config {
  padding: 16px 0;
}

.route-path {
  font-family: monospace;
  font-size: 0.9rem;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 8px 12px;
  border-radius: 4px;
  color: rgba(0, 0, 0, 0.87);
}

.param-select,
.param-input {
  margin-bottom: 16px;
}

.description {
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.6);
}

:deep(.description table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

:deep(.description th),
:deep(.description td) {
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 8px;
  text-align: left;
}

:deep(.description th) {
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.description code) {
  background-color: rgba(0, 0, 0, 0.03);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

:deep(.description blockquote) {
  border-left: 4px solid rgba(0, 0, 0, 0.12);
  margin: 16px 0;
  padding: 8px 16px;
  color: rgba(0, 0, 0, 0.6);
}
</style>
