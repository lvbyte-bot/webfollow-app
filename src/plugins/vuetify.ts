/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import {
    createVuetify
} from 'vuetify'
import { VBtn } from 'vuetify/components'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
    theme: {
        themes: {
            light: {
                colors: {
                    primary: '#2bb24c',
                    secondary: '#5CBBF6',
                },
            },
        },
    },
    aliases: {
        CBtn: VBtn
    },
    defaults: {
        CBtn: {
            variant: 'text',
            size: '40px'
        },
    },
})
