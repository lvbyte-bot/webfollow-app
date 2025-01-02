import { onMounted, onUnmounted, ref, Ref, nextTick } from "vue";

import { debound } from './debound'

export function useScroll(el: any): any {
    let observer: MutationObserver
    onMounted(() => {
        nextTick(() => {
            el.value?.addEventListener('scroll', handleScroll);
        })

        observer = new MutationObserver(debound(() => {
            isBottom.value = false
        }, 300));
        const config = { childList: true, subtree: true };
        if (el.value) {
            observer.observe(el.value, config);
        }
    })
    onUnmounted(() => {
        nextTick(() => {
            observer?.disconnect();
            el.value?.removeEventListener('scroll', handleScroll);
        })
    })

    let isBottom: Ref<boolean> = ref(false)

    const handleScroll = debound(() => {
        const container = el.value;
        let scrollTop = container.scrollTop;

        // 容器的总内容高度
        const scrollHeight = container.scrollHeight;
        // 容器的可视高度
        const clientHeight = container.clientHeight;

        // 判断是否滚动到底部
        if (scrollTop + clientHeight >= scrollHeight - 300) { // 300 像素缓冲
            isBottom.value = true;
        } else {
            isBottom.value = false;
        }
    }, 300)

    return { isBottom }
}