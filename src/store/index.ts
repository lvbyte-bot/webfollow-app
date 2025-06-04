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
import { itemRepo } from '@/repository'

type SyncType = '' | 'sync2local'

export const useAppStore = defineStore('app', () => {
    const {
        saved_item_ids, unread_item_ids, read, readItemBatch, unread, unreadItemBatch, save, unsave, refresh, clearFailFeedIds
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
    const readerMode = ref(false)

    const item7DayIds: Ref<number[]> = ref([])

    const item7DayTime = ref(0)

    async function sync(type: SyncType = '') {
        async function pullData2Local() {
            return await pulllocal()
        }
        const item7DayStart = new Date()
        item7DayStart.setDate(item7DayStart.getDate() - 1)
        item7DayTime.value = Math.round(item7DayStart.getTime() / 1000)
        lastRefeshTime.value = Math.round(new Date().getTime() / 1000)
        const tmpPullDataFail = settingsStore.general.pullDataFail
        settingsStore.general.pullDataFail = true
        settingsStore.saveToLocalStorage()
        loading.value = true
        if (type == '') {
            await refresh(async () => {
                await pullData2Local()
                await refreshFeed()
                setRanks(await getRanks())
                await refreshItems()
            }, async () => {
                if (tmpPullDataFail) {
                    await pullData2Local()
                }
                setRanks(await getRanks())
                await refreshItems()
            })
        } else if (type = 'sync2local') {
            await pullData2Local()
            await refreshFeed()
            setRanks(await getRanks())
        }
        item7DayIds.value = await fetch7dayItemId(item7DayStart.getTime())
        settingsStore.general.pullDataFail = false
        settingsStore.saveToLocalStorage()
        loading.value = false
        setTimeout(() => initNav(pageRoute), 1000)
        lastRefeshTime.value = Math.round(new Date().getTime() / 1000)
        info('sync end')

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
    const item7DayUnReadQty = computed(() => item7DayIds.value.filter(id => unread_item_ids.has(id)).length)
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
            case LsItemType.ITEMS:
                if (v.meta) {
                    nav.title = v.meta.title
                    nav.qty = v.meta.qty
                }
                return
            case LsItemType.RECOMMEND:
                nav.title = '今天'
                nav.qty = item7DayUnReadQty.value
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

    async function fetch7dayItemId(start: number): Promise<number[]> {

        return await itemRepo.getIdsInTimeRange(start / 1000, new Date().getTime() / 1000)
    }


    return { reloadBuild, sync, loading, read, readItemBatch, unread, unreadItemBatch, unread_item_ids, save, unsave, savedQty, unReadQty, item7DayUnReadQty, authInfo, lastRefeshTime, item7DayTime, nav, readerMode }
})



export { useFeedsStore, useItemsStore, usePlayListStore, useSettingsStore, useBaseStore };

type wathRef = Ref<any> | Reactive<any>

function watchAll(wathers: wathRef[], call: () => void) {
    wathers.forEach(w => {
        // deep
        watch(w, call, { deep: true })
    })
}