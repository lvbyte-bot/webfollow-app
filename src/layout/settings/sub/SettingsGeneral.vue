<template>
  <v-container class="pa-6">
    <div class="mb-6">
      <h2 class="text-h6">自定义</h2>
      <div class="d-flex justify-space-between align-center mt-4">
        <div>
          <div class="text-subtitle-1">开始页</div>
          <div class="text-caption text-medium-emphasis">选择您打开应用时看到的第一个页面。</div>
        </div>
        <v-select v-model="data.startPage" :items="startPageOptions" variant="outlined" density="compact" hide-details
          style="max-width: 200px;"></v-select>
      </div>
      <v-divider class="my-4"></v-divider>
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-subtitle-1">默认视图</div>
          <div class="text-caption text-medium-emphasis">为您所有的订阅源选择默认的文章列表布局。</div>
        </div>
        <v-select v-model="data.defaultView" :items="viewOptions" variant="outlined" density="compact" hide-details
          style="max-width: 200px;">
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
    </div>

    <div class="mb-6">
      <h2 class="text-h6">自动化</h2>
      <div class="d-flex justify-space-between align-center mt-4">
        <div>
          <div class="text-subtitle-1">隐藏已读文章</div>
          <div class="text-caption text-medium-emphasis">自动将您已读的文章从列表中隐藏。</div>
        </div>
        <v-switch v-model="data.hideReadArticles" color="primary" hide-details></v-switch>
      </div>
      <v-divider class="my-4"></v-divider>
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-subtitle-1">列表AI总结</div>
          <div class="text-caption text-medium-emphasis">在文章列表中显示由AI生成的摘要。注意：可能会增加API调用。</div>
        </div>
        <v-switch v-model="data.enableListAISummary" color="primary" hide-details></v-switch>
      </div>
      <v-divider class="my-4"></v-divider>
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-subtitle-1">列表滚动标记为已读</div>
          <div class="text-caption text-medium-emphasis">当您在文章列表视图中向下滚动时，自动将文章标记为已读。</div>
        </div>
        <v-switch v-model="data.autoRead" color="primary" hide-details></v-switch>
      </div>
      <v-divider class="my-4"></v-divider>
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-body-1">自动刷新</div>
          <div class="text-caption text-medium-emphasis">在后台自动为您同步订阅源。</div>
        </div>
        <v-switch v-model="data.autoRefresh" color="primary" hide-details></v-switch>
      </div>
      <v-select v-if="data.autoRefresh" v-model="data.refreshInterval" :items="refreshIntervals" label="刷新间隔"
        variant="outlined" density="compact" class="mt-4" hide-details></v-select>
    </div>

    <!-- 保存按钮 -->
    <v-row>
      <v-col>
        <v-btn color="primary" @click="saveSettings" class="mr-2">
          保存设置
        </v-btn>
        <v-btn color="error" variant="outlined" @click="resetSettings">
          重置默认
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
