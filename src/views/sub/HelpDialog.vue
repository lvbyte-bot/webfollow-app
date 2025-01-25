<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', false)"
    max-width="800"
  >
    <v-card class="rounded-lg" height="75vh">
      <v-card-title class="d-flex justify-space-between">
        <span class="my-2">快捷键帮助</span>
        <v-spacer></v-spacer>
        <v-btn variant="text" icon @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="py-0">
        <v-row>
          <v-col cols="6">
            <v-list-subheader>阅读模式</v-list-subheader>
            <v-list-item>
              <v-list-item-title>← 方向键左</v-list-item-title>
              <v-list-item-subtitle>上一篇文章</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>→ 方向键右</v-list-item-title>
              <v-list-item-subtitle>下一篇文章</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>↑ 方向键上</v-list-item-title>
              <v-list-item-subtitle>向上滚动</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>↓ 方向键下</v-list-item-title>
              <v-list-item-subtitle>向下滚动</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>PageUp</v-list-item-title>
              <v-list-item-subtitle>向上滚动一页</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>PageDown</v-list-item-title>
              <v-list-item-subtitle>向下滚动一页</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>S</v-list-item-title>
              <v-list-item-subtitle>稍后阅读</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>M</v-list-item-title>
              <v-list-item-subtitle>标记为已读/未读</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>I</v-list-item-title>
              <v-list-item-subtitle>内嵌网页</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>G</v-list-item-title>
              <v-list-item-subtitle>生成总结</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>V</v-list-item-title>
              <v-list-item-subtitle>打开原网页</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Esc</v-list-item-title>
              <v-list-item-subtitle>退出阅读模式</v-list-item-subtitle>
            </v-list-item></v-col
          >
          <v-col cols="6">
            <v-list-subheader>全局模式</v-list-subheader>
            <v-list-item>
              <v-list-item-title>CTRL + K | /</v-list-item-title>
              <v-list-item-subtitle>打开搜索</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>CTRL + ?</v-list-item-title>
              <v-list-item-subtitle>打开帮助</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>CTRL + B</v-list-item-title>
              <v-list-item-subtitle>打开/关闭侧边栏</v-list-item-subtitle>
            </v-list-item>
            <br />
            <v-divider></v-divider>
            <br />
            <v-list-subheader>列表模式</v-list-subheader>
            <v-list-item>
              <v-list-item-title>N</v-list-item-title>
              <v-list-item-subtitle>打开下一个未读订阅源</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Shift + N</v-list-item-title>
              <v-list-item-subtitle>打开上一个未读订阅源</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>A</v-list-item-title>
              <v-list-item-subtitle>添加订阅源</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>↑↓ 方向键</v-list-item-title>
              <v-list-item-subtitle>选择上/下一篇文章</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Enter 回车</v-list-item-title>
              <v-list-item-subtitle>打开文章</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>R</v-list-item-title>
              <v-list-item-subtitle>刷新订阅</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>M</v-list-item-title>
              <v-list-item-subtitle>全部标记为已读</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>U</v-list-item-title>
              <v-list-item-subtitle>仅看未读</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>V</v-list-item-title>
              <v-list-item-subtitle>切换视图</v-list-item-subtitle>
            </v-list-item>
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
</script>
