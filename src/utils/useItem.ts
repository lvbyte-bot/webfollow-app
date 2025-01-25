import { FeedItem } from "@/service/types";
import { useBaseStore } from "@/store";
import { computed, ref } from "vue";

export const useItem = () => {
    const item = ref<FeedItem | undefined>();

    const { saved_item_ids, unread_item_ids } = useBaseStore()

    const setItem = (item0: FeedItem) => {
        item.value = item0;
    };

    const currentItem = computed(() => (
        { ...item.value, isRead: !isUnread.value, isSaved: isSaved.value }
    ));

    const isSaved = computed(() => saved_item_ids.has(item.value?.id ?? 0));
    const isUnread = computed(() => unread_item_ids.has(item.value?.id ?? 0));

    return {
        setItem,
        currentItem
    };
};
