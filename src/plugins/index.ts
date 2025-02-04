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
const pinia = createPinia()
export function registerPlugins(app: any) {
  app.config.globalProperties.$vuetify = vuetify;
  app
    .use(pinia)
    .use(vuetify)
    .use(router)
    .use(ConfirmPlugin)
}
