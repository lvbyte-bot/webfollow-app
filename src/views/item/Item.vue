<template>
    <v-card flat>
        <v-img v-if="item.thumbnail" class="align-end text-white" :src="item.thumbnail
            ? item.thumbnail
            : 'http://img.netbian.com/file/2024/0515/191947LFJ2P.jpg'
            " >
            <v-card-title class="bg-cover" v-text="item.title"></v-card-title>
        </v-img>
        <v-card-title v-else v-text="item.title"></v-card-title>
        <v-card-subtitle class="pt-4">
            <!-- {{ item.author  || item.feed}} -->
            {{ type == 'f' ? item.author || item.feed.title : item.feed.title }} |
            {{ item.datestr }}
        </v-card-subtitle>
        <v-card-text>
            <p class="color-surface" v-text="item.summary"></p>
        </v-card-text>
        <v-card-actions>
            <v-icon class="ml-1" color="primary" :icon="item.isRead?'':'mdi-circle-medium'"></v-icon>
            <v-spacer></v-spacer>
            <v-btn variant="text" icon title="稍后阅读" @click.stop="toggleSaved">
                <v-icon>{{ item.isSaved ? 'mdi-playlist-minus' : 'mdi-playlist-plus' }}</v-icon>
            </v-btn>
        </v-card-actions> </v-card>
</template>
<script setup lang="ts">
import { useAppStore } from "@/store";

const props = defineProps(['item', 'type'])

const store = useAppStore();

function toggleSaved() {
    if (props.item.isSaved) {
        store.unsave(props.item.id)
    } else {
        store.save(props.item.id)
    }
} 
</script>
<style scoped>
.bg-cover {
  background-color: rgba(var(--v-theme-surface-variant), 0.8);
}
</style>