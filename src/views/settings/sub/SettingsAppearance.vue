<template>
  <v-container>
    <!-- 主题设置 -->
    <v-card class="mb-4">
      <v-card-title>主题</v-card-title>
      <v-card-text>
        <v-radio-group v-model="data.themeMode" class="mb-4">
          <v-radio value="light" color="primary">
            <template v-slot:label>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-white-balance-sunny</v-icon>
                浅色模式
              </div>
            </template>
          </v-radio>
          <v-radio value="dark" color="primary">
            <template v-slot:label>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-moon-waning-crescent</v-icon>
                深色模式
              </div>
            </template>
          </v-radio>
          <v-radio value="system" color="primary">
            <template v-slot:label>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-desktop-mac</v-icon>
                跟随系统
              </div>
            </template>
          </v-radio>
        </v-radio-group>

        <v-select
          v-model="data.themeColor"
          :items="themeColors"
          label="主题色"
          variant="outlined"
          density="comfortable"
        >
          <template v-slot:selection="{ item }">
            <v-icon :color="value2color(item.value)" class="mr-2"
              >mdi-circle</v-icon
            >
            {{ item.title }}
          </template>
          <template v-slot:item="{ item, props }">
            <v-list-item v-bind="props">
              <!-- <template v-slot:prepend>
                <v-icon :color="value2color(item.value)"">mdi-circle</v-icon>
              </template> -->
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-select>
      </v-card-text>
    </v-card>

    <!-- 字体设置 -->
    <v-card class="mb-4">
      <v-card-title>字体</v-card-title>
      <v-card-text>
        <v-select
          v-model="data.fontFamily"
          :items="fontFamilies"
          label="系统字体"
          variant="outlined"
          density="comfortable"
          class="mb-4"
        >
          <template v-slot:item="{ item, props }">
            <v-list-item v-bind="props">
              <v-list-item-title :style="{ fontFamily: item.value }">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-select>

        <v-select
          v-model="data.codeFont"
          :items="codeFonts"
          label="代码字体"
          variant="outlined"
          density="comfortable"
        >
          <template v-slot:item="{ item, props }">
            <v-list-item v-bind="props">
              <v-list-item-title :style="{ fontFamily: item.value }">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-select>
      </v-card-text>
    </v-card>

    <!-- 文字大小设置 -->
    <v-card class="mb-4">
      <v-card-title>文字大小</v-card-title>
      <v-card-text>
        <v-slider
          v-model="data.fontSize"
          :min="12"
          :max="20"
          :step="1"
          thumb-label
          label="基础字号"
        >
          <template v-slot:thumb-label="{ modelValue }">
            {{ modelValue }}px
          </template>
        </v-slider>

        <div
          class="text-preview pa-4 rounded"
          :style="{ fontSize: `${data.fontSize}px` }"
        >
          预览文本效果
          <div class="text-caption">当前字号: {{ data.fontSize }}px</div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 显示密度设置 -->
    <v-card class="mb-4">
      <v-card-title>显示密度</v-card-title>
      <v-card-text>
        <v-radio-group v-model="data.density" class="mb-4">
          <v-radio value="comfortable" color="primary">
            <template v-slot:label>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-format-align-justify</v-icon>
                舒适
              </div>
            </template>
          </v-radio>
          <v-radio value="compact" color="primary">
            <template v-slot:label>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-format-align-center</v-icon>
                紧凑
              </div>
            </template>
          </v-radio>
          <v-radio value="default" color="primary">
            <template v-slot:label>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-format-align-left</v-icon>
                默认
              </div>
            </template>
          </v-radio>
        </v-radio-group>
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
