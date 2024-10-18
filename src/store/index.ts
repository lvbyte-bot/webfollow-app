// stores/counter.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
export { useFeedsStore } from './feeds'
export { useItemsStore } from './items'
export { useBaseStore } from './base'
export const useCounterStore = defineStore('counter', () => {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    function increment() {
        count.value++
    }
    return { count, doubleCount, increment }
})

