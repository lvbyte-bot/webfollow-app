// stores/counter.js
import {
    defineStore,
} from 'pinia'
import {
    ref,
    watch,
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
    } = useBaseStore()
    const subscriptions: Ref<Subscription[] | undefined> = ref([])

    const feeds: Ref<Subscription[] | undefined> = ref([])

    async function initFeeds() {
        feeds.value = await Promise.all(subscriptions.value?.map(async g => {
            await Promise.all(g.feeds.map(async f => {
                f.unreadQty = await sumUnread(f.id, unread_item_ids)
            }));
            g.unreadQty = g.feeds.map(f => f.unreadQty).reduce((x, y) => x + y)
            return g
        }) || [])
    }

    async function refresh() {
        subscriptions.value = await listSubscription()
        initFeeds()
    }

    onMounted(async () => {
        refresh()
        watch(unread_item_ids, initFeeds)
    })

    return {
        feeds,
        refresh
    }
})