<template>
  <v-container class="pa-6">
    <div class="mb-6">
      <h2 class="text-h6">OpenAI 接口设置</h2>
      <div class="mt-4">
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="text-subtitle-1">API 地址</div>
            <div class="text-caption text-medium-emphasis">自定义 OpenAI API 地址，如反向代理。</div>
          </div>
          <v-text-field v-model="data.apiUrl" variant="outlined" density="compact" hide-details
            placeholder="https://api.openai.com/v1" style="max-width: 300px;"></v-text-field>
        </div>
      </div>
      <v-divider class="my-4"></v-divider>
      <div class="mt-4">
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="text-subtitle-1">API Key</div>
            <div class="text-caption text-medium-emphasis">您的 OpenAI API 密钥。</div>
          </div>
          <v-text-field v-model="data.apiKey" variant="outlined" density="compact" hide-details placeholder="sk-..."
            :type="showKey ? 'text' : 'password'" :append-inner-icon="showKey ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showKey = !showKey" @focus="handleFocus"
            :hint="showHint ? '检测到剪贴板中有 API Key，按 Ctrl+V 粘贴' : ''" persistent-hint
            style="max-width: 300px;"></v-text-field>
        </div>
        <div class="d-flex mt-2">
          <v-btn color="info" size="small" :loading="testing" @click="testConnection">
            <v-icon v-if="data.isApiValid" left color="success" class="mr-2">mdi-check-circle</v-icon>
            测试连接
          </v-btn>
          <v-chip v-if="data.lastTestTime" size="small" class="ml-4" :color="data.isApiValid ? 'success' : 'error'">
            上次检测: {{ formatDate(data.lastTestTime) }}
          </v-chip>
        </div>
      </div>
      <v-divider class="my-4"></v-divider>
      <div class="mt-4">
        <div class="d-flex justify-space-between align-start">
          <div>
            <div class="text-subtitle-1">文章总结提示词</div>
            <div class="text-caption text-medium-emphasis">自定义用于生成文章摘要的提示。</div>
          </div>
          <v-textarea v-model="data.summaryPrompt" variant="outlined" rows="4" placeholder="请用简洁的语言总结这篇文章的主要内容..."
            style="max-width: 300px;"></v-textarea>
        </div>
      </div>
      <div v-if="data.isApiValid" class="mt-4">
        <v-divider class="my-4"></v-divider>
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="text-body-1">选择模型</div>
            <div class="text-caption text-medium-emphasis">选择用于AI功能的语言模型。</div>
          </div>
          <div class="d-flex align-center" style="max-width: 300px;">
            <v-select v-model="data.selectedModel" :items="availableModels" variant="outlined" density="compact"
              :loading="loadingModels" :disabled="loadingModels" class="flex-grow-1" hide-details></v-select>
            <v-btn color="primary" variant="text" icon="mdi-refresh" :loading="loadingModels" @click="fetchModels"
              class="ml-2"></v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <v-row>
      <v-col>
        <v-btn color="primary" @click="saveSettings" class="mr-2">
          保存设置
        </v-btn>
        <v-btn color="error" variant="outlined" @click="resetSettings">
          重置默认
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useSettingsStore } from "@/store";
import { storeToRefs } from "pinia";
import { formatDate } from "@/utils/dateFormat";

const settingsStore = useSettingsStore();
const { integrated: data } = storeToRefs(settingsStore);
const showKey = ref(false);
const testing = ref(false);
const loadingModels = ref(false);
const availableModels = ref<string[]>([]);
const showHint = ref(false);

// 获取可用模型列表
const fetchModels = async () => {
  loadingModels.value = true;
  try {
    const response = await fetch(`${data.value.apiUrl}/models`, {
      headers: {
        Authorization: `Bearer ${data.value.apiKey}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      availableModels.value = result.data.map((model: any) => model.id).sort();
    } else {
      throw new Error(response.statusText);
    }
  } catch (error: any) {
    alert(`获取模型列表失败：${error.message}`);
  } finally {
    loadingModels.value = false;
  }
};

// 修改测试连接方法，成功后自动获取模型列表
const testConnection = async () => {
  testing.value = true;
  try {
    const response = await fetch(`${data.value.apiUrl}/models`, {
      headers: {
        Authorization: `Bearer ${data.value.apiKey}`,
      },
    });

    data.value.isApiValid = response.ok;
    data.value.lastTestTime = new Date().toISOString();

    if (response.ok) {
      alert("连接成功！API 配置有效。");
      // 连接成功后自动获取模型列表
      await fetchModels();
    } else {
      alert(`连接失败：${response.statusText}`);
    }
  } catch (error: any) {
    data.value.isApiValid = false;
    data.value.lastTestTime = new Date().toISOString();
    alert(`连接错误：${error.message}`);
  } finally {
    testing.value = false;
  }
};

// 方法定义
const saveSettings = () => {
  settingsStore.saveToLocalStorage();
};

const resetSettings = () => {
  settingsStore.resetIntegratedSettings();
};

// 检查剪贴板内容是否像 API Key
const isApiKeyLike = (text: string) => {
  return text.trim().startsWith("sk-");
};

// 处理输入框获得焦点
const handleFocus = async () => {
  try {
    const text = await navigator.clipboard.readText();
    showHint.value = isApiKeyLike(text);
  } catch (err) {
    console.log("无法读取剪贴板:", err);
  }
};

// 监听粘贴事件
const handlePaste = async (e: ClipboardEvent) => {
  const text = e.clipboardData?.getData("text");
  if (text && isApiKeyLike(text)) {
    e.preventDefault();
    data.value.apiKey = text;
    showHint.value = false;
  }
};

onMounted(() => {
  document.addEventListener("paste", handlePaste);
});

onUnmounted(() => {
  document.removeEventListener("paste", handlePaste);
});
</script>
