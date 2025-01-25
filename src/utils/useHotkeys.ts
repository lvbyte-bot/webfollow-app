import router from '@/router'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

export function useHotkeys() {
    const route = useRoute()
    const showHelp = ref(false)
    const showSearch = ref(false)

    // 当前选中的文章索引
    const currentIndex = ref(-1)
    const currentSearchIndex = ref(-1)
    let searchResultTotal = 0
    const handleKeydown = (e: KeyboardEvent) => {
        const topReader = document.querySelector('.v-main-top .cover.reading') as HTMLElement
        const listReader = document.querySelector('.main-reader .cover.reading') as HTMLElement
        const itemContainer = document.querySelector('.items-container');
        switch (e.key) {
            case 'k':
            case '/':
                e.preventDefault()
                // 打开搜索 k | /
                if (e.ctrlKey) {
                    showSearch.value = true
                    return
                }
                break
            case '?':
                if (e.ctrlKey) {
                    // 打开帮助 ?
                    showHelp.value = true
                    return
                }
                break
            case 'n':
                //  添加新订阅
                if (e.ctrlKey) {
                    router.push('/subscribe')
                    return
                }
                break
            case 'b':
                // 打开侧边栏
                if (e.ctrlKey) {
                    webfollowApp.toogleSidebar()
                    return
                }
                break
        }

        // 在列表视图中
        if (showSearch.value) {
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
        } else if (topReader) {
            switch (e.key) {
                case 'ArrowLeft':
                    // 上一篇文章
                    (document.querySelector('.v-main-top .entry-prev') as HTMLElement)?.click()
                    break
                case 'ArrowRight':
                    // 下一篇文章
                    (document.querySelector('.v-main-top .entry-next') as HTMLElement)?.click()
                    break
            }
            handleReaderKeydown(e, topReader)
        } else if (listReader) {
            switch (e.key) {
                case 'ArrowLeft':
                    // 上一篇文章
                    (document.querySelector('.entry-prev') as HTMLElement)?.click()
                    break
                case 'ArrowRight':
                    // 下一篇文章
                    (document.querySelector('.entry-next') as HTMLElement)?.click()
                    break
            }
            handleReaderKeydown(e, listReader)
        } else if (itemContainer) {
            switch (e.key.toLowerCase()) {
                case 'r':
                    // 刷新 r
                    (document.querySelector('.items-container .items-reload') as HTMLElement)?.click()
                    break
                case 'm':
                    (document.querySelector('.items-container .items-mark-read') as HTMLElement)?.click()
                    break
                case 'n':
                    if (e.shiftKey) {
                        router.push(webfollowApp.getUnReadUrl(route.fullPath, false))
                    } else {
                        router.push(webfollowApp.getUnReadUrl(route.fullPath, true))
                    }
                    break
                case 'v':
                    (document.querySelector('.items-container .items-view-toggle') as HTMLElement)?.click()
                    break
                case 'u':
                    (document.querySelector('.items-container .items-unread-toggle') as HTMLElement)?.click()
                    break
                case '/':
                case 'k':
                    showSearch.value = true
                    break
                case '?':
                case 'h':
                    showHelp.value = true
                    break
                case 'Home':
                    currentIndex.value = 0
                    focusArticle(currentIndex.value)
                    break
                case 'End':
                    currentIndex.value = document.querySelectorAll('.entry-item').length - 1
                    focusArticle(currentIndex.value)
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    // 选择上一篇文章
                    if (currentIndex.value > 0) {
                        currentIndex.value--
                        focusArticle(currentIndex.value)
                    }
                    break
                case 'ArrowDown':
                    e.preventDefault()
                    // 选择下一篇文章
                    const articles = document.querySelectorAll('.entry-item')
                    if (currentIndex.value < articles.length - 1) {
                        currentIndex.value++
                        focusArticle(currentIndex.value)
                    }
                    break

            }
        }

    }

    // 聚焦到指定索引的文章
    const focusArticle = (index: number) => {
        const articles = document.querySelectorAll('.entry-item')
        if (articles[index]) {
            articles[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
            (articles[index] as HTMLElement).focus()
        }
    }

    const focusSearch = (index: number) => {
        const articles = document.querySelectorAll('.search-item')
        if (articles[index]) {
            articles[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
            (articles[index] as HTMLElement).focus()
        }
    }

    function handleReaderKeydown(e: KeyboardEvent, reader: HTMLElement) {
        switch (e.key.toLowerCase()) {
            case 's':
                // 稍后阅读
                (reader.querySelector('.cover.reading .entry-saved') as HTMLElement)?.click()
                break
            case 'm':
                // 标记为已读/未读
                (reader.querySelector('.cover.reading .entry-read') as HTMLElement)?.click()
                break
            case 'i':
                // 内嵌网页
                (reader.querySelector('.cover.reading .entry-inner') as HTMLElement)?.click()
                break
            case 'g':
                // 生成总结
                (reader.querySelector('.cover.reading .entry-ai-summary') as HTMLElement)?.click()
                break
            case 'v':
                // 打开源站
                window.open((reader.querySelector('.cover.reading .title-container .title-warp') as HTMLLinkElement)?.href, '_blank')
                break
            case 'Escape':
                (reader.querySelector('.cover.reading .mdi-close') as HTMLElement)?.click()
                break
            case 'ArrowUp':
                (reader.querySelector('.overflow') as HTMLElement)?.scrollBy(0, -100)
                break
            case 'ArrowDown':
                (reader.querySelector('.overflow') as HTMLElement)?.scrollBy(0, 100)
                break
            case 'PageUp':
                (reader.querySelector('.overflow') as HTMLElement)?.scrollBy(0, -window.innerHeight)
                break
            case 'PageDown':
                (reader.querySelector('.overflow') as HTMLElement)?.scrollBy(0, window.innerHeight)
                break
            case 'Enter':
                // 释放焦点
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        (document.querySelectorAll('.entry-item')[currentIndex.value] as HTMLElement)?.blur();
                        (reader.querySelector('.overflow') as HTMLElement)?.click()
                    }, 200 * i + 300);
                }
                break
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

    return {
        showHelp,
        showSearch
    }
}
