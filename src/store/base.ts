// stores/counter.js
import { defineStore } from 'pinia'
import { reactive, Reactive } from 'vue'
import { Marked, listSavedIds, listUnreadIds, listFailFeedIds, read as read0, unread as unread0, save as save0, unsave as unsave0, readItemIds, unReadItemIds } from '@/service'

function setItem(key: string, dataset: Set<number>) {
    localStorage.setItem(key, JSON.stringify(Array.from(dataset)))
}

export const useBaseStore = defineStore('base', () => {
    const saved_item_ids: Reactive<Set<number>> = reactive(new Set(JSON.parse(localStorage.getItem('sids') || "[]")))
    const unread_item_ids: Reactive<Set<number>> = reactive(new Set(JSON.parse(localStorage.getItem('urids') || "[]")))
    const fail_feed_ids: Reactive<Set<number>> = reactive(new Set(JSON.parse(localStorage.getItem('efids') || "[]")))

    async function read(id: number, marked: Marked = Marked.ITEM, before?: number, after?: number, feedId?: number) {
        await read0(id, marked, before, after, feedId)
        if (marked == Marked.ITEM) {
            unread_item_ids.delete(id)
        } else {
            unread_item_ids.clear();
            (await listUnreadIds()).forEach((item: number) => unread_item_ids.add(item));
        }
        setItem('urids', unread_item_ids)
    }

    async function readItemBatch(ids: number[]) {
        try {
            await readItemIds(ids)
            ids.forEach(id => unread_item_ids.delete(id))
            setItem('urids', unread_item_ids)
        } catch {
            const batchSize = 5;
            const batches = [];
            // Split ids into batches of 5
            for (let i = 0; i < ids.length; i += batchSize) {
                batches.push(ids.slice(i, i + batchSize));
            }
            // Process each batch
            for (const batch of batches) {
                try {
                    await Promise.all(batch.map((id) => read(id)));
                } catch (error) {
                    ifeedApp.tip("网络异常");
                    // Continue with next batch even if current batch fails
                    continue;
                }
            }
        }

    }

    async function unreadItemBatch(ids: number[]) {
        try {
            await unReadItemIds(ids)
            ids.forEach(id => unread_item_ids.add(id))
            setItem('urids', unread_item_ids)
        } catch {
            const batchSize = 5;
            const batches = [];
            // Split ids into batches of 5
            for (let i = 0; i < ids.length; i += batchSize) {
                batches.push(ids.slice(i, i + batchSize));
            }
            // Process each batch
            for (const batch of batches) {
                try {
                    await Promise.all(batch.map((id) => unread(id)));
                } catch (error) {
                    ifeedApp.tip("网络异常");
                    // Continue with next batch even if current batch fails
                    continue;
                }
            }
        }
    }

    async function unread(id: number, marked: Marked = Marked.ITEM, before?: number) {
        await unread0(id, marked, before)
        if (marked == Marked.ITEM) {
            unread_item_ids.add(id)
        } else {
            unread_item_ids.clear();
            (await listUnreadIds()).forEach((item: number) => unread_item_ids.add(item));
        }
        setItem('urids', unread_item_ids)
    }

    async function save(id: number) {
        await save0(id)
        saved_item_ids.add(id)
        setItem('sids', saved_item_ids)
    }

    async function unsave(id: number) {
        await unsave0(id)
        saved_item_ids.delete(id)
        setItem('sids', saved_item_ids)
    }

    function clearFailFeedIds() {
        fail_feed_ids.clear()
        localStorage.removeItem('efids')
    }

    async function initData(urids: number[], sids: number[], efids: number[]) {
        sids.forEach((item: number) => saved_item_ids.add(item));
        urids.forEach((item: number) => unread_item_ids.add(item));
        efids.forEach((item: number) => fail_feed_ids.add(item));
        localStorage.setItem('sids', JSON.stringify(sids))
        localStorage.setItem('urids', JSON.stringify(urids))
        localStorage.setItem('efids', JSON.stringify(efids))
    }

    async function refresh(refreshCb: () => Promise<void>, noRefreshCb: () => Promise<void>) {
        const d = await listUnreadIds()
        // 非标准接口
        let fids: number[] = []
        try {
            fids = await listFailFeedIds()
        } catch {

        }
        if (d.length != unread_item_ids.size || fids.length != fail_feed_ids.size) {
            unread_item_ids.clear()
            saved_item_ids.clear()
            initData(d, await listSavedIds(), fids)
            await refreshCb()
        } else {
            await noRefreshCb()
        }

    }

    return { saved_item_ids, unread_item_ids, fail_feed_ids, read, readItemBatch, unread, unreadItemBatch, save, unsave, refresh, clearFailFeedIds }
})

