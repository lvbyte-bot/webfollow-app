<template>
  <v-dialog v-model="modelValue" max-width="600">
    <v-card>
      <v-card-title class="text-h5">
        快捷键帮助
        <v-spacer></v-spacer>
        <v-btn icon @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-list>
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
            <v-list-item-title>Esc</v-list-item-title>
            <v-list-item-subtitle>退出阅读模式</v-list-item-subtitle>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-subheader>列表模式</v-list-subheader>
          <v-list-item>
            <v-list-item-title>Ctrl + Alt + K</v-list-item-title>
            <v-list-item-subtitle>打开搜索</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Ctrl + Alt + R</v-list-item-title>
            <v-list-item-subtitle>刷新订阅</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Ctrl + Alt + ?</v-list-item-title>
            <v-list-item-subtitle>打开帮助</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>↑↓ 方向键</v-list-item-title>
            <v-list-item-subtitle>选择上/下一篇文章</v-list-item-subtitle>
          </v-list-item>
        </v-list>
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
