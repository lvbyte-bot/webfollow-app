<template>
  <v-card flat>
    <v-img
      v-if="item.thumbnail"
      class="align-end text-white"
      max-height="200px"
      width="100%"
      :title="item.title"
      :src="
        item.thumbnail
          ? item.thumbnail
          : 'http://img.netbian.com/file/2024/0515/191947LFJ2P.jpg'
      "
    >
  
    </v-img>
    <div class="text-truncate mt-3 mx-3 " >
      <v-icon
        v-if="!item.isRead"
        style="margin-left: -5px;"
        color="primary"
        :icon="item.isRead ? '' : 'mdi-circle-medium'"
      ></v-icon>
      <span class="text-body" v-text="item.title"></span>
      <div class="my-2 d-flex text-body-2">
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
const props = defineProps(["item", "type"]);
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
