// stores/counter.js
import { defineStore, storeToRefs } from 'pinia'
import { useBaseStore } from './base'
import { useFeedsStore } from './feeds'
import { useItemsStore } from './items'
import { sync as sync2local } from '@/service'
import { clearIndexedDB } from '@/utils/dbHelper'
import { computed, Ref, watch, ref, onMounted, reactive, Reactive } from 'vue'
import { PageRoute, TopNav } from './types'
import { LsItemType } from '@/service/types'



export const useAppStore = defineStore('app', () => {
    const {
        saved_item_ids, unread_item_ids, read, unread, save, unsave, refresh
    } = useBaseStore()
    const { refresh: refreshFeed } = useFeedsStore()
    const { subscriptions } = storeToRefs(useFeedsStore())
    const { refreshItems, pageRoute } = useItemsStore()
    const loading: Ref<boolean> = ref(false)
    const lastRefeshTime = ref(0);
    const authInfo: Ref<any> = ref(JSON.parse(localStorage.getItem('auth') || '{"username":"guest"}'))
    const nav: Reactive<TopNav> = reactive({ title: 'loading' })

    async function sync() {

        await refresh(async () => {
            loading.value = true
            await sync2local()
            await refreshFeed()
            await refreshItems()
            log('sync end')
            loading.value = false
        })
        initNav(pageRoute)
        lastRefeshTime.value = new Date().getTime()
    }

    async function reloadBuild() {
        await clearIndexedDB()
        saved_item_ids.clear()
        unread_item_ids.clear()
        setTimeout(async () => {
            authInfo.value = JSON.parse(localStorage.getItem('auth') || '{"username":"guest"}')
            await refreshFeed()
            await sync()
        }, 1000);

    }

    const savedQty = computed(() => saved_item_ids.size)
    const unReadQty = computed(() => unread_item_ids.size)
    watch(unReadQty, () => {
        setTitle(unReadQty.value)
    })
    onMounted(async () => {
        await sync()
        setTitle(unReadQty.value)
        setTimeout(() => {
            watchAll([pageRoute, subscriptions, unReadQty, savedQty], () => initNav(pageRoute))
        }, 1000);
        // 都是为了更新nav
    })


    function initNav(v: PageRoute) {
        switch (v.type) {
            case LsItemType.ALL:
                nav.title = '全部文章'
                nav.qty = unReadQty.value
                return
            case LsItemType.SAVED:
                nav.title = '稍后阅读'
                nav.qty = savedQty.value
                return
            case LsItemType.GROUP:
                const ga = subscriptions?.value?.filter(g => g.id == v.id)
                if (ga?.length) {
                    nav.title = ga[0].title
                    nav.qty = ga[0].unreadQty
                }
                return
            case LsItemType.FEED:
                let fs = subscriptions?.value?.flatMap(g => g.feeds).filter(f => f.id == v.id)
                if (fs?.length) {
                    nav.title = fs[0].title
                    nav.qty = fs[0].unreadQty
                }
                return
        }
    }


    return { reloadBuild, sync, loading, read, unread, save, unsave, savedQty, unReadQty, authInfo, lastRefeshTime, nav }
})



export { useFeedsStore, useItemsStore };

type wathRef = Ref<any> | Reactive<any>

function watchAll(wathers: wathRef[], call: () => void) {
    wathers.forEach(w => {
        watch(w, call)
    })
}