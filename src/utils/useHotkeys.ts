import { useAppStore } from '@/store'
import { ref, onMounted, onUnmounted, Ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export function useHotkeys(showSearch: Ref<boolean>) {
    const appStore = useAppStore()
    const route = useRoute()

    // 当前选中的文章索引
    const currentIndex = ref(-1)
    const currentSearchIndex = ref(-1)
    let searchResultTotal = 0
    const handleKeydown = (e: KeyboardEvent) => {
        // 在阅读视图中
        if (appStore.readerMode) {
            switch (e.key) {
                case 'ArrowLeft':
                    // 上一篇文章
                    const btnprev = document.querySelector('.entry-prev')
                    if (btnprev) {
                        (btnprev as HTMLElement).click()
                    }
                    console.log('ArrowLeft')
                    break
                case 'ArrowRight':
                    // 下一篇文章
                    const btn = document.querySelector('.entry-next')
                    if (btn) {
                        (btn as HTMLElement).click()
                    }
                    console.log('ArrowRight')
                    break
                case 'ArrowUp':
                    // 向上滚动
                    document.querySelector('.cover .overflow')?.scrollBy(0, -100)
                    break
                case 'ArrowDown':
                    // 向下滚动
                    document.querySelector('.cover .overflow')?.scrollBy(0, 100)
                    break
                case 'Escape':
                    // 退出阅读视图
                    appStore.readerMode = false
                    break
            }
        }
        else if (showSearch.value) {
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault()
                    // 选择上一篇文章
                    if (currentSearchIndex.value > 0) {
                        currentSearchIndex.value--
                        focusSearch(currentSearchIndex.value)
                    }
                    break
                case 'ArrowDown':
                    e.preventDefault()
                    const articles = document.querySelectorAll('.search-item')
                    if (searchResultTotal != articles.length) {
                        searchResultTotal = articles.length
                        currentSearchIndex.value = -1
                    }
                    // 选择下一篇文章
                    if (currentSearchIndex.value < articles.length - 1) {
                        currentSearchIndex.value++
                        focusSearch(currentSearchIndex.value)
                    }
                    break
            }
        }
        // 在列表视图中
        else {
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault()
                    const reading = document.querySelector('.cover.reading .overflow')
                    if (reading) {
                        reading.scrollBy(0, -100)
                    } else {
                        // 选择上一篇文章
                        if (currentIndex.value > 0) {
                            currentIndex.value--
                            focusArticle(currentIndex.value)
                        }
                    }
                    break
                case 'ArrowDown':
                    e.preventDefault()
                    const reading0 = document.querySelector('.cover.reading .overflow')
                    if (reading0) {
                        reading0.scrollBy(0, 100)
                    } else {
                        // 选择下一篇文章
                        const articles = document.querySelectorAll('.entry-item')
                        if (currentIndex.value < articles.length - 1) {
                            currentIndex.value++
                            focusArticle(currentIndex.value)
                        }
                    }
                    break
                case 'k':
                    // 打开搜索 组合键 ctl + alt + k
                    if (e.ctrlKey && e.altKey) {
                        showSearch.value = true
                    }
                    break
                case 'Escape':
                    document.querySelectorAll('.cover .mdi-close')?.forEach((item) => {
                        (item as HTMLElement).click()
                    })
                    break
            }
        }
    }

    // 聚焦到指定索引的文章
    const focusArticle = (index: number) => {
        const articles = document.querySelectorAll('.entry-item')
        if (articles[index]) {
            articles[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
                ; (articles[index] as HTMLElement).focus()
        }
    }

    const focusSearch = (index: number) => {
        const articles = document.querySelectorAll('.search-item')
        if (articles[index]) {
            articles[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
                ; (articles[index] as HTMLElement).focus()
        }
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
        watch(route, () => {
            currentIndex.value = -1
            currentSearchIndex.value = -1
        }, { immediate: true })
    })

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })
} 