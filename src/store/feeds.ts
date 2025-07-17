// stores/counter.js
import {
    defineStore,
    storeToRefs
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
import { useSettingsStore } from './settings'
import { useRoute } from 'vue-router'
import { Subscription, SubscriptionFilter } from '@/service/types'
import { feedRepo, Group, itemRepo } from '@/repository'
import { filterItemIds } from '@/service/itemsFilter'

export const useFeedsStore = defineStore('feeds', () => {
    const {
        unread_item_ids,
        fail_feed_ids,
        refresh: refreshBase
    } = useBaseStore()
    const settingsStore = useSettingsStore();
    const { getFilter } = settingsStore
    const {
        automation
    } = storeToRefs(settingsStore)
    const groups: Ref<Group[]> = ref([])
    const route = useRoute()
    const data: Ref<Subscription[] | undefined> = ref([])

    const subscriptions: Ref<Subscription[] | undefined> = ref([])
    const subscriptionFilters: Ref<SubscriptionFilter[]> = ref([])
    const nextUnReadUrl = ref('')

    let readUrls: any[] = []


    async function buildSubscriptions() {
        // init  subscriptions
        const efids = new Set(fail_feed_ids)
        const items = await itemRepo.listAll(undefined)
        // 需要重构，首次加载构建数结构，后期只更新数量
        const follow = await Promise.all(data.value?.map(async g => {
            try {
                await Promise.all(g.feeds.map(async f => {
                    f.unreadQty = await sumUnread(items, f.id, unread_item_ids)
                    f.isFailure = efids.has(f.id)
                }));

                g.feeds.sort((a, b) => {
                    //错误的在最后 有未读的进行字母排序 无的放后面 
                    let a0 = a.isFailure ? 1 : 0
                    let b0 = b.isFailure ? 1 : 0
                    if (a0 == 1 || b0 == 1) {
                        return a0 - b0
                    }
                    if (a.unreadQty != 0 && b.unreadQty != 0) {
                        return a.title.localeCompare(b.title)
                    } else if (a.unreadQty == 0 && b.unreadQty == 0) {
                        return a.title.localeCompare(b.title)
                    } else {
                        return b.unreadQty - a.unreadQty
                    }
                })
                g.unreadQty = g.feeds.map(f => f.unreadQty).reduce((x, y) => x + y)
                return g
            } catch {
                return g
            }
        }) || [])
        follow.sort((a, b) => {
            // 如果 title 是 "all"，排到最后
            if (a.title === "All") return 1;
            if (b.title === "All") return -1;
            if (a.unreadQty != 0 && b.unreadQty != 0) {
                return a.title.localeCompare(b.title)
            } else if (a.unreadQty == 0 && b.unreadQty == 0) {
                return a.title.localeCompare(b.title)
            } else {
                return (b.unreadQty || 0) - (a.unreadQty || 0)
            }
        })
        subscriptions.value = follow
        await buildSubscriptionFilters()
        // init readUrls
        updateReadUrls()
    }

    async function buildSubscriptionFilters() {
        subscriptionFilters.value = await Promise.all(automation.value.filters.map(async f => ({ id: f.id, name: f.name, unreadQty: f.query ? (await filterItemIds(f.query)).filter(id => unread_item_ids.has(id)).length : 0 })))
    }

    async function refreshFeedUnreadQty() {
        // 直接使用 unread_item_ids 计算未读数量
        const items = await itemRepo.listAll(undefined)
        await Promise.all(subscriptions.value ? subscriptions.value?.map(async g => {
            await Promise.all(g.feeds.map(async f => {
                f.unreadQty = await sumUnread(items, f.id, unread_item_ids)
            }))
            g.unreadQty = g.feeds.map(f => f.unreadQty).reduce((x, y) => x + y, 0)
        }) : [])
        await Promise.all(subscriptionFilters.value.map(async f => {
            const filter = getFilter(f.id)
            if (filter?.query) {
                f.unreadQty = (await filterItemIds(filter.query)).filter(id => unread_item_ids.has(id)).length
            }
        }))
        updateReadUrls()
    }

    async function refresh() {
        const r = await listSubscription()
        if (r) {
            data.value = r[0]
            groups.value = r[1]
            await buildSubscriptions()
        }
    }

    watch(route, () => {
        updateNextUnReadUrl()
    })
    watch(automation, async () => {
        await buildSubscriptionFilters()
        updateReadUrls()
    }, { deep: true })


    function updateReadUrls() {
        readUrls = [{ url: '/explore', unreadQty: 1 }, { url: '/next', unreadQty: 1 }]
        subscriptionFilters.value.forEach(f => {
            readUrls.push({ url: '/filter/' + f.id, unreadQty: f.unreadQty })
        })
        readUrls.push({ url: '/all', unreadQty: unread_item_ids.size })
        subscriptions.value?.forEach(g => {
            readUrls.push({ url: '/c/' + g.id, unreadQty: g.unreadQty })
            g.feeds.forEach(f => {
                readUrls.push({ url: '/f/' + f.id, unreadQty: f.unreadQty })
            })
        })
        updateNextUnReadUrl()
    }

    function updateNextUnReadUrl() {
        nextUnReadUrl.value = getNextUnReadUrl(route.fullPath)
    }

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

    function getPrevUnReadUrl(currentUrl: string): string {
        let prevUrl = ''
        for (let i = 0; i < readUrls.length; i++) {
            if (readUrls[i].url == currentUrl) {
                return prevUrl
            }
            if (readUrls[i].unreadQty && readUrls[i].unreadQty > 0) {
                prevUrl = readUrls[i].url
            }
        }
        return ''
    }

    ifeedApp.getUnReadUrl = function (currentUrl: string, isNext: boolean = true): string {
        if (isNext) {
            return getNextUnReadUrl(currentUrl)
        }
        return getPrevUnReadUrl(currentUrl)
    }

    onMounted(async () => {
        refresh()
        watch(unread_item_ids, refreshFeedUnreadQty)
    })

    async function deleteFeed(id: number, auotRefresh: boolean = true) {
        await extFeed({ feed_id: id, as: 'remove' })
        await feedRepo.del(id);
        (await itemRepo.listAll(item => item.feedId == id)).forEach(item => {
            itemRepo.del(item.id)
        })
        if (auotRefresh) {
            await refreshBase(async () => { }, async () => { })
        }
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
        subscriptionFilters,
        deleteFeed,
        updateFeed,
        nextUnReadUrl,
        refresh,
    }
})