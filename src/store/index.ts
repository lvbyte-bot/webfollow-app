// stores/counter.js
import { defineStore } from 'pinia'
import { useBaseStore } from './base'
import { useFeedsStore } from './feeds'
import { useItemsStore } from './items'
import { sync as sync2local } from '@/service'
import { computed } from 'vue'
export const useAppStore = defineStore('app', () => {
    const {
        saved_item_ids, unread_item_ids, read, unread, save, unsave, refresh
    } = useBaseStore()
    const { refresh: refreshFeed } = useFeedsStore()
    const { refreshItems } = useItemsStore()
    async function sync() {

        await refresh(async () => {
            await sync2local()
            await refreshFeed()
            await refreshItems()
            console.log('sync end')
        })

    }
    const savedQty = computed(() => saved_item_ids.size)
    const unReadQty = computed(() => unread_item_ids.size)
    return { sync, read, unread, save, unsave, savedQty, unReadQty }
})

export { useFeedsStore, useItemsStore };
