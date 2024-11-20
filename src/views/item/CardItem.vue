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
    <div class="text-truncate mt-3 mx-3 text-body" >

      <v-icon
        v-if="!item.isRead"
        style="margin-left: -5px;"
        color="primary"
        :icon="item.isRead ? '' : 'mdi-circle-medium'"
      ></v-icon>
      <span v-text="item.title"></span>
      <div class="my-2 d-flex text-body-2">
        <div class="mr-2">
          <img  :src=" item?.feed?.icon" onerror="this.src='/logo.svg'" style="width:1rem">
        </img>
        </div>
        {{ getSubtitle() }}
      </div>
    </div>
    <v-card-actions class="bg-cover">
     <v-spacer></v-spacer>
     <v-btn
         class="button"
         size="small"
         variant="text"
         icon
         :title="item.feed?.title"
         :to="'/f/' + item?.feed?.id"
         @click.stop="()=>{}"
       >
       <img class="noclick" :src=" item?.feed?.icon" onerror="this.src='/logo.svg'" style="width:16px">
       </img>
     </v-btn>
     <v-btn
       class="button"
       size="small"
       variant="text"
       icon
       :title="item.isRead ? '未读' : '已读'"
       @click.stop="toggleRead"
     >
       <v-icon>{{
         item.isRead ? "mdi-radiobox-blank" : "mdi-radiobox-marked"
       }}</v-icon>
     </v-btn>
     <v-btn
       class="button"
       size="small"
       icon="mdi-open-in-new"
       variant="text"
       title="打开原文"
       :href="item.link"
     ></v-btn>
     <v-btn
       class="button"
       size="small"
       variant="text"
       icon
       title="稍后阅读"
       @click.stop="toggleSaved"
     >
       <v-icon>{{
         item.isSaved ? "mdi-playlist-minus" : "mdi-playlist-plus"
       }}</v-icon>
     </v-btn>
   </v-card-actions>
  </v-card>
</template>
<script setup lang="ts">
import { useAppStore } from "@/store";

const props = defineProps(["item", "type"]);

const store = useAppStore();

function toggleSaved() {
  if (props.item.isSaved) {
    store.unsave(props.item.id);
  } else {
    store.save(props.item.id);
  }
}

function toggleRead() {
  if (props.item.isRead) {
    store.unread(props.item.id);
  } else {
    store.read(props.item.id);
  }
}

function getSubtitle() {
  const source =
    props.type === "f"
      ? props.item.author || props.item.feed?.title
      : props.item.feed?.title;
  return `${source} | ${props.item.datestr}`;
}
</script>
<style scoped>
.bg-cover {
  background-color: rgba(var(--v-theme-background), .9);
  position: absolute;
  width: 100%;
  padding: 0;
  bottom:  0;
  opacity: 0;
  min-height: 64px;
  padding: 1rem;
}

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
.v-card:hover .bg-cover {
  opacity: 1;
}
</style>
