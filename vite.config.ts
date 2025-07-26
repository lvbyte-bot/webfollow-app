import { defineConfig } from "vite";
import vuetify, {
  transformAssetUrls
} from 'vite-plugin-vuetify'
import ViteFonts from 'unplugin-fonts/vite'
import vue from "@vitejs/plugin-vue";
import { VitePWA } from 'vite-plugin-pwa';

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
  }),
  VitePWA({
    injectRegister: 'auto',
    registerType: 'autoUpdate',
    devOptions: {
      enabled: true
    },
    includeAssets: ['favicon.ico', 'logo.svg'],
    manifest: {
      name: 'IFeed',
      short_name: 'IF',
      description: '做懂你阅读的RSS阅读器',
      display: 'standalone',
      theme_color: '#0000',
      background_color: '#fff',
      icons: [
        {
          src: 'logo.svg',
          sizes: '48x48',
          type: 'image/png',
        },
        {
          src: 'logo.svg',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'logo.svg',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          "src": "logo.svg",
          "sizes": "any"
        }
      ],
    },
  }),],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' // or "modern"
      }
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
        target: "http://127.0.0.1:8086/",

        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/fever/, ""),
      },
    },
  },
}));
