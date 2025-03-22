<template>
  <v-app>
    <!-- 使用 v-dialog 创建弹框 -->
    <v-dialog
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', false)"
      max-width="500px"
    >
      <v-card>
        <!-- 标题部分 -->
        <v-card-title class="d-flex justify-space-between align-center">
          <span>订阅源选项</span>
          <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <!-- 内容部分 -->
        <v-card-text>
          <!-- 图标和描述 -->
          <div class="text-center align-center mb-4">
            <v-img
              :src="feed?.icon"
              max-width="30"
              class="mx-auto mb-5"
            ></v-img>
            <div class="mb-4" v-text="feed?.title"></div>
          </div>

          <div class="my-4">未读文章: {{ feed?.unreadQty }}</div>
          <!-- 网站和 RSS 链接 -->
          <div>
            <v-subheader>网站</v-subheader>
            <br />
            <a :href="feed?.siteUrl" target="_blank" v-text="feed?.siteUrl"></a>
            <br />
            <br />
            <v-subheader class="mt-2">RSS</v-subheader>
            <br />
            <a :href="feed?.url" target="_blank" v-text="feed?.url"></a>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { SubscriptionFeed } from "@/service/types";
defineProps<{
  modelValue: boolean;
  feed: SubscriptionFeed | undefined;
}>();

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();
</script>

<style scoped>
/* 自定义样式 */
.v-card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.v-subheader {
  font-size: 1rem;
  font-weight: bold;
  color: #000;
}

a {
  text-decoration: none;
  color: #1976d2;
}

a:hover {
  text-decoration: underline;
}

.v-btn--error {
  background-color: #ff5252 !important;
  color: white !important;
}
</style>
