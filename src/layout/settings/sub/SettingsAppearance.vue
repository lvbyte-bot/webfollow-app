<template>
  <v-container class="pa-6">
    <div class="mb-6">
      <h2 class="text-h6">主题</h2>
      <div class="d-flex justify-space-between align-center mt-4">
        <div>
          <div class="text-subtitle-1">主题模式</div>
          <div class="text-caption text-medium-emphasis">选择浅色、深色或跟随系统设置。</div>
        </div>
        <v-btn-toggle v-model="data.themeMode" mandatory rounded="pill" density="compact">
          <v-btn value="system" size="small">
            <v-icon start>mdi-monitor</v-icon>
            跟随系统
          </v-btn>
          <v-btn value="light" size="small">
            <v-icon start>mdi-white-balance-sunny</v-icon>
            浅色
          </v-btn>
          <v-btn value="dark" size="small">
            <v-icon start>mdi-moon-waning-crescent</v-icon>
            深色
          </v-btn>
        </v-btn-toggle>
      </div>
      <v-divider class="my-4"></v-divider>
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-subtitle-1">主题色</div>
          <div class="text-caption text-medium-emphasis">为应用选择一个强调色。</div>
        </div>
        <v-select v-model="data.themeColor" :items="themeColors" variant="outlined" density="compact" hide-details style="max-width: 200px;">
          <template v-slot:selection="{ item }">
            <v-icon :color="value2color(item.value)" class="mr-2">mdi-circle</v-icon>
            {{ item.title }}
          </template>
          <template v-slot:item="{ item, props }">
            <v-list-item v-bind="props">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-select>
      </div>
    </div>

    <div class="mb-6">
      <h2 class="text-h6">字体</h2>
      <div class="d-flex justify-space-between align-center mt-4">
        <div>
          <div class="text-subtitle-1">系统字体</div>
          <div class="text-caption text-medium-emphasis">选择应用界面的主要字体。</div>
        </div>
        <v-select v-model="data.fontFamily" :items="fontFamilies" variant="outlined" density="compact" hide-details style="max-width: 200px;">
           <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <v-list-item-title :style="{ fontFamily: item.value }">
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
            </template>
        </v-select>
      </div>
      <v-divider class="my-4"></v-divider>
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-subtitle-1">代码字体</div>
          <div class="text-caption text-medium-emphasis">为代码块选择等宽字体。</div>
        </div>
        <v-select v-model="data.codeFont" :items="codeFonts" variant="outlined" density="compact" hide-details style="max-width: 200px;">
           <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <v-list-item-title :style="{ fontFamily: item.value }">
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
            </template>
        </v-select>
      </div>
    </div>

    <div class="mb-6">
      <h2 class="text-h6">显示</h2>
       <div class="mt-4">
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="text-subtitle-1">基础字号</div>
            <div class="text-caption text-medium-emphasis">调整应用内的基础字体大小。</div>
          </div>
           <div class="text-caption">{{ data.fontSize }}px</div>
        </div>
        <v-slider v-model="data.fontSize" :min="12" :max="20" :step="1" class="mt-2" hide-details></v-slider>
      </div>
      <v-divider class="my-4"></v-divider>
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-subtitle-1">界面密度</div>
          <div class="text-caption text-medium-emphasis">调整UI元素的间距和大小。</div>
        </div>
        <v-select v-model="data.density" :items="densityOptions" variant="outlined" density="compact" hide-details style="max-width: 200px;"></v-select>
      </div>
       <v-divider class="my-4"></v-divider>
       <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-body-1">减少动画</div>
          <div class="text-caption text-medium-emphasis">禁用或减少界面中的过渡动画。</div>
        </div>
        <v-switch v-model="data.lessAnimation" color="primary" hide-details></v-switch>
      </div>
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

const { appearance: data } = storeToRefs(settingsStore);

// 主题颜色选项
const themeColors = [
  // { title: "蓝色", value: "25, 118, 210", color: "blue" },
  { title: "蓝色", value: "2, 114, 203", color: "#0272cb" },
  { title: "绿色", value: "39, 174, 96", color: "#27AE60" },
  { title: "紫色", value: "123, 31, 162", color: "purple" },
  { title: "橙色", value: "245, 124, 0", color: "orange" },
  { title: "红色", value: "211, 47, 47", color: "red" },
];

// 显示密度选项
const densityOptions = [
  { title: "舒适", value: "comfortable", icon: "mdi-format-align-justify" },
  { title: "紧凑", value: "compact", icon: "mdi-format-align-center" },
  { title: "默认", value: "default", icon: "mdi-format-align-left" },
];

function value2color(value: string) {
  return themeColors.filter((t) => t.value == value)[0].color;
}
// 字体选项
const fontFamilies = [
  {
    title: "系统默认",
    value: "system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, SN Pro",
  },
  { title: "微软雅黑", value: "Microsoft YaHei" },
  { title: "苹方", value: "PingFang SC" },
  { title: "思源黑体", value: "Noto Sans SC" },
];

const codeFonts = [
  { title: "Fira Code", value: "Fira Code" },
  { title: "JetBrains Mono", value: "JetBrains Mono" },
  { title: "Source Code Pro", value: "Source Code Pro" },
  { title: "Consolas", value: "Consolas" },
];

// 方法定义
const saveSettings = () => {
  settingsStore.saveToLocalStorage();
};

const resetSettings = () => {
  settingsStore.resetAppearanceSettings();
};
</script>

<style scoped>
.text-preview {
  border: 1px solid rgb(var(--v-theme-kbd));
  background-color: rgb(var(--v-theme-code));
  min-height: 100px;
}
</style>
