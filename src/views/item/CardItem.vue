<template>
  <v-card flat class="rounded-lg">
    <v-img
      v-if="item.thumbnail"
      class="align-end text-white border rounded-lg"
      :title="item.title"
      :aspect-ratio="
        mobile ? (item.enclosure ? 1.79 : 0.7) : item.enclosure ? 1.79 : 0
      "
      max-height="360px"
      min-height="150px"
      :cover="mobile || item.enclosure"
      :src="item.thumbnail"
    >
    </v-img>
    <p
      v-else
      v-text="item.summary"
      :style="{ '--line-clamp': mobile ? 12 : 7 }"
      class="text-ellipsis text-body-2 pa-2 text-grey border rounded-lg summary-warp"
    ></p>
    <div class="mt-2 mx-2">
      <p class="text-ellipsis">
        <v-icon
          v-if="!item.isRead"
          style="margin-left: -5px"
          color="primary"
          :icon="item.isRead ? '' : 'mdi-circle-medium'"
        ></v-icon>
        <span class="text-subtitle-1" v-text="item.title"></span>
      </p>
      <div class="my-2 d-flex justify-space-between">
        <div class="text-subtitle-2 text-truncate">
          <img
            :src="item?.feed?.icon"
            onerror="this.src='/logo.svg'"
            style="width: 0.8rem"
          />
          {{ getSubtitle() }}
        </div>
        <small v-text="item.datestr"></small>
      </div>
    </div>
  </v-card>
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify";
const props = defineProps(["item", "type"]);
const { mobile } = useDisplay();
function getSubtitle() {
  const source =
    props.type === "f"
      ? props.item.author || props.item.feed?.title
      : props.item.feed?.title;
  return `${source}`;
}
</script>
<style scoped>
.summary-warp {
  min-height: 150px;
  background-color: rgba(var(--v-theme-surface-light), 0.3);
}
</style>
