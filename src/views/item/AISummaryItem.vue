<template>
  <v-list-item class="magazine-item py-3" v-bind="$attrs">
    <div class="magazine">
      <div class="magazine-left">
        <m-avatar :src="item.feed?.icon" :name="item.feed?.title" />
        <v-icon :color="item.isRead ? '-' : 'primary'">
          {{ item.isRead ? "" : "mdi-circle-medium" }}
        </v-icon>
      </div>
      <div>
        <div class="magazine-info mb-2">
          <div class="text-body-2 text-truncate text-medium-emphasis">
            <router-link :to="'/f/' + item.feedId" @click.stop="">
              {{ getSource() }}</router-link>
          </div>
          <div class="text-body-2 text-medium-emphasis text-right">
            {{ item.datestr }}
          </div>
        </div>
        <div class="magazine-sec">
          <div class="desc text-ellipsis">
            <template v-if="isLoading">
              <v-skeleton-loader type="heading"></v-skeleton-loader>
              <v-skeleton-loader type="paragraph" class="text-medium-emphasis"></v-skeleton-loader>
            </template>
            <template v-else>
              <p class="mb-2 text-body-1 title">
                {{ item.title }}
              </p>
              <p class="text-medium-emphasis text-body-2">
                {{ summary || item.summary }}
              </p>
            </template>
          </div>
          <div class="text-right mt-2">
            <v-btn v-if="!isLoading" size="small" variant="text" color="primary" @click.stop="handleRetry"
              :loading="isRetrying">
              <template v-slot:prepend>
                <v-icon>mdi-refresh</v-icon>
              </template>
              <span>刷新</span>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </v-list-item>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { generateArticleSummary } from '@/utils/aiSummary';
import { FeedItem } from '@/service/types';

const props = defineProps({
  item: {
    type: Object as () => FeedItem,
    required: true
  },
  type: {
    type: String,
    default: 'f'
  }
});

const emit = defineEmits(['retry']);

const isRetrying = ref(false);
const isLoading = ref(true);
const summary = ref('');

async function generateSummary(forceRefresh = false) {
  isLoading.value = true;
  try {
    const result = await generateArticleSummary({
      link: props.item.link,
      title: props.item.title,
      description: props.item.description,
      feedItemId: props.item.id,
      forceRefresh
    });

    if (result.error) {
      throw new Error(result.error);
    }

    summary.value = result.summary;
  } catch (error: any) {
    console.error('生成总结失败:', error.message);
  } finally {
    isLoading.value = false;
  }
}

const handleRetry = async () => {
  isRetrying.value = true;
  try {
    await generateSummary(true);
    emit('retry');
  } finally {
    isRetrying.value = false;
  }
};

onMounted(async () => {
  await generateSummary();
});

function getSource() {
  const source =
    props.type === "f"
      ? props.item.author || props.item.feed?.title
      : props.item.feed?.title;
  return source;
}
</script>

<style lang="scss" scoped>
.magazine-item {
  padding-left: 5px;
  padding-right: 10px;
}

.magazine {
  display: grid;
  grid-template-columns: 1rem auto;
  align-items: center;
  grid-gap: 0.5rem;

  .magazine-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-self: flex-start;
    justify-content: space-between;

    .v-icon {
      margin-top: 1rem;
    }
  }
}

.magazine-info {
  display: grid;
  grid-template-columns: auto 6rem;
}

.magazine-sec {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 0.5rem;
}

.text-right {
  text-align: right;
}

.desc {
  --line-clamp: 10;
  width: 100%;
  align-self: flex-start;

  .title {
    font-weight: 500;
  }
}

a {
  text-decoration: none;
  color: rgb(var(--v-theme-surface-variant));

  &:hover {
    text-decoration: underline;
  }
}
</style>