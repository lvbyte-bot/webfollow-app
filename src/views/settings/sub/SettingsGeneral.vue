<template>
  <v-container>
    <!-- 开始页设置 -->
    <v-card class="mb-4">
      <v-card-title>开始页</v-card-title>
      <v-card-text>
        <v-radio-group v-model="data.startPage">
          <v-radio label="欢迎页" value="welcome"></v-radio>
          <v-radio label="发现页面" value="explore"></v-radio>
          <v-radio label="全部文章" value="all"></v-radio>
          <v-radio label="稍后阅读" value="next"></v-radio>
          <v-radio label="第一个文件夹" value="firstfolder"></v-radio>
        </v-radio-group>
      </v-card-text>
    </v-card>

    <!-- 默认视图设置 -->
    <v-card class="mb-4">
      <v-card-title>默认视图</v-card-title>
      <v-card-text>
        <v-radio-group v-model="data.defaultView">
          <v-radio label="列表视图" value="list">
            <template v-slot:label>
              <div class="d-flex align-center">
                列表视图
                <v-icon class="ml-2">mdi-list-box-outline</v-icon>
              </div>
            </template>
          </v-radio>
          <v-radio label="卡片视图" value="card">
            <template v-slot:label>
              <div class="d-flex align-center">
                卡片视图
                <v-icon class="ml-2">mdi-view-grid-outline</v-icon>
              </div>
            </template>
          </v-radio>
          <v-radio label="三栏视图" value="column">
            <template v-slot:label>
              <div class="d-flex align-center">
                三栏视图
                <v-icon class="ml-2">mdi-view-column-outline </v-icon>
              </div>
            </template>
          </v-radio>
          <v-radio label="杂志视图" value="magazine">
            <template v-slot:label>
              <div class="d-flex align-center">
                杂志视图
                <v-icon class="ml-2">mdi-view-sequential-outline</v-icon>
              </div>
            </template>
          </v-radio>
          <v-radio label="标题视图" value="text">
            <template v-slot:label>
              <div class="d-flex align-center">
                清单视图
                <v-icon class="ml-2">mdi-text-box-outline</v-icon>
              </div>
            </template>
          </v-radio>
        </v-radio-group>
      </v-card-text>
    </v-card>

    <!-- 隐藏已读文章设置 -->
    <v-card class="mb-4">
      <v-card-title>隐藏已读文章</v-card-title>
      <v-card-text>
        <v-switch
          v-model="data.hideReadArticles"
          color="primary"
          label="自动隐藏已读文章"
        ></v-switch>
      </v-card-text>
    </v-card>

    <!-- 自动刷新设置 -->
    <v-card class="mb-4">
      <v-card-title>自动刷新</v-card-title>
      <v-card-text>
        <v-switch
          v-model="data.autoRefresh"
          color="primary"
          label="启用自动刷新"
        ></v-switch>
        <v-select
          v-if="data.autoRefresh"
          v-model="data.refreshInterval"
          :items="refreshIntervals"
          label="刷新间隔"
          variant="outlined"
          density="comfortable"
          class="mt-2"
        ></v-select>
      </v-card-text>
    </v-card>

    <!-- 保存按钮 -->
    <v-row class="mt-4">
      <v-col>
        <v-btn color="primary" @click="saveSettings">
          保存设置
          <v-icon right class="ml-2">mdi-content-save</v-icon>
        </v-btn>
        <v-btn
          color="error"
          variant="outlined"
          class="ml-2"
          @click="resetSettings"
        >
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
