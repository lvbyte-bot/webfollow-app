import {
    onMounted,
    onUnmounted,
    Ref,
    ref
} from 'vue'

/**
 * 监控元素宽度变化的 Hook
 * @param {elementRef} 
 * @returns {{
 *   width: Ref<number>,
 *   height: Ref<number>,
 * }}
 */
export function useElResize(elementRef: Ref<HTMLElement> | HTMLElement | (() => HTMLElement)) {
    const width = ref(0)
    const height = ref(0)
    let observer: ResizeObserver | null = null

    const handleResize = (entries: ResizeObserverEntry[]) => {
        const entry = entries[0]
        const {
            width: newWidth,
            height: newHeight
        } = entry.contentRect

        width.value = Math.round(newWidth)
        height.value = Math.round(newHeight)

    }

    const watchElement = (el: Element) => {
        if (!el) return

        // 如果已经在观察一个元素，先停止观察
        if (observer && el) {
            observer.unobserve(el)
        }


        // 创建新的观察器
        if (!observer) {
            observer = new ResizeObserver(handleResize)
        }

        // 开始观察新元素
        observer.observe(el)
    }

    onMounted(() => {
        const el = elementRef instanceof HTMLElement ? elementRef : elementRef instanceof Function ? elementRef() : elementRef.value
        watchElement(el)
    });

    onUnmounted(() => {
        if (observer) {
            observer.disconnect()
            observer = null
        }
    })

    return {
        width,
        height,
    }
}