// stores/counter.js
import { defineStore } from 'pinia'
import { onMounted, ref, Ref } from 'vue'
import { Marked, listSavedIds, listUnreadIds, read as read0, unread as unread0, save as save0, unsave as unsave0 } from '@/service'

export const useBaseStore = defineStore('base', () => {
    const saved_item_ids: Ref<Set<number>> = ref(new Set())
    const unread_item_ids: Ref<Set<number>> = ref(new Set())

    async function read(id: number, marked: Marked, before?: number) {
        await read0(id, marked, before)
        console.log(unread_item_ids.value)
        if (marked == Marked.ITEM) {
            unread_item_ids.value.delete(id)
        } else {
            unread_item_ids.value = new Set(await listSavedIds())
        }
        console.log(unread_item_ids.value)

    }

    async function unread(id: number, marked: Marked, before?: number) {
        await unread0(id, marked, before)
        if (marked == Marked.ITEM) {
            unread_item_ids.value.add(id)
        } else {
            unread_item_ids.value = new Set(await listSavedIds())
        }
    }

    async function save(id: number) {
        await save0(id)
        saved_item_ids.value.add(id)
    }

    async function unsave(id: number) {
        await unsave0(id)
        saved_item_ids.value.delete(id)
    }

    onMounted(async () => {
        saved_item_ids.value = new Set(await listSavedIds())
        unread_item_ids.value = new Set(await listUnreadIds())
    })


    return { saved_item_ids, unread_item_ids, read, unread, save, unsave }
})

