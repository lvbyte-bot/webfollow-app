<template>
  <div class="rss-list">
    <v-container v-if="jsonData">
      <!-- 搜索框 -->
      <v-row class="search-row">
        <v-col cols="12" md="4">
          <v-text-field v-model="searchQuery" label="搜索服务" prepend-inner-icon="mdi-magnify" clearable hide-details
            density="compact" />
        </v-col>
      </v-row>

      <!-- 服务列表网格 -->
      <v-row>
        <v-col v-for="service in filteredServices" :key="service.key" cols="12" sm="6" md="4" lg="3" xl="2">
          <v-card class="service-card rounded-lg" variant="outlined">
            <!-- 服务图标和名称 -->
            <v-card-item class="pb-3" :style="{
              backgroundColor:
                iconColors.get(service.url) || 'rgba(0, 0, 0, 0.3)',
            }">
              <template v-slot:prepend>
                <v-avatar :image="getServiceIcon(service.url)" :alt="service.name" :data-url="service.url"
                  class="service-icon" size="20" />
              </template>
              <v-card-title class="text-truncate ps-3">
                {{ service.name }}
              </v-card-title>
            </v-card-item>

            <!-- 路由列表 -->
            <v-card-text class="py-5">
              <div class="route-list">
                <v-chip v-for="(route, path) in getServiceRoutes(service.key)" :key="path" size="small" variant="text"
                  class="route-chip" @click="openConfigDialog(service, path, route)">
                  <template #prepend>
                    <v-icon color="primary" class="mr-1">mdi-circle-medium</v-icon>
                  </template>
                  {{ route.name }}
                </v-chip>
              </div>
            </v-card-text>

            <!-- 分类标签 -->
            <v-card-text class="pt-0">
              <v-icon size="small" class="mr-1">mdi-tag-outline</v-icon>
              <v-chip size="x-small" variant="flat" class="category-chip" color="grey">
                {{ getServiceCategory(service) }}
              </v-chip>
            </v-card-text>

            <!-- 维护者信息 -->
            <v-card-text class="maintainers pt-0">
              <v-icon size="small" class="mr-1">mdi-account-group-outline</v-icon>
              <template v-for="maintainer in getServiceMaintainers(service.key)" :key="maintainer">
                <span class="maintainer">@{{ maintainer }}</span>
              </template>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <div class="text-center ma-8">
        <v-btn variant="text" href="https://rsshub.app/" target="_blank">该列表由rsshub驱动</v-btn>
      </div>
    </v-container>

    <!-- 配置对话框 -->
    <v-dialog v-model="configDialog.show" max-width="700px">
      <v-card v-if="configDialog.service" class="rounded-lg">
        <v-card-title class="d-flex align-center pa-6" :style="{
          backgroundColor:
            iconColors.get(configDialog.service.url) || 'rgba(0, 0, 0, 0.3)',
        }">
          <v-avatar :image="getServiceIcon(configDialog.service.url)" :alt="configDialog.service.name" size="26"
            class="service-icon mr-2" />
          {{ configDialog.service.name }}
          <v-spacer></v-spacer>
          <v-select v-model="configDialog.route.path" :items="Object.entries(getServiceRoutes(configDialog.service.key)).map(
            ([path, route]) => ({
              title: route.name,
              value: path,
            })
          )
            " item-title="title" item-value="value" density="compact" hide-details class="route-select mx-4"
            @update:model-value="switchRoute" />
          <v-btn icon="mdi-close" variant="text" @click="configDialog.show = false" title="关闭">
          </v-btn>
        </v-card-title>
        <v-card-text>
          <rss-editor :service-key="configDialog.service?.key || ''" :route-path="configDialog.route.path"
            @close="configDialog.show = false" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import RssEditor from "./RssEditor.vue";
import ColorThief from "colorthief";

interface Service {
  name: string;
  url: string;
  routes: Record<string, any>;
  description?: string;
  categories?: string[];
}

const jsonData = ref<Record<string, Service>>();
const searchQuery = ref("");
const configDialog = ref({
  show: false,
  service: null as {
    key: string;
    name: string;
    description?: string;
    url: string;
  } | null,
  route: { path: "", name: "" },
});

