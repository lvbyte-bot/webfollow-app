<template>
  <v-container>
    <!-- 主题设置 -->
    <v-card class="mb-0">
      <v-card-title>主题</v-card-title>
      <v-card-text>
        <!-- 主题模式选择 -->
        <div class="d-flex align-center mb-8 justify-space-between">
          <span>主题模式</span>
          <v-btn-toggle v-model="data.themeMode" mandatory rounded="pill" density="comfortable">
            <v-btn value="system">
              <v-icon start>mdi-monitor</v-icon>
              跟随系统
            </v-btn>
            <v-btn value="light">
              <v-icon start>mdi-white-balance-sunny</v-icon>
              浅色
            </v-btn>
            <v-btn value="dark">
              <v-icon start>mdi-moon-waning-crescent</v-icon>
              深色
            </v-btn>
          </v-btn-toggle>
        </div>
        <div class="d-flex align-center mb-4 justify-space-between">
          <span>主题色</span>
          <v-select v-model="data.themeColor" :items="themeColors" label="主题色" variant="outlined" density="comfortable"
            hide-details :max-width="260">
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
      </v-card-text>
    </v-card>

    <!-- 字体设置 -->
    <v-card class="mb-4">
      <v-card-title>字体</v-card-title>
      <v-card-text>
        <div class="d-flex align-center mb-4 justify-space-between">
          <span>系统字体</span>
          <v-select v-model="data.fontFamily" :items="fontFamilies" variant="outlined" density="comfortable"
            hide-details :max-width="260">
            <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <v-list-item-title :style="{ fontFamily: item.value }">
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-select>
        </div>

        <div class="d-flex align-center mb-4 justify-space-between">
          <span>代码字体</span>
          <v-select v-model="data.codeFont" :items="codeFonts" variant="outlined" density="comfortable" hide-details
            :max-width="260">
            <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <v-list-item-title :style="{ fontFamily: item.value }">
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-select>
        </div>
      </v-card-text>
    </v-card>

    <!-- 文字大小设置 -->
    <v-card class="mb-4">
      <v-card-title>文字大小</v-card-title>
      <v-card-text>
        <div class="d-flex align-center mb-4 justify-space-between">
          <span>基础字号</span>
          <v-slider v-model="data.fontSize" :min="12" :max="20" :step="1" thumb-label class="w-75" max-width="250">
            <template v-slot:thumb-label="{ modelValue }">
              {{ modelValue }}px
            </template>
          </v-slider>
        </div>

        <div class="text-preview pa-3 rounded" :style="{ fontSize: `${data.fontSize}px` }">
          预览文本效果
          <div class="text-caption">当前字号: {{ data.fontSize }}px</div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 显示密度设置 -->
    <v-card class="mb-4">
      <v-card-title>显示密度</v-card-title>
      <v-card-text>
        <div class="d-flex align-center mb-4 justify-space-between">
          <span>界面密度</span>
          <v-select v-model="data.density" :items="densityOptions" variant="outlined" density="comfortable" hide-details
            :max-width="260">
            <template v-slot:selection="{ item }">
              {{ item.title }}
            </template>
            <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </template>
          </v-select>
        </div>
      </v-card-text>
    </v-card>

    <!-- 其它设置 -->
    <v-card class="mb-4">
      <v-card-title>其它</v-card-title>
      <v-card-text>
        <div class="d-flex align-center justify-space-between">
          <span>减少动画效果</span>
          <v-switch v-model="data.lessAnimation" color="primary" hide-details />
        </div>
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

const { appearance: data } = storeToRefs(settingsStore);

// 主题颜色选项
const themeColors = [
  { title: "蓝色", value: "25, 118, 210", color: "blue" },
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
