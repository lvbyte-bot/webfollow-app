<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', false)" max-width="800">
    <v-card class="pa-2" color="background">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h6">快捷键</div>
        <v-btn icon @click="$emit('update:modelValue', false)" flat>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pt-2">
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-subtitle-1 mb-2">全局</div>
            <v-table density="compact">
              <tbody>
                <tr v-for="(item, i) in globalShortcuts" :key="i">
                  <td class="text-medium-emphasis"><v-icon :icon="item.icon" class="mr-2"></v-icon>{{ item.desc }}</td>
                  <td><v-kbd>{{ item.shortcut }}</v-kbd></td>
                </tr>
              </tbody>
            </v-table>
            <div class="text-subtitle-1 mb-2 mt-4">列表页面</div>
            <v-table density="compact">
              <tbody>
                <tr v-for="(item, i) in listShortcuts" :key="i">
                  <td class="text-medium-emphasis"><v-icon :icon="item.icon" class="mr-2"></v-icon>{{ item.desc }}</td>
                  <td><v-kbd>{{ item.shortcut }}</v-kbd></td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-subtitle-1 mb-2">阅读页面</div>
            <v-table density="compact">
              <tbody>
                <tr v-for="(item, i) in readingShortcuts" :key="i">
                  <td class="text-medium-emphasis"><v-icon :icon="item.icon" class="mr-2"></v-icon>{{ item.desc }}</td>
                  <td><v-kbd>{{ item.shortcut }}</v-kbd></td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
}>();

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const globalShortcuts = [
  { shortcut: "Ctrl + K | Ctrl + /", desc: "打开搜索", icon: "mdi-magnify" },
  { shortcut: "Ctrl + ?", desc: "打开帮助", icon: "mdi-help-circle-outline" },
  { shortcut: "Ctrl + B", desc: "开关侧边栏", icon: "mdi-dock-left" },
];

const listShortcuts = [
  { shortcut: "N", desc: "下一个未读源", icon: "mdi-arrow-down-bold-circle-outline" },
  { shortcut: "Shift + N", desc: "上一个未读源", icon: "mdi-arrow-up-bold-circle-outline" },
  { shortcut: "A", desc: "添加订阅", icon: "mdi-plus-box-outline" },
  { shortcut: "↑ / ↓", desc: "选择文章", icon: "mdi-swap-vertical" },
  { shortcut: "Enter", desc: "打开文章", icon: "mdi-keyboard-return" },
  { shortcut: "R", desc: "刷新订阅", icon: "mdi-refresh" },
  { shortcut: "M", desc: "全部标为已读", icon: "mdi-check-all" },
  { shortcut: "U", desc: "仅看未读", icon: "mdi-eye-off-outline" },
  { shortcut: "V", desc: "切换视图", icon: "mdi-view-dashboard-outline" },
];

const readingShortcuts = [
  { shortcut: "→", desc: "下一篇文章", icon: "mdi-arrow-right" },
  { shortcut: "←", desc: "上一篇文章", icon: "mdi-arrow-left" },
  { shortcut: "↑", desc: "向上滚动", icon: "mdi-arrow-up" },
  { shortcut: "↓", desc: "向下滚动", icon: "mdi-arrow-down" },
  { shortcut: "PageUp", desc: "上翻一页", icon: "mdi-arrow-up-bold-box-outline" },
  { shortcut: "PageDown", desc: "下翻一页", icon: "mdi-arrow-down-bold-box-outline" },
  { shortcut: "F", desc: "稍后阅读", icon: "mdi-bookmark-outline" },
  { shortcut: "M", desc: "标记已读/未读", icon: "mdi-check" },
  // { shortcut: "W", desc: "加载网页全文", icon: "mdi-web" },
  { shortcut: "I", desc: "内嵌网页", icon: "mdi-compass-outline" },
  { shortcut: "G", desc: "生成总结", icon: "mdi-creation-outline" },
  { shortcut: "V", desc: "打开原文", icon: "mdi-open-in-new" },
  { shortcut: "Esc", desc: "退出阅读", icon: "mdi-keyboard-esc" },
];

</script>

<style scoped>
td {
  padding: 8px 16px !important;
}
</style>