// 添加一个 Map 来存储图标颜色
const iconColors = ref(new Map<string, string>());

// 过滤后的服务列表
const filteredServices = computed(() => {
  if (!jsonData.value) return [];

  const query = searchQuery.value.toLowerCase();
  return Object.entries(jsonData.value)
    .map(([key, service]) => ({
      key,
      name: service.name,
      description: service.description,
      categories: Object.entries(service.routes)
        .map(([_, route]) => route.categories)
        .flat(),
      url: service.url,
    }))
    .filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query) ||
        service.url.toLowerCase().includes(query) ||
        service.categories?.some((category: string) =>
          category.toLowerCase().includes(query)
        )
    )
    .sort((a, b) => a.name.localeCompare(b.name));
});

// 获取服务的路由列表
const getServiceRoutes = (serviceKey: string) => {
  if (!jsonData.value?.[serviceKey]) return {};
  return jsonData.value[serviceKey].routes;
};

// 获取服务图标
const getServiceIcon = (url: string) => {
  return `https://unavatar.webp.se/${url}?fallback=false`;
};

// 添加获取图标背景色的方法
const getIconBackground = (url: string, img: HTMLImageElement) => {
  if (iconColors.value.has(url)) {
    return iconColors.value.get(url);
  }

  try {
    const colorThief = new ColorThief();
    const color = colorThief.getColor(img);
    const backgroundColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`;
    iconColors.value.set(url, backgroundColor);
    return backgroundColor;
  } catch (error) {
    console.error("获取图标颜色失败:", error);
    return "rgba(0, 0, 0, 0.3)"; // 默认背景色
  }
};

// 获取服务分类
const getServiceCategory = (service: { categories?: string[] }) => {
  if (!service.categories?.length) return "未分类";
  return service.categories[0];
};

// 获取服务维护者
const getServiceMaintainers = (serviceKey: string) => {
  // 从路由中获取维护者信息
  const routes = getServiceRoutes(serviceKey);
  const maintainers = new Set<string>();
  Object.values(routes).forEach((route: any) => {
    if (route.maintainers?.length) {
      route.maintainers.forEach((maintainer: string) =>
        maintainers.add(maintainer)
      );
    }
  });
  return Array.from(maintainers);
};

// 打开配置对话框
const openConfigDialog = (
  service: {
    key: string;
    name: string;
    description?: string;
    url: string;
  },
  path: string,
  route: any
) => {
  configDialog.value = {
    show: true,
    service,
    route: {
      path,
      name: route.name,
    },
  };
};

// 添加路由切换方法
const switchRoute = (path: string) => {
  const routes = getServiceRoutes(configDialog.value.service?.key || "");
  const route = routes[path];
  if (route) {
    configDialog.value.route = {
      path,
      name: route.name,
    };
  }
};

// 加载配置数据
const loadData = async () => {
  try {
    const response = await fetch("/data.json");
    const data = await response.json();
    jsonData.value = data.data;
  } catch (error) {
    console.error("加载配置数据失败:", error);
  }
};

// 初始化
loadData();
let observer: MutationObserver | null = null;
// 添加图片加载监听
onMounted(() => {
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLImageElement) {
          const url =
            node?.parentElement?.parentElement?.getAttribute("data-url");
          if (url && !iconColors.value.has(url)) {
            node.crossOrigin = "anonymous";
            if (node.complete) {
              getIconBackground(url, node);
            } else {
              node.onload = () => getIconBackground(url, node);
            }
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped>
/* .search-row {
  position: sticky;
  top: 0;
  z-index: 100;
} */
.rss-list {
  padding: 20px;
}

.service-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.service-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.service-icon {
  border-radius: 0;
}

.route-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.route-chip {
  font-size: 0.85rem;
}

.category-chip {
  font-size: 0.75rem;
}

.maintainers {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

.maintainer {
  margin-right: 8px;
}

:deep(.v-card-item) {
  padding: 16px 16px 0;
  transition: background-color 0.3s ease;
}

:deep(.v-card-text) {
  padding-top: 8px;
  padding-bottom: 8px;
}

.route-select {
  max-width: 200px;
}
</style>
