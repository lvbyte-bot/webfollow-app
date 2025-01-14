// Composables
import {
    createRouter,
    createWebHistory
} from 'vue-router'

const routes = [{
    path: '/',
    component: () => import('@/views/Home.vue'),
    children: [{
        path: '/:type/:id',
        component: () => import('@/views/Items.vue'),
        props: true
    }, {
        path: '/:type',
        component: () => import('@/views/Items.vue'),
        props: true
    },
    {
        path: '/',
        component: () => import('@/views/Welcome.vue'),
    },
    {
        path: '/welcome',
        component: () => import('@/views/Welcome.vue'),
    },
    {
        path: '/subscribe',
        component: () => import('@/views/Discovery.vue'),
    }, {
        path: '/search',
        component: () => import('@/views/FeedAssistant.vue'),
    }, {
        path: '/filter',
        component: () => import('@/views/RelatedArticles.vue'),
    }, {
        path: '/download',
        component: () => import('@/views/Download.vue'),
    }, {
        path: '/combo',
        component: () => import('@/views/Combo.vue'),
    }, {
        path: '/login',
        component: () => import('@/views/Login.vue'),
    }]
}]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
