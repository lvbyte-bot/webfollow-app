<template>
  <div class="page">
    <h3>添加订阅</h3>
    <v-card prepend-icon="mdi-rss" title="订阅" class="mt-5">
      <v-card-text class="mt-3">
        <v-text-field
          v-model="value"
          label="RSS网址"
          required
          @keyup.enter="add"
        ></v-text-field>

        <div class="text-center mx-auto">
          <v-btn color="primary" :loading="loading" @click="add"> 添加 </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { extFeed } from "@/api";
import { useAppStore } from "@/store";

const appStore = useAppStore();
const loading = ref(false);

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

const value = ref("");
</script>

<style scoped>
.v-card {
  margin-top: 20vh;
}
</style>
