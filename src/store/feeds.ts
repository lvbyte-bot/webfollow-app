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
import { useRoute } from 'vue-router'
import { Subscription } from '@/service/types'
import { feedRepo, Group, itemRepo } from '@/repository'

export const useFeedsStore = defineStore('feeds', () => {
    const {
        unread_item_ids
    } = useBaseStore()
    const groups: Ref<Group[]> = ref([])
    const route = useRoute()
    const subscriptions: Ref<Subscription[] | undefined> = ref([])

    const feeds: Ref<Subscription[] | undefined> = ref([])
    const nextUnReadUrl = ref('')

    let readUrls: any[] = []

    async function initFeeds() {
        feeds.value = await Promise.all(subscriptions.value?.map(async g => {
            try {
                await Promise.all(g.feeds.map(async f => {
                    f.unreadQty = await sumUnread(f.id, unread_item_ids)
                }));
                g.unreadQty = g.feeds.map(f => f.unreadQty).reduce((x, y) => x + y)
                return g
            } catch {
                return g
            }
        }) || [])
        readUrls = [{ url: '/all' }, { url: '/next' }]
        feeds.value.forEach(g => {
            readUrls.push({ url: '/c/' + g.id, unreadQty: g.unreadQty })
            g.feeds.forEach(f => {
                readUrls.push({ url: '/f/' + f.id, unreadQty: f.unreadQty })
            })
        })

    }

    async function refresh() {
        const data = await listSubscription()
        if (data) {
            subscriptions.value = data[0]
            groups.value = data[1]
            await initFeeds()
        }

    }

    watch(route, () => {
        nextUnReadUrl.value = getNextUnReadUrl(route.fullPath)
    })

    watch(feeds, () => {
        setTimeout(() => {
            nextUnReadUrl.value = getNextUnReadUrl(route.fullPath)
        }, 500);
    })

    function getNextUnReadUrl(currentUrl: string): string {
        let canNextUrl = false
        for (let i = 0; i < readUrls.length; i++) {
            if (canNextUrl && readUrls[i].unreadQty && readUrls[i].unreadQty > 0) {
                return readUrls[i].url
            }
            if (readUrls[i].url == currentUrl) {
                canNextUrl = true
            }
        }
        return ''
    }

    onMounted(async () => {
        refresh()
        watch(unread_item_ids, initFeeds)
    })

    async function deleteFeed(id: number) {
        await feedRepo.del(id);
        (await itemRepo.listAll(item => item.feedId == id)).forEach(item => {
            itemRepo.del(item.id)
        })
        await refresh()
    }

    return {
        groups,
        feeds,
        deleteFeed,
        nextUnReadUrl,
        refresh,
        readUrls
    }
})