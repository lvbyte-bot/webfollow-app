<template>
  <div class="page">
    <h3>添加订阅</h3>
    <v-card prepend-icon="mdi-rss" class="mt-5">
      <v-card-text>
        <v-text-field v-model="value" label="网址" required></v-text-field>
        <v-btn color="primary" :loading="loading" @click="add"> 添加 </v-btn>
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
  loading.value = true;
  await extFeed({ group_id: 0, feed_url: value.value, as: "create" });
  value.value = "";
  loading.value = false;
  setTimeout(() => {
    appStore.sync();
  }, 3000);
}

const value = ref("");
</script>

<style scoped>
.v-card {
  margin-top: 20vh;
}
</style>
