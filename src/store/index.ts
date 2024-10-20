// stores/counter.js
import { defineStore } from 'pinia'
import { useBaseStore } from './base'
import { useFeedsStore } from './feeds'
export { useItemsStore } from './items'
import { sync as sync0 } from '@/service'
import { computed} from 'vue'
export const useAppStore = defineStore('app', () => {
    const {
        saved_item_ids, unread_item_ids, read, unread, save, unsave, refresh
    } = useBaseStore()
    const { refresh: refreshFeed } = useFeedsStore()
    async function sync() {

        await refresh(async () => {
            await sync0()
            await refreshFeed()
        })

    }
    const savedQty = computed(() => saved_item_ids.size)
    const unReadQty = computed(() => unread_item_ids.size)
    return { sync, read, unread, save, unsave, savedQty, unReadQty }
})

export { useFeedsStore };
