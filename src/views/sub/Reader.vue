<template>
  <Teleport defer to=".v-main-top">
    <v-dialog-transition>
      <div class="cover" v-show="modelValue">
        <template v-if="item">
          <Reader :item="item">
            <template #chapter>
              <div id="chapters" class="chapter-list"></div>
            </template>
            <template #prepend-bar>
              <c-btn
                variant="text"
                icon="mdi-close"
                @click="emit('update:modelValue', false)"
                title="关闭"
                class="mr-2"
              ></c-btn>
            </template>
          </Reader>
        </template>
      </div>
    </v-dialog-transition>
  </Teleport>
</template>

<script setup lang="ts">
import Reader from "../reader/Index.vue";
import { FeedItem } from "@/service/types";
defineProps<{
  item: FeedItem | undefined;
  modelValue: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);
</script>
<style lang="scss" scoped>
.cover {
  position: fixed;
  top: 0;
  left: var(--v-layout-left);
  width: calc(100% - var(--v-layout-left) - var(--v-layout-right));
  height: 100%;
  z-index: 1001;
  background-color: rgb(var(--v-theme-background));
  .cover-action {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    padding: 0.8rem;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 2rem;
  }
}
</style>
