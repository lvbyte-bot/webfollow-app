<template>
  <v-responsive>
    <v-app>
      <v-navigation-drawer width="96">
        <v-list-item
          class="my-2 mx-3"
          prepend-avatar="/logo.svg"
          title="webfollow"
        >
        </v-list-item>
        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-plus"
            title="添加"
            value="plus"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-download"
            title="下载"
            value="app"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main>
        <div class="cols">
          <div class="resizeable">
            <v-card flat height="100vh">
              <v-list nav>
                <v-list-item
                  prepend-icon="mdi-newspaper"
                  title="今日"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-format-list-bulleted"
                  title="稍后阅读"
                ></v-list-item>
                <v-list-subheader>FEEDS</v-list-subheader>

                <v-list-group v-for="item in store.feeds">
                  <template v-slot:activator="{ props }">
                    <v-list-item
                      v-bind="props"
                      prepend-icon="mdi-folder-outline"
                      :title="item.title"
                      :value="item.title"
                    ></v-list-item>
                  </template>
                  <v-list-item
                    title="查看全部"
                    :value="'/c/' + item.id"
                    :to="'/c/' + item.id"
                  ></v-list-item>
                  <v-list-item
                    v-for="item in item.feeds"
                    :key="item.id"
                    :title="item.title"
                    :value="item.id"
                    :to="'/f/' + item.id"
                    @contextmenu.prevent="showContextMenu($event, title)"
                  >
                    <template v-slot:append>
                      <small
                        v-if="item.unreadQty"
                        v-text="item.unreadQty"
                      ></small>
                    </template>
                  </v-list-item>
                </v-list-group>
              </v-list>
              <div v-if="mobile" class="plus mx-auto">
                <v-btn color="surface-variant" icon="mdi-plus"></v-btn>
              </div>
            </v-card>
          </div>
          <div class="flexible">
            <router-view></router-view>
          </div>
        </div>
      </v-main>
      <v-card
        v-show="contextMenuVisible"
        style="position: fixed; z-index: 10000"
        :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
      >
        <v-list>
          <v-list-item
            prepend-icon=" mdi-pencil-box-outline"
            @click="handleAction('edit')"
            >编辑订阅源</v-list-item
          >
          <v-list-item
            prepend-icon="mdi-delete-sweep"
            @click="handleAction('delete')"
            >取消订阅</v-list-item
          >
        </v-list>
      </v-card>
      <!-- <v-dialog v-model="title" max-width="500">
        <v-card>
          <v-card-title>
            {{ title }}
          </v-card-title>
        </v-card>
      </v-dialog> -->
    </v-app>
  </v-responsive>
</template>
<script setup async>
import Items from "./Items.vue";
import { useDisplay } from "vuetify";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { listfeeds, listItems } from "@/service/fever";
import { useFeedsStore } from "@/store";

const store = useFeedsStore();
const title = ref("");

const feeds = ref([]);

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

const { mobile } = useDisplay();
const show = ref(false);
</script>
<style lang="css" scoped>
.cols {
  display: grid;
  grid-template-columns: auto 1fr;
}

.resizeable {
  position: relative;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  overflow: auto;
  resize: horizontal;
  min-width: 300px;
  max-width: 36vw;
  height: 100vh;
}
.plus {
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
  padding: 2rem;
}

.flexible {
  flex: 1;
  /* height: 100vh;
  overflow-y: auto;
  position: relative; */
}
</style>
