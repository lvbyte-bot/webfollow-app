// stores/counter.js
import {
    defineStore,
} from 'pinia'
import {
    ref,
    computed,
    Ref,
} from 'vue'
import {
    listItem,
    LsItemType,
    getNav
} from '@/service'

import {
    useBaseStore
} from './base'
import { FeedItem } from '@/service/types'

export const useItemsStore = defineStore('items', () => {
    const {
        saved_item_ids,
        unread_item_ids
    } = useBaseStore()
    const data: Ref<FeedItem[] | undefined> = ref([])

    const isLast: Ref<boolean | undefined> = ref(false)

    const nav: Ref<any> = ref({})

    let cacheLoadParams: any = {}

    const items = computed(() => data.value?.map(item => {
        item.isSaved = saved_item_ids.has(item.id)
        item.isRead = !unread_item_ids.has(item.id)
        return item
    }))

    async function loadData(id: any, type: LsItemType, page: number = 0, onlyUnread: boolean = false) {
        if (page == 0) {
            data.value = []
        }
        cacheLoadParams = { id, type, page, onlyUnread }
        id = type == LsItemType.SAVED ? saved_item_ids : id
        id = type == LsItemType.ALL ? null : id
        nav.value = await getNav(id, type);
        const r = await listItem(id, type, page, onlyUnread, unread_item_ids)
        r?.data.forEach((item) => data.value?.push(item))
        isLast.value = r?.isLast
    }

    async function refreshItems() {
        if (Object.keys(cacheLoadParams).length) {
            await loadData(cacheLoadParams.id, cacheLoadParams.type, cacheLoadParams.page, cacheLoadParams.onlyUnread)
        }
    }

    return {
        items,
        isLast,
        nav,
        loadData,
        refreshItems
    }
})