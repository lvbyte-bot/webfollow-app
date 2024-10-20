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

    const nav: Ref<any> = ref({})

    const items = computed(() => data.value?.map(item => {
        item.isSaved = saved_item_ids.has(item.id)
        item.isRead = !unread_item_ids.has(item.id)
        return item
    }))

    async function loadData(id: any, type: LsItemType, page: number = 0, onlyUnread: boolean = false) {
        id = type == LsItemType.SAVED ? saved_item_ids : id
        id = type == LsItemType.ALL ? null : id
        nav.value = await getNav(id, type);
        data.value = await listItem(id, type, page, onlyUnread, unread_item_ids)
    }

    return {
        items,
        nav,
        loadData
    }
})