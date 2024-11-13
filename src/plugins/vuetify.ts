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
                    primary: '#27AE60',
                    secondary: '#F39C12',
                    success: '#8E44AD',
                    info: '#E74C3C',
                },
            },
            dark: {
                colors: {
                    background: '#292929',
                    primary: '#27AE60',
                    secondary: '#F39C12',
                    success: '#8E44AD',
                    info: '#E74C3C'
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
