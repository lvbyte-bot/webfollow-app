<template>
  <div>
    <v-container max-width="800">
      <h3 class="text-center ma-12">添加订阅</h3>
      <v-tabs v-model="tab" align-tabs="center">
        <v-tab value="rss">导入RSS</v-tab>
        <v-tab value="ompl">导入OMPL</v-tab>
      </v-tabs>

      <v-card-text class="mt-6">
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="rss">
            <v-text-field
              v-model="value"
              label="RSS网址"
              required
              @keyup.enter="add"
            ></v-text-field>
            <div class="text-center mx-auto">
              <v-btn color="primary" :loading="loading" @click="add">
                添加
              </v-btn>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item value="ompl">
            <v-file-input
              v-model="omplFile"
              label="选择OPML文件"
              accept=".opml"
              @change="importOmpl"
              required
            ></v-file-input>
            <div class="text-center mx-auto">
              <v-btn color="primary" :loading="loading" @click="importOmpl">
                导入OMPL
              </v-btn>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
      <v-btn variant="text" href="https://toprss.webfollow.cc/"
        >看看别人都订阅了啥</v-btn
      ></v-container
    >
    <h3 class="text-center ma-8">订阅列表</h3>
    <rss-list />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { extFeed } from "@/api";
import { useAppStore } from "@/store";

import RssList from "@/views/discover/RssList.vue";
const appStore = useAppStore();
const loading = ref(false);
const value = ref("");
const omplFile = ref(null); // 用于存储OMPL文件
const tab = ref("rss"); // 默认选中导入RSS选项卡

async function add() {
  try {
    loading.value = true;
    await extFeed({ group_id: 0, feed_url: value.value, as: "create" });
    value.value = "";
    setTimeout(() => {
      appStore.sync();
    }, 3000);
  } catch (e) {
    alert("添加失败，请检查源是添加或是否可访问");
  }
  loading.value = false;
}

async function importOmpl() {
  if (!omplFile.value) {
    alert("请先选择OMPL文件");
    return;
  }

  try {
    loading.value = true;
    const formData = new FormData();
    formData.append("file", omplFile.value);
    await extFeed(
      { group_id: 0, as: "import_opml" },
      {
        body: formData,
        method: "POST",
      }
    );
    omplFile.value = null; // 清空文件输入
    setTimeout(() => {
      appStore.sync("sync2local");
    }, 2000);
  } catch (e) {
    // console.log(e);
    alert("导入失败，请检查OMPL文件是否正确");
  }
  loading.value = false;
}
</script>

<style scoped>
.v-card {
  margin-top: 20vh;
}
</style>
