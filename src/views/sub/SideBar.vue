<template>

    <div class="sidebar" v-bind="$attrs">
        <v-list nav class="sidebar-list">
            <div class="sidebar-top">
                <v-list-item prepend-icon="mdi-inbox" title="全部文章" to="/all">
                    <template v-slot:append>
                        <small v-if="appStore.savedQty" v-text="appStore.unReadQty"></small> </template></v-list-item>
                <v-list-item prepend-icon="mdi-format-list-bulleted" title="稍后阅读" to="/next">
                    <template v-slot:append>
                        <small v-if="appStore.savedQty" v-text="appStore.savedQty"></small>
                    </template>
                </v-list-item>
            </div>
            <v-list-subheader>FEEDS</v-list-subheader>
            <v-list-group v-for="item in store.feeds" :key="'c/' + item.id">
                <template v-slot:activator="{ isOpen, props }">
                    <v-list-item v-bind="props" :title="item.title">
                        <template #prepend>
                            <v-icon :icon="isOpen ? 'mdi-chevron-up' : ' mdi-chevron-down'">
                            </v-icon>
                        </template>
                        <template #append>
                            <small v-if="item.unreadQty" v-text="item.unreadQty"></small>
                        </template>
                    </v-list-item>
                </template>
                <v-list-item title="全部" :to="'/c/' + item.id"> </v-list-item>
                <v-list-item v-for="subItem in item.feeds" :key="subItem.id" :title="subItem.title" :value="subItem.id"
                    :to="'/f/' + subItem.id" @contextmenu.prevent="showContextMenu($event, subItem.title)">
                    <template #prepend>
                        <img :src="subItem.icon" onerror="this.src='/logo.svg'" width="18">
                        </img>
                    </template>
                    <template v-slot:append>
                        <small v-if="subItem.unreadQty" v-text="subItem.unreadQty"></small>
                    </template>
                </v-list-item>
            </v-list-group>
        </v-list>

        <div v-if="mobile" class="plus mx-auto">
            <v-btn color="surface-variant" icon="mdi-plus"></v-btn>
        </div>
    </div>

    <v-card v-show="contextMenuVisible" style="position: fixed; z-index: 10000"
        :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }">
        <v-list>
            <v-list-item prepend-icon=" mdi-pencil-box-outline" @click="handleAction('edit')">编辑订阅源</v-list-item>
            <v-list-item prepend-icon="mdi-delete-sweep" @click="handleAction('delete')">取消订阅</v-list-item>
        </v-list>
    </v-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useFeedsStore, useAppStore } from "@/store";
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();

const store = useFeedsStore();
const appStore = useAppStore();

onMounted(() => {
    document.addEventListener("click", hideContextMenu);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", hideContextMenu);
});

const hideContextMenu = () => {
    contextMenuVisible.value = false; // 隐藏菜单
};

const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const showContextMenu = (event, title) => {
    contextMenuX.value = event.clientX;
    contextMenuY.value = event.clientY;
    contextMenuVisible.value = true;
};

const handleAction = (action, title0) => {
    console.log(action, title0);
    contextMenuVisible.value = false;
    if (action === "edit") {
        // 处理编辑逻辑
        console.log(`编辑: ${title0}`);
    } else if (action === "delete") {
        // 处理删除逻辑
        console.log(`删除: ${title0}`);
    }
    title.value = action;
};

const show = ref(false);
</script>
<style scoped>
.sidebar-list{
    position: relative;
  max-height: 100vh;
   overflow: auto;
  background-color: rgb(var(--v-theme-background));
   padding-top: 0;
}
.sidebar-top {
  padding-top: 0.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: rgb(var(--v-theme-background));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.plus {
  display: inline-block;
  position: fixed;
  bottom: 0;
  padding: 1rem;
  z-index: 1000;
}
</style>