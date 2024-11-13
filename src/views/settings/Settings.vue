<template>
  <v-card min-height="80vh">
    <v-container fluid>
      <v-row>
        <!-- 左侧导航菜单 -->
        <v-col cols="3" class="pr-0">
          <v-list rounded>
            <v-list-item subtitle="hello webfollow" title="guest" class="mb-6">
              <template #prepend>
                <v-avatar
                  size="36px"
                  color="secondary"
                  :title="appStore.authInfo.username"
                >
                  {{ appStore.authInfo.username.substring(0, 2) }}
                </v-avatar>
              </template>
              <template #append>
                <v-btn
                  to="/login"
                  title="退出登录"
                  icon="mdi-exit-to-app"
                  size="small"
                  variant="text"
                  @click="close"
                ></v-btn>
              </template>
            </v-list-item>
            <v-list-item
              v-for="item in menuItems"
              :key="item.key"
              :active="currentSection === item.key"
              @click="currentSection = item.key"
              color="primary"
            >
              <template v-slot:prepend>
                <v-icon>{{ item.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ item.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- 右侧内容区域 -->
        <v-col cols="9">
          <v-card flat>
            <v-card-title class="d-flex justify-space-between align-center"
              >{{ getCurrentTitle }}
              <v-btn @click="close" icon flat>
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <div class="ov">
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
import { ref, computed } from "vue";
import SettingsGeneral from "./sub/SettingsGeneral.vue";
import SettingsAppearance from "./sub/SettingsAppearance.vue";
const settingsStore = useSettingsStore();
const comps: any = { general: SettingsGeneral, appearance: SettingsAppearance };
const appStore = useAppStore();

const currentSection = ref("general");
const menuItems = [
  { key: "general", label: "通用设置", icon: "mdi-cog" },
  // { key: "account", label: "账号设置", icon: "mdi-account" },
  // { key: "notification", label: "通知设置", icon: "mdi-bell" },
  // { key: "privacy", label: "隐私设置", icon: "mdi-shield-lock" },
  { key: "appearance", label: "外观设置", icon: "mdi-palette" },
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
</script>

<style scoped>
.v-list-item--active {
  border-radius: 0 50px 50px 0;
}
:deep(.ov) {
  height: 70vh;
  overflow: auto;
  .v-card--variant-elevated {
    box-shadow: none;
  }
  .v-card-title {
    font-size: 1rem;
  }
}
</style>
