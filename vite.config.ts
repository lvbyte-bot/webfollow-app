import { defineConfig } from "vite";
import vuetify, {
  transformAssetUrls
} from 'vite-plugin-vuetify'
import ViteFonts from 'unplugin-fonts/vite'
import vue from "@vitejs/plugin-vue";

import {
  fileURLToPath,
  URL
} from "node:url"

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [vue(),
  // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
  vuetify({
    autoImport: true,
    // styles: {
    //   configFile: 'src/styles/settings.scss',
    // },
  }),
  ViteFonts({
    google: {
      families: [{
        name: 'Roboto',
        styles: 'wght@100;300;400;500;700;900',
      }],
    },
  }),],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
    proxy: {
      "/fever/": {
        // target: "https://api.webfollow.cc/api",
        target: "http://192.168.8.232:28080/plugins/",

        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/fever/, ""),
      },
    },
  },
}));
