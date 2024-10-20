<template>
    <v-list-item :class="{ 'hover-bg': true }">
        <template v-slot:prepend>

            <v-icon :color="item.isRead ? 'grey' : 'primary'">
                {{ item.isRead ? '' : 'mdi-circle-medium' }}
            </v-icon>
        </template>

        <v-list-item-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center text-truncate">
                <span class="text-truncat mr-2">{{ item.title }}</span>
                <span class="text-truncate text-body-2 text-medium-emphasis">{{ item.summary }}</span>
            </div>
            <span class="sub-text text-caption ml-2 flex-shrink-0">{{ getSubtitle() }}</span>
            <div class="buttons">
                <v-btn size="small" icon="mdi-open-in-new" variant="text" title="打开原文" :href="item.link"></v-btn>
            <v-btn size="small" variant="text" icon title="稍后阅读" @click.stop="toggleSaved">
                <v-icon>{{ item.isSaved ? 'mdi-playlist-minus' : 'mdi-playlist-plus' }}</v-icon>
            </v-btn>
            </div>
        </v-list-item-title>
    </v-list-item>
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


function getSubtitle() {
    const source = props.type === 'f' ? props.item.author || props.item.feed.title : props.item.feed.title;
    return `${source} | ${props.item.datestr}`;
}
</script>

<style scoped>
.hover-bg:hover {
    background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.v-list-item-title,
.v-list-item-subtitle {
    white-space: nowrap;
    overflow: hidden;
}

.buttons {
    display: none;
}

.hover-bg:hover .buttons {
    display: block;
}
.hover-bg:hover .sub-text {
    display: none;
}

.v-list-item-title {
    flex: 1;
    min-width: 0;
}
.v-list-item--density-default {
    min-height: 48px;
}
</style>
