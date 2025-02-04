<template>
  <v-dialog v-model="dialogVisible" max-width="400" @keydown="handleKeydown">
    <v-card>
      <v-card-title class="text-h6">{{ title }}</v-card-title>
      <v-card-text>
        {{ message }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="cancel"
          >n取消</v-btn
        >
        <v-btn color="primary" variant="text" @click="confirm">y确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from "vue";

const props = defineProps<{
  title?: string;
  message: string;
  modelValue?: boolean;
}>();

const emit = defineEmits(["confirm", "cancel", "update:modelValue"]);

const dialogVisible = computed({
  get: () => props.modelValue ?? false,
  set: (value) => emit("update:modelValue", value),
});

const confirm = () => {
  dialogVisible.value = false;
  emit("confirm");
};

const cancel = () => {
  dialogVisible.value = false;
  emit("cancel");
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!dialogVisible.value) return;
  e.stopPropagation();
  if (e.key.toLowerCase() === "y") {
    confirm();
  } else if (e.key.toLowerCase() === "n") {
    cancel();
  }
};

// 全局键盘事件监听
const handleGlobalKeydown = (e: KeyboardEvent) => {
  handleKeydown(e);
};

onMounted(() => {
  window.addEventListener("keydown", handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeydown);
});
</script>
