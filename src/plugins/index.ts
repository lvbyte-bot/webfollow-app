/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import router from '../router'
import { createPinia } from 'pinia'
import ConfirmPlugin from './confirm'
import ImgPreviewPlugin from './ImgPreview'
import MAvatar from '@/components/gloab/MAvatar.vue'
const pinia = createPinia()
export function registerPlugins(app: any) {
  app.config.globalProperties.$vuetify = vuetify;
  app.component('m-avatar', MAvatar)
  app
    .use(pinia)
    .use(vuetify)
    .use(router)
    .use(ConfirmPlugin)
    .use(ImgPreviewPlugin)
}
