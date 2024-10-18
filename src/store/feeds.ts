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
    listSubscription,
    sumUnread
} from '@/service'
import {
    useBaseStore
} from './base'
import { Subscription } from '@/service/types'

export const useFeedsStore = defineStore('feeds', () => {
    const {
        unread_item_ids
    } = storeToRefs(useBaseStore())
    const subscriptions: Ref<Subscription[] | undefined> = ref([])

    const feeds = computed({
        set: () => unread_item_ids.value.size + subscriptions.value.length,
        get: () => subscriptions.value?.map(g => {
            g.feeds.forEach(async f => {
                // f.isSaved = saved_item_ids.value.has(f.id)
                // f.isRead = !unread_item_ids.value.has(f.id)
                f.unreadQty = await sumUnread(f.id, unread_item_ids.value)
            });
            g.unreadQty = g.feeds.map(f => f.unreadQty).reduce((x, y) => x + y)
            return g
        })
    })

    onMounted(async () => {
        subscriptions.value = await listSubscription()
    })

    return {
        feeds
    }
})