<template>
  <v-card min-height="80vh" class="rounded-lg">
    <v-container fluid>
      <v-row>
        <!-- 左侧导航菜单 -->
        <v-col lg="3" cols="12" class="pa-0 sidebar">
          <v-list rounded class="sidebar">
            <v-list-item subtitle="WebFollow" :title="appStore.authInfo.username" class="mb-6">
              <template #prepend>
                <v-avatar size="36px" color="primary" :title="appStore.authInfo.username">
                  <!-- {{ appStore.authInfo.username.substring(0, 2) }} -->
                  <v-img :src="'https://api.dicebear.com/7.x/avataaars/svg?seed=' +
                    appStore.authInfo.username
                    "></v-img>
                </v-avatar>
              </template>
              <!-- <template #append>
                <v-btn to="/login" title="退出登录" icon="mdi-exit-to-app" size="small" variant="text"
                  @click="close"></v-btn>
              </template> -->
            </v-list-item>
            <v-list-item v-for="item in menuItems" :key="item.key" :active="currentSection === item.key"
              @click="currentSection = item.key" color="primary">
              <template v-slot:prepend>
                <v-icon>{{ item.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ item.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- 右侧内容区域 -->
        <v-col lg="9" cols="12" class="pa-0">
          <v-card flat>
            <v-card-title class="d-flex justify-space-between align-center">{{ getCurrentTitle }}
              <v-btn @click="close" icon flat>
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <div :class="{ scroll: !mobile }">
              <component :is="currentComponent" />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts" setup>
import { useSettingsStore, useAppStore } from "@/store";
import { ref, computed, onMounted, watch } from "vue";
import { useDisplay } from "vuetify";
import SettingsGeneral from "./sub/SettingsGeneral.vue";
import SettingsAppearance from "./sub/SettingsAppearance.vue";
import SettingsIntegrated from "./sub/SettingsIntegrated.vue";
import SettingsAbout from "./sub/SettingsAbout.vue";
const props = defineProps(["activeMenu"]);
const settingsStore = useSettingsStore();
const comps: any = {
  general: SettingsGeneral,
  appearance: SettingsAppearance,
  about: SettingsAbout,
  integrated: SettingsIntegrated,
};
const { mobile } = useDisplay();
const appStore = useAppStore();

const currentSection = ref("general");
const menuItems = [
  { key: "general", label: "通用设置", icon: "mdi-cog" },
  // { key: "account", label: "账号设置", icon: "mdi-account" },
  // { key: "notification", label: "通知设置", icon: "mdi-bell" },
  // { key: "privacy", label: "隐私设置", icon: "mdi-shield-lock" },
  { key: "appearance", label: "外观设置", icon: "mdi-palette" },
  { key: "integrated", label: "集成设置", icon: "mdi-api" },
  { key: "about", label: "关于", icon: "mdi-information" },
  // { key: "security", label: "安全设置", icon: "mdi-security" },
];

const currentComponent = computed(() => comps[currentSection.value]);

const getCurrentTitle = computed(() => {
  const currentItem = menuItems.find(
    (item) => item.key === currentSection.value
  );
  return currentItem ? currentItem.label : "";
});

const emit = defineEmits(["onclose"]);
const close = () => {
  emit("onclose");
  settingsStore.saveToLocalStorage();
};

onMounted(() => {
  currentSection.value = props.activeMenu || "general";
});

watch(props.activeMenu, (newVal) => {
  currentSection.value = newVal;
});
</script>

<style scoped>
.v-list-item--active {
  border-radius: 0 50px 50px 0;
}

:deep(.scroll) {
  height: 75vh;
  overflow: scroll;

  .v-card--variant-elevated {
    box-shadow: none;
  }

  .v-card-title {
    font-size: 1rem;
  }
}

.sidebar {
  background-color: rgb(var(--sidbar-bg));
}
</style>
