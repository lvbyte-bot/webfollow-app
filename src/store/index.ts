// stores/counter.js
import { defineStore, storeToRefs } from 'pinia'
import { useBaseStore } from './base'
import { useFeedsStore } from './feeds'
import { useItemsStore } from './items'
import { usePlayListStore } from './playlist'
import { pull as pulllocal, setRanks } from '@/service'
import { ranks as getRanks } from '@/service/recommend'
import { clearIndexedDB } from '@/utils/dbHelper'
import { computed, Ref, watch, ref, onMounted, reactive, Reactive } from 'vue'
import { PageRoute, TopNav } from './types'
import { LsItemType } from '@/service/types'
import { useSettingsStore } from './settings'

type SyncType = '' | 'sync2local'

export const useAppStore = defineStore('app', () => {
    const {
        saved_item_ids, unread_item_ids, read, unread, save, unsave, refresh, clearFailFeedIds
    } = useBaseStore()
    const { clear } = usePlayListStore()
    const { refresh: refreshFeed } = useFeedsStore()
    const { subscriptions } = storeToRefs(useFeedsStore())
    const settingsStore = useSettingsStore()
    const { refreshItems, pageRoute } = useItemsStore()
    const loading: Ref<boolean> = ref(false)
    const lastRefeshTime = ref(0);
    const authInfo: Ref<any> = ref(JSON.parse(localStorage.getItem('auth') || '{"username":"guest"}'))
    const nav: Reactive<TopNav> = reactive({ title: 'loading' })

    async function sync(type: SyncType = '') {
        async function pullData2Local() {
            return await pulllocal(() => {
                settingsStore.general.refreshFail = true
                settingsStore.saveToLocalStorage()
            })
        }
        lastRefeshTime.value = new Date().getTime()
        const tmpRefreshFail = settingsStore.general.refreshFail
        settingsStore.general.refreshFail = false
        if (type == '') {
            await refresh(async () => {
                loading.value = true
                await pullData2Local()
                await refreshFeed()
                setRanks(await getRanks())
                await refreshItems()
                loading.value = false
            }, async () => {
                loading.value = true
                if (tmpRefreshFail) {
                    await pullData2Local()
                }
                setRanks(await getRanks())
                await refreshItems()
                loading.value = false
            })

        } else if (type = 'sync2local') {
            loading.value = true
            await pullData2Local()
            setRanks(await getRanks())
            await refreshFeed()
            loading.value = false
        }
        setTimeout(() => initNav(pageRoute), 1000)
        lastRefeshTime.value = new Date().getTime()
        log('sync end')
        settingsStore.saveToLocalStorage()
    }



    async function reloadBuild() {
        await clearIndexedDB()
        saved_item_ids.clear()
        unread_item_ids.clear()
        clearFailFeedIds()
        localStorage.removeItem('app-settings')
        localStorage.removeItem('readfeeds')
        clear()
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
            watchAll([pageRoute, subscriptions, savedQty], () => initNav(pageRoute))
        }, 1000);
        // 都是为了更新nav
    })


    function initNav(v: PageRoute) {
        nav.isFailure = false
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
            case LsItemType.RECOMMEND:
                nav.title = '猜你喜欢'
                nav.qty = unReadQty.value
                return
            case LsItemType.FEED:
                let fs = subscriptions?.value?.flatMap(g => g.feeds).filter(f => f.id == v.id)
                if (fs?.length) {
                    nav.title = fs[0].title
                    nav.qty = fs[0].unreadQty
                    nav.isFailure = fs[0].isFailure
                    nav.url = fs[0].url
                }
                return
        }
    }



    return { reloadBuild, sync, loading, read, unread, save, unsave, savedQty, unReadQty, authInfo, lastRefeshTime, nav }
})



export { useFeedsStore, useItemsStore, usePlayListStore, useSettingsStore };

type wathRef = Ref<any> | Reactive<any>

function watchAll(wathers: wathRef[], call: () => void) {
    wathers.forEach(w => {
        watch(w, call)
    })
}