// stores/counter.js
import {
    defineStore,
} from 'pinia'
import {
    ref,
    computed,
    Ref,
    reactive,
    Reactive,
} from 'vue'
import {
    listItem,
    syncFeedItem,
} from '@/service'

import {
    useBaseStore
} from './base'
import { FeedItem, LsItemType } from '@/service/types'
import { PageRoute, PageRouteMeta } from './types'

export const useItemsStore = defineStore('items', () => {
    const {
        saved_item_ids,
        unread_item_ids
    } = useBaseStore()
    const data: Ref<FeedItem[] | undefined> = ref([])

    const isLast: Ref<boolean | undefined> = ref(false)
    //  用于导航栏变动
    const pageRoute: Reactive<PageRoute> = reactive({ type: LsItemType.ALL, id: 0 })

    let cacheLoadParams: any = {}

    const items: Ref<FeedItem[]> = computed(() => data.value ? data.value?.map(item => {
        item.isSaved = saved_item_ids.has(item.id)
        item.isRead = !unread_item_ids.has(item.id)
        return item
    }) : [])

    let currentPageUnReadItemIds: Set<number>;
    async function loadData(id: any, type: LsItemType, page: number = 0, onlyUnread: boolean = false, meta?: PageRouteMeta) {
        cacheLoadParams = { id, type, page, onlyUnread, meta }
        id = type == LsItemType.SAVED ? saved_item_ids : id
        id = type == LsItemType.ALL ? null : id
        if (page == 0) {
            currentPageUnReadItemIds = unread_item_ids
        }
        if (meta?.id && meta?.type) {
            pageRoute.id = meta.id
            pageRoute.type = meta.type
        } else {
            pageRoute.id = id
            pageRoute.type = type
        }
        pageRoute.meta = meta
        // console.log('run loadData', pageRoute.meta)
        const r = await listItem(id, type, page, onlyUnread, currentPageUnReadItemIds)
        if (page == 0) {
            data.value = []
        }
        r?.data.forEach((item) => data.value?.push(item))
        isLast.value = r?.isLast
    }

    async function refreshItems() {
        if (Object.keys(cacheLoadParams).length) {
            await loadData(cacheLoadParams.id, cacheLoadParams.type, cacheLoadParams.page, cacheLoadParams.onlyUnread, cacheLoadParams.meta)
        }
    }

    async function pullFeedItems(feedId: number) {
        await syncFeedItem(feedId)
    }

    return {
        items,
        isLast,
        loadData,
        refreshItems,
        pullFeedItems,
        pageRoute
    }
})