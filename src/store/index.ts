// stores/counter.js
import { defineStore } from 'pinia'
import { useBaseStore } from './base'
import { useFeedsStore } from './feeds'
import { useItemsStore } from './items'
import { sync as sync2local } from '@/service'
import { clearIndexedDB } from '@/utils/dbHelper'
import { computed, Ref, watch, ref } from 'vue'
export const useAppStore = defineStore('app', () => {
    const {
        saved_item_ids, unread_item_ids, read, unread, save, unsave, refresh
    } = useBaseStore()
    const { refresh: refreshFeed } = useFeedsStore()
    const { refreshItems } = useItemsStore()
    const loading: Ref<boolean> = ref(false)
    const auth: Ref<any> = ref(JSON.parse(localStorage.getItem('auth') || '{"username":"guest"}'))

    async function sync() {

        await refresh(async () => {
            loading.value = true
            await sync2local()
            await refreshFeed()
            await refreshItems()
            console.log('sync end')
            loading.value = false
        })

    }

    async function reloadBuild() {
        await clearIndexedDB()
        unread_item_ids.clear()
        setTimeout(async () => {
            auth.value = JSON.parse(localStorage.getItem('auth') || '{"username":"guest"}')
            await refreshFeed()
            await sync()
        }, 1000);

    }

    const savedQty = computed(() => saved_item_ids.size)
    const unReadQty = computed(() => unread_item_ids.size)
    watch(unReadQty, () => {
        document.title = `(${unReadQty.value})Webfollow`
    })
    return { reloadBuild, sync, loading, read, unread, save, unsave, savedQty, unReadQty, auth }
})

export { useFeedsStore, useItemsStore };
