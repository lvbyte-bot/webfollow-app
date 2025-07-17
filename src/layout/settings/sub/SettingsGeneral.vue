<template>
  <v-container>
    <!-- 开始页设置 -->
    <v-card class="mb-4" flat>
      <v-card-title>开始页</v-card-title>
      <v-card-text>
        <div class="d-flex align-center justify-space-between">
          <label>选择开始页</label>
          <v-select v-model="data.startPage" :items="startPageOptions" variant="outlined" density="comfortable"
            hide-details :max-width="200"></v-select>
        </div>
      </v-card-text>
    </v-card>

    <!-- 默认视图设置 -->
    <v-card class="mb-4" flat>
      <v-card-title>默认视图</v-card-title>
      <v-card-text>
        <div class="d-flex align-center justify-space-between">
          <label>选择默认视图</label>
          <v-select v-model="data.defaultView" :items="viewOptions" variant="outlined" density="comfortable"
            hide-details :max-width="200">
            <template v-slot:selection="{ item }">
              <v-icon :icon="getViewIcon(item.value)" class="mr-2"></v-icon>
              {{ item.title }}
            </template>
            <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-icon :icon="getViewIcon(item.value)"></v-icon>
                </template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </template>
          </v-select>
        </div>
      </v-card-text>
    </v-card>

    <!-- 隐藏已读文章设置 -->
    <v-card class="mb-4" flat>
      <v-card-title>隐藏已读文章</v-card-title>
      <v-card-text>
        <div class="d-flex align-center justify-space-between">
          <label>自动隐藏已读文章</label>
          <v-switch v-model="data.hideReadArticles" color="primary" hide-details></v-switch>
        </div>
      </v-card-text>
    </v-card>

    <!-- 列表AI总结设置 -->
    <v-card class="mb-4" flat>
      <v-card-title>列表AI总结</v-card-title>
      <v-card-text>
        <div class="d-flex align-center justify-space-between">
          <label>在列表视图中显示AI总结</label>
          <v-switch v-model="data.enableListAISummary" color="primary" hide-details></v-switch>
        </div>
        <div class="text-caption text-medium-emphasis mt-2">
          注意：启用此功能可能会增加API调用次数
        </div>
      </v-card-text>
    </v-card>

    <!-- 自动阅读设置 -->
    <v-card class="mb-4" flat>
      <v-card-title>列表滚动标记为已读</v-card-title>
      <v-card-text>
        <div class="d-flex align-center justify-space-between">
          <label>启用列表滚动标记为已读</label>
          <v-switch v-model="data.autoRead" color="primary" hide-details></v-switch>
        </div>
      </v-card-text>
    </v-card>

    <!-- 自动刷新设置 -->
    <v-card class="mb-4" flat>
      <v-card-title>自动刷新</v-card-title>
      <v-card-text>
        <div class="d-flex align-center justify-space-between">
          <label>启用自动刷新</label>
          <v-switch v-model="data.autoRefresh" color="primary" hide-details></v-switch>
        </div>
        <v-select v-if="data.autoRefresh" v-model="data.refreshInterval" :items="refreshIntervals" label="刷新间隔"
          variant="outlined" density="comfortable" class="mt-2"></v-select>
      </v-card-text>
    </v-card>

    <!-- 保存按钮 -->
    <v-row>
      <v-col>
        <v-btn color="primary" @click="saveSettings" class="mr-2">
          保存设置
          <v-icon right class="ml-2">mdi-content-save</v-icon>
        </v-btn>
        <v-btn color="error" variant="outlined" @click="resetSettings">
          重置默认
          <v-icon right class="ml-2">mdi-refresh</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { useSettingsStore } from "@/store";
import { storeToRefs } from "pinia";
const settingsStore = useSettingsStore();
const { general: data } = storeToRefs(settingsStore);

// 定义开始页选项
const startPageOptions = [
  { title: "欢迎页", value: "welcome" },
  { title: "今天", value: "explore" },
  { title: "全部文章", value: "all" },
  { title: "稍后阅读", value: "next" },
  { title: "第一个文件夹", value: "firstfolder" }
];

// 定义视图选项
const viewOptions = [
  { title: "跟随文章", value: "auto" },
  { title: "列表视图", value: "list" },
  { title: "卡片视图", value: "card" },
  { title: "三栏视图", value: "column" },
  { title: "杂志视图", value: "magazine" },
  { title: "清单视图", value: "text" }
];

// 获取视图图标
const getViewIcon = (value: string) => {
  const icons: Record<string, string> = {
    auto: "mdi-view-dashboard-outline",
    list: "mdi-list-box-outline",
    card: "mdi-view-grid-outline",
    column: "mdi-view-column-outline",
    magazine: "mdi-view-sequential-outline",
    text: "mdi-text-box-outline"
  };
  return icons[value] || "";
};

// 定义选项数组
const refreshIntervals = [
  { title: "5分钟", value: 5 * 60 },
  { title: "15分钟", value: 15 * 60 },
  { title: "30分钟", value: 30 * 60 },
  { title: "1小时", value: 60 * 60 },
  { title: "2小时", value: 2 * 60 * 60 },
];

// 方法定义
const saveSettings = () => {
  settingsStore.saveToLocalStorage();
};

const resetSettings = () => {
  settingsStore.resetGeneralSettings();
};
</script>
