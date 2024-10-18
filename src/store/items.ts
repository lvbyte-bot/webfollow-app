// stores/counter.js
import {
    defineStore,
    storeToRefs
} from 'pinia'
import {
    ref,
    computed,
    onMounted,
    Ref,
} from 'vue'
import {
    listItem,
    LsItemType,
} from '@/service'
import {
    useBaseStore
} from './base'
import { FeedItem } from '@/service/types'

export const useItemsStore = defineStore('items', () => {
    const {
        saved_item_ids,
        unread_item_ids
    } = storeToRefs(useBaseStore())
    const data: Ref<FeedItem[] | undefined> = ref([])

    const items = computed(() => data.value?.map(item => {
        item.isSaved = saved_item_ids.value.has(item.id)
        item.isRead = !unread_item_ids.value.has(item.id)
        return item
    }))

    async function loadData(id: any, type: LsItemType, page: number = 0, onlyread: boolean = false) {
        data.value = await listItem(id, type, page, onlyread, unread_item_ids.value)
    }

    return {
        items,
        loadData
    }
})