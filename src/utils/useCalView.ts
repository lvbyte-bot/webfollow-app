import { ViewMode } from '@/store/types'
import { FeedItem, ItemType } from '@/service/types'
import { Ref, computed } from 'vue'

/**
 * 计算视图名称
 * @param view 视图类型
 * @param itemsType 项目类型
 * @returns 视图名称
 */
function useCalView(view: Ref<ViewMode>, itemsType: Ref<ItemType>): { viewMode: Ref<ViewMode> } {
    const viewMode: Ref<ViewMode> = computed(() => {
        return view.value == "auto"
            ? itemsType.value == ItemType.VIDEO
                ? "card"
                : itemsType.value == ItemType.IMAGE
                    ? "list"
                    : itemsType.value == ItemType.PODCAST
                        ? "column"
                        : "column"
            : view.value;
    });
    return { viewMode }
}

/**
 * 计算entry类型
 * @param items entry列表
 * @returns entry类型
 */
function useCalItemType(items: Ref<FeedItem[]>): { itemsType: Ref<ItemType> } {
    const itemsType: Ref<ItemType> = computed(() => {
        const counts = items.value.slice(0, 50).reduce((acc: any, item: FeedItem) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
        }, {});
        const type = items.value.length > 0 ? Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0][0] : 'BASIC';
        return type == "IMAGE" ? ItemType.IMAGE : type == "VIDEO" ? ItemType.VIDEO : type == "PODCAST" ? ItemType.PODCAST : ItemType.BASIC;
    });
    return { itemsType }
}

/**
 * 计算视图名称
 * @param view 视图类型
 * @param items entry列表
 * @returns 视图名称
 */
export function useCalViewMode(view: Ref<ViewMode>, items: Ref<FeedItem[]>): { viewMode: Ref<ViewMode>, itemsType: Ref<ItemType> } {
    const { itemsType } = useCalItemType(items);
    const { viewMode } = useCalView(view, itemsType);
    return { viewMode, itemsType }
}