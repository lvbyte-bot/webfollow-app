<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="headline">登录</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="username"
                label="用户名"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="密码"
                type="password"
                required
              ></v-text-field>
              <v-btn type="submit" color="primary">登录</v-btn>
            </v-form>
          </v-card-text>
          <v-card-subtitle>
            <p class="text-center mt-3 mb-3">
              {{ itemsTotal }}条数据都在您本地，没有网络也可以查看
            </p>
          </v-card-subtitle>
        </v-card>
        <v-snackbar v-model="snackbar">
          {{ message }}
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { login } from "@/api";
import { useAppStore } from "@/store";
import { useRouter } from "vue-router";
import { getItemTotal } from "@/service";

const appStore = useAppStore();
const router = useRouter();
const itemsTotal = ref(0);

const snackbar = ref(false);
const message = ref("");
const username = ref("");
const password = ref("");

const showMessage = (msg: string) => {
  message.value = msg; // 设置提示信息
  snackbar.value = true; // 显示 snackbar
};

const handleLogin = async () => {
  const token = CryptoJS.MD5(username.value + ":" + password.value).toString(); // 更新为使用 window.CryptoJS
  const r = await login(token);
  if (r.auth !== 1) {
    showMessage(r.error);
  } else {
    localStorage.setItem(
      "auth",
      JSON.stringify({ username: username.value, token })
    );
    appStore.reloadBuild();
    router.push("/");
  }
};

onMounted(async () => {
  itemsTotal.value = await getItemTotal();
});
</script>

<style scoped>
.v-card {
  margin-top: 20vh;
}
</style>
