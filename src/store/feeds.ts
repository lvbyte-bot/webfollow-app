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
    sumUnread,
} from '@/service'
import { extFeed } from '@/api'
import {
    useBaseStore
} from './base'
import { useRoute } from 'vue-router'
import { Subscription } from '@/service/types'
import { feedRepo, Group, itemRepo } from '@/repository'

export const useFeedsStore = defineStore('feeds', () => {
    const {
        unread_item_ids,
        fail_feed_ids
    } = useBaseStore()
    const groups: Ref<Group[]> = ref([])
    const route = useRoute()
    const data: Ref<Subscription[] | undefined> = ref([])

    const subscriptions: Ref<Subscription[] | undefined> = ref([])
    const nextUnReadUrl = ref('')

    let readUrls: any[] = []

    async function initFeeds() {
        // init  subscriptions
        const efids = new Set(fail_feed_ids)
        const items = await itemRepo.listAll(undefined)
        subscriptions.value = await Promise.all(data.value?.map(async g => {
            try {
                await Promise.all(g.feeds.map(async f => {
                    f.unreadQty = await sumUnread(items, f.id, unread_item_ids)
                    f.isFailure = efids.has(f.id)
                }));
                g.unreadQty = g.feeds.map(f => f.unreadQty).reduce((x, y) => x + y)
                return g
            } catch {
                return g
            }
        }) || [])
        // init readUrls
        readUrls = [{ url: '/all' }, { url: '/next' }, { url: '/recom' }]
        subscriptions.value.forEach(g => {
            readUrls.push({ url: '/c/' + g.id, unreadQty: g.unreadQty })
            g.feeds.forEach(f => {
                readUrls.push({ url: '/f/' + f.id, unreadQty: f.unreadQty })
            })
        })
    }

    async function refresh() {
        const r = await listSubscription()
        if (r) {
            data.value = r[0]
            groups.value = r[1]
            await initFeeds()
        }

    }

    watch(route, () => {
        nextUnReadUrl.value = getNextUnReadUrl(route.fullPath)
    })

    watch(subscriptions, () => {
        setTimeout(() => {
            nextUnReadUrl.value = getNextUnReadUrl(route.fullPath)
        }, 500);
        // console.log(feeds)
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
        await extFeed({ feed_id: id, as: 'remove' })
        await feedRepo.del(id);
        (await itemRepo.listAll(item => item.feedId == id)).forEach(item => {
            itemRepo.del(item.id)
        })
        await refresh()
    }

    async function updateFeed(id: number, groupId: number) {
        const feed = await feedRepo.get(id)
        if (feed) {
            await extFeed({ feed_id: id, group_id: groupId, feed_url: feed.url, as: 'update' })
            feed.groupId = groupId
            await feedRepo.save(feed)
            await refresh()
        }
    }




    return {
        groups,
        subscriptions,
        deleteFeed,
        updateFeed,
        nextUnReadUrl,
        refresh,
        readUrls
    }
})