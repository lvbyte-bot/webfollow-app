<template>
  <v-container class="pa-6 text-center">
    <!-- Header: Logo, Name, Copyright -->
    <div class="d-flex flex-column align-center justify-center pt-8 pb-4">
      <v-img src="/logo.svg" width="96px" class="mb-4"></v-img>
      <h1 class="text-h4 font-weight-bold">IFeed</h1>
      <div class="text-body-2 text-medium-emphasis mt-2">
        Copyright © 2025 IFeed. 保留所有权利。
      </div>
    </div>

    <!-- Environment Info -->
    <div class="d-flex align-center justify-center ga-2 mb-8">
      <v-chip size="small" variant="tonal" label>
        version 0.8.7
      </v-chip>
      <!-- <v-btn size="small" variant="text" prepend-icon="mdi-content-copy">
        复制环境
      </v-btn> -->
    </div>

    <!-- Links Section -->
    <div class="text-left">
      <v-list class="bg-transparent">
        <v-list-item href="https://github.com/weekend-project-space/webfollow-app/commits" target="_blank" title="更新日志"
          subtitle="查看每个版本的新功能">
          <template v-slot:append>
            <v-icon>mdi-open-in-new</v-icon>
          </template>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <!-- <v-list-item href="#" target="_blank" title="服务条款">
          <template v-slot:append>
            <v-icon>mdi-open-in-new</v-icon>
          </template>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <v-list-item href="#" target="_blank" title="隐私政策">
          <template v-slot:append>
            <v-icon>mdi-open-in-new</v-icon>
          </template>
        </v-list-item> -->
      </v-list>
    </div>

    <!-- Resources and Contribution -->
    <div class="text-left mt-8">
      <h2 class="text-subtitle-1 font-weight-bold">资源与贡献</h2>
      <p class="text-body-2 text-medium-emphasis mt-2">
        IFeed是一个基于RSS fever api 协议的开源阅读器，未来将支持google reader 等开放RSS api协议, 集成AI能力。
      </p>
      <p class="text-body-2 text-medium-emphasis mt-2">
        IFeed 采用 GNU 通用公共许可证第3版授权，并附有额外的例外条款。
      </p>
    </div>

    <!-- Social Media -->
    <div class="text-left mt-8">
      <h2 class="text-subtitle-1 font-weight-bold">社交媒体</h2>
      <div class="d-flex ga-4 mt-2">
        <v-btn href="https://github.com/weekend-project-space/webfollow-app" target="_blank" icon="mdi-github"
          variant="text"></v-btn>
        <v-btn href="https://zhidayingxiao.cn/to/06g6x1" target="_blank" icon="mdi-qqchat" variant="text"></v-btn>
        <!-- <v-btn href="#" target="_blank" icon="mdi-twitter" variant="text"></v-btn> -->
      </div>
    </div>

  </v-container>
</template>

<script lang="ts" setup>
// 这里可以添加任何需要的逻辑
</script>

<style scoped>
.v-list-item {
  --v-list-item-title-font-size: 1rem;
}
</style>
