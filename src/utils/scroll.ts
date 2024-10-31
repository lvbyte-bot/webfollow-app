import { onMounted, onUnmounted, Ref, ref } from "vue";


export function useScroll(el: any) {
    const scrollTop: Ref<number> = ref(0)
    const scroll = (e: any) => {
        scrollTop.value = e.target.scrollTop
    }
    onMounted(() => {
        el.value.addEventListener('scroll', scroll);
    })
    onUnmounted(() => {
        if (el.value) {
            el.value.removeEventListener('scroll', scroll);
        }
    })
    return { scrollTop }
}