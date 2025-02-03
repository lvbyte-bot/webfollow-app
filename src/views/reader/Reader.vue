<template>
  <Teleport defer :to="to ? to : '.main-reader'">
    <v-dialog-transition>
      <div
        class="cover"
        v-show="modelValue"
        :class="{ reading: modelValue, 'cover-main': to }"
      >
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
              <template v-if="entryList.length">
                <c-btn
                  :disabled="currentItemIndex == 0"
                  variant="text"
                  icon="mdi-chevron-up"
                  title="上一篇文章"
                  @click="openReader?.(currentItemIndex - 1, undefined)"
                  class="mr-2 entry-prev"
                ></c-btn>
                <c-btn
                  :disabled="currentItemIndex + 1 == items?.length"
                  variant="text"
                  icon="mdi-chevron-down"
                  title="下一篇文章"
                  @click="openReader?.(currentItemIndex + 1, undefined)"
                  class="entry-next"
                ></c-btn>
              </template>
            </template>
            <template #header>
              <div
                class="entry-list"
                v-if="!entryListDisable && entryList.length"
              >
                <ul>
                  <li
                    v-for="(item0, index) in entryList"
                    @click="openReader?.(index, undefined)"
                    :class="{ active: item0.id == item.id }"
                    :key="item0.id"
                    :title="item0.title"
                  >
                    <v-icon :color="item0.isRead ? 'grey' : 'primary'">
                      {{ item0.isRead ? "" : "mdi-circle-medium" }}
                    </v-icon>
                    {{ item0.title }}
                  </li>
                </ul>
              </div>
            </template>
            <template #footer>
              <v-empty-state
                v-if="
                  entryList.length &&
                  currentItemIndex + 1 != items?.length &&
                  item.type == 'BASIC'
                "
              >
                <v-btn
                  variant="text"
                  @click="openReader?.(currentItemIndex + 1, undefined)"
                >
                  <template #prepend>
                    <v-icon> mdi mdi-page-next-outline </v-icon>
                  </template>
                  下一个篇文章
                </v-btn>
              </v-empty-state>
            </template>
          </Reader>
        </template>
      </div>
    </v-dialog-transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import Reader from "./Index.vue";
import { FeedItem } from "@/service/types";
import { useRoute } from "vue-router";
import { useImgPreview } from "@/utils/useImgPreview";

const props = defineProps<{
  item: FeedItem | undefined;
  items?: FeedItem[];
  modelValue: boolean;
  entryListDisable?: boolean;
  openReader?: (index: number, item?: FeedItem) => void;
  to?: string;
}>();

const emit = defineEmits(["update:modelValue"]);
const route = useRoute();
useImgPreview();

const currentItemIndex = computed(() =>
  props.item
    ? props.items?.findIndex((item) => item.id == props.item?.id) || 0
    : 0
);

const entryList = computed(() =>
  props.item ? getSurroundingItems(props.items || [], props.item) : []
);

function getSurroundingItems(
  array: FeedItem[],
  currentItem0: FeedItem,
  range = 7
) {
  let index = 0;
  for (let i = 0; i < array.length; i++) {
    if (currentItem0.id == array[i].id) {
      index = i;
      continue;
    }
  }
  const start = Math.max(0, index - range);
  const end = Math.min(array.length, index + range + 1);
  return array.slice(start, end);
}
onMounted(() => {
  watch(
    route,
    () => {
      emit("update:modelValue", false);
    },
    { immediate: true }
  );
});
</script>
<style lang="scss" scoped>
.cover {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
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
.cover-main {
  position: fixed;
  top: 0;
  left: var(--v-layout-left);
  width: calc(100% - var(--v-layout-left) - var(--v-layout-right));
  height: 100%;
  z-index: 1001;
}
.entry-list {
  position: absolute;
  top: 6rem;
  left: 0.5rem;
  width: 300px;
  min-height: 36vh;
  transition: transform 0.3s ease;

  transform: translateX(-0.5rem);
  &:hover {
    transform: translateX(0);
  }
}
</style>
<style lang="scss">
.chapter-list,
.entry-list {
  padding: 0.5rem 0.8rem;
  border-radius: 0.5rem;
  z-index: 1;
  color: rgba(var(--v-theme-on-code), 0.26);
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0);
  img {
    height: 1.1rem;
    margin: 0;
    padding: 0;
  }
  ul {
    list-style: none;
    font-size: 12px;
    // line-height: 24px;
    line-height: 24px;
    li {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
      > * {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      &:hover {
        color: rgb(var(--v-theme-primary));
        cursor: pointer;
      }
    }
  }
  .active {
    color: rgb(var(--v-theme-primary));
  }
  &:hover {
    max-width: none;
    color: rgba(var(--v-theme-on-code), 0.5);
  }
}
@media (max-width: 1280px) {
  .entry-list {
    display: none;
    background: rgb(var(--v-theme-background));
  }
}
@media (min-width: 1281px) {
  .chapter-list,
  .entry-list {
    ul > li {
      background-color: rgb(var(--v-theme-on-code), 0.05);
      border-radius: 0.2rem;
      width: 4rem;
      height: 4px;
      text-indent: -99px;
      margin-bottom: 24px;
      &.active {
        background-color: rgba(var(--v-theme-on-code), 0.2);
      }
    }
    ul:hover {
      li {
        width: auto;
        height: auto;
        text-indent: 0;
        // line-height: 1.8rem;
        margin-bottom: 4px;
        background-color: transparent;
        &:hover {
          color: rgb(var(--v-theme-primary));
        }
      }
    }
  }
}
</style>
