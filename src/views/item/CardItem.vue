<template>
  <v-card flat class="rounded-lg">
    <v-img
      v-if="item.thumbnail"
      class="align-end text-white rounded-lg"
      :title="item.title"
      :aspect-ratio="mobile?(item.enclosure?1.79:0.70):(item.enclosure?1.79:0)"
      max-height="360px"
      :cover="mobile||item.enclosure"
      :src="
        item.thumbnail
          ? item.thumbnail
          : 'http://img.netbian.com/file/2024/0515/191947LFJ2P.jpg'
      "
    >
  
    </v-img>
    <div class=" mt-2 mx-2 " >
      <p class="text-ellipsis">
      <v-icon
        v-if="!item.isRead"
        style="margin-left: -5px;"
        color="primary"
        :icon="item.isRead ? '' : 'mdi-circle-medium'"
      ></v-icon>
      <span class="text-subtitle-1 " v-text="item.title"></span>
    </p>
      <div class="my-2 d-flex text-subtitle-2">
        <div class="mr-2">
          <img  :src=" item?.feed?.icon" onerror="this.src='/logo.svg'" style="width:0.8rem">
        </img>
        </div>
        {{ getSubtitle() }}
      </div>
    </div>
  </v-card>
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify";
const props = defineProps(["item", "type"]);
const {mobile} = useDisplay()
function getSubtitle() {
  const source =
    props.type === "f"
      ? props.item.author || props.item.feed?.title
      : props.item.feed?.title;
  return `${source} | ${props.item.datestr}`;
}
</script>
<style scoped>
.v-card .button {
  opacity: 0;
  transition: opacity 0.3s;
}
.v-card-text {
  padding-bottom: 0;
}

.v-card:hover .button {
  opacity: 1;
}
</style>
