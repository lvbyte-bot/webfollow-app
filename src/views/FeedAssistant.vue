<template>
  <Items ref="itemsRef">
    <template v-slot="{ openReader }">
      <div class="warp">
        <div class="feed-assistant mt-12 pa-3">
          <div class="text-center my-12">
            <div class="text-h3">向订阅源提问</div>
            <p class="my-6 text-subtitle-2">AI帮你回答问题</p>
          </div>
          <div class="border rounded-lg pa-5">
            <v-textarea
              v-model="query"
              label="询问你的订阅内容"
              @keyup.enter="handleQuery"
              rows="3"
              variant="plain"
              auto-grow
              hide-details
            >
            </v-textarea>
            <div class="d-flex align-center justify-space-between">
              <div></div>
              <c-btn
                icon="mdi-send"
                @click="handleQuery"
                :loading="loading"
                :disabled="loading"
              ></c-btn>
            </div>
          </div>
          <v-card
            v-if="contexts.length || answer || loading"
            class="mt-4 border rounded-lg"
            :loading="loading"
            flat
          >
            <!-- AI 回答部分 -->
            <v-card-text>
              <div class="text-subtitle-1 mb-2">回答</div>
              <div
                v-if="answer || !loading"
                class="answer-content pa-5 text-body-2"
                v-html="md2html(answer)"
              ></div>
              <v-skeleton-loader v-else type="paragraph"></v-skeleton-loader>
            </v-card-text>

            <!-- 参考资料部分 -->
            <v-divider></v-divider>
            <v-card-text>
              <div class="text-subtitle-1 mb-2">参考资料</div>
              <v-empty-state
                v-if="!loading && itemStore.items?.length == 0"
                icon="mdi-magnify"
                text="请重新尝试提问，有可能是AI调用存在问题导致，可以直接重试"
                title="没有找到相关资料"
              ></v-empty-state>
              <v-row v-else-if="itemStore.items?.length">
                <v-col
                  cols="12"
                  md="6"
                  v-for="(item, index) in itemStore.items"
                  :key="item.id"
                >
                  <MagazineItem
                    :item="item"
                    @click="openReader(index, item)"
                  ></MagazineItem>
                </v-col>
              </v-row>
              <v-row v-else>
                <v-col cols="12" md="6" v-for="index in 6" :key="index">
                  <v-skeleton-loader type="paragraph"></v-skeleton-loader>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </template>
  </Items>
</template>

<script setup lang="ts">
import Items from "./Items.vue";
import MagazineItem from "./item/MagazineItem.vue";
import { ref } from "vue";
import { queryWithRAG } from "@/service/rag";
import type { FeedContext } from "@/service/rag";
import { md2html } from "@/utils/mdUtils";
import { useItemsStore } from "@/store";
const query = ref("");
const answer = ref("");
const contexts = ref<FeedContext[]>([]);
const loading = ref(false);
const itemStore = useItemsStore();

const itemsRef = ref();

async function handleQuery() {
  if (!query.value.trim()) return;
  loading.value = true;
  init();
  try {
    const { genAnswer, contexts: aiContexts } = await queryWithRAG(query.value);
    contexts.value = aiContexts;
    itemsRef.value.loadData(
      0,
      contexts.value.map((item) => item.id)
    );
    answer.value = (await genAnswer()).answer;
  } catch (error: any) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
}

function init() {
  contexts.value = [];
  answer.value = "";
  itemsRef.value.loadData(0, []);
}
</script>

<style scoped>
.feed-assistant {
  max-width: 700px;
  margin: 0 auto;
}

:deep(.v-list-item) {
  margin-bottom: 8px;
}
:deep(.v-list-item__subtitle) {
  opacity: 0.7;
  font-size: 0.9em;
}
:deep(.v-field__input) {
  font-size: 0.95rem;
}
</style>
