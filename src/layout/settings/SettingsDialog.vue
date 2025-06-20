<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', false)">
    <Settings :activeMenu="activeMenu" @onclose="$emit('update:modelValue', false)"></Settings>
  </v-dialog>
</template>

<script setup lang="ts">
import Settings from './Settings.vue';
defineProps<{
  modelValue: boolean;
  activeMenu: string;
}>();

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();
</script>
