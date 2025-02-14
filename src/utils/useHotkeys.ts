import router from '@/router'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

export function useHotkeys() {
    const route = useRoute()
    const showHelp = ref(false)
    const showSearch = ref(false)

    // 当前选中的文章索引
    let currentIndex = -1
    let currentSearchIndex = 0
    let searchResultTotal = 0
    const handleKeydown = (e: KeyboardEvent) => {
        const topReader = document.querySelector('.v-main-top .cover.reading') as HTMLElement
        const listReader = document.querySelector('.main-reader .cover.reading') as HTMLElement
        const itemContainer = document.querySelector('.items-container');
        const imgPreviewEl = document.querySelector('body>.v-overlay-container .v-overlay')

        if (imgPreviewEl && !showSearch.value) {
            return
        }
        switch (e.key) {
            case 'k':
            case '/':
                // 打开搜索 k | /
                if (e.ctrlKey) {
                    e.preventDefault()
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
                    break
                case 'ArrowDown':
                    e.preventDefault()
                    if (searchResultTotal != document.querySelectorAll('.search-item').length) {
                        searchResultTotal = document.querySelectorAll('.search-item').length
                        currentSearchIndex = 0
                    }
                    if (currentSearchIndex == 0) {
                        focusSearch(0)
                    }
                    currentSearchIndex++
                    break
            }
        } else if (showHelp.value) {
            // skip
        } else if (topReader) {
            handleReaderKeydown(e, topReader)
        } else if (listReader) {
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
                case 'a':
                    router.push('/subscribe')
                    break


            }
            switch (e.key) {
                case 'Home':
                    currentIndex = 0
                    focusArticle(currentIndex)
                    break
                case 'End':
                    currentIndex = document.querySelectorAll('.entry-item').length - 1
                    focusArticle(currentIndex)
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    // 选择上一篇文章
                    if (currentIndex > 0) {
                        currentIndex--
                        focusArticle(currentIndex)
                    }
                    break
                case 'ArrowDown':
                    e.preventDefault()
                    // 选择下一篇文章
                    const articles = document.querySelectorAll('.entry-item')
                    if (currentIndex < articles.length) {
                        currentIndex++
                        focusArticle(currentIndex)
                    }
                    break
            }
        }

    }

    // 聚焦到指定索引的文章
    const focusArticle = (index: number) => {
        const articles = document.querySelectorAll('.entry-item')
        if (articles[index]) {
            (articles[index] as HTMLElement).focus()
        }
    }

    const focusSearch = (index: number) => {
        const articles = document.querySelectorAll('.search-item')
        if (articles[index]) {
            (articles[index] as HTMLElement).focus()
        }
    }

    function handleReaderKeydown(e: KeyboardEvent, reader: HTMLElement) {
        switch (e.key.toLowerCase()) {
            case 's':
                // 稍后阅读
                (reader.querySelector('.entry-saved') as HTMLElement)?.click()
                break
            case 'm':
                // 标记为已读/未读
                (reader.querySelector('.entry-read') as HTMLElement)?.click()
                break
            case 'i':
                // 内嵌网页
                (reader.querySelector('.entry-inner') as HTMLElement)?.click()
                break
            case 'g':
                // 生成总结
                (reader.querySelector('.entry-ai-summary') as HTMLElement)?.click()
                break
            case 'v':
                // 打开源站
                window.open((reader.querySelector('.title-container .title-warp') as HTMLLinkElement)?.href, '_blank')
                break
        }
        switch (e.key) {
            case 'ArrowLeft':
                // 上一篇文章
                (reader.querySelector('.entry-prev') as HTMLElement)?.click()
                break
            case 'ArrowRight':
                // 下一篇文章
                (reader.querySelector('.entry-next') as HTMLElement)?.click()
                break
            case 'Escape':
                (reader.querySelector('.mdi-close') as HTMLElement)?.click()
                break
            case 'ArrowUp':
                const prev = reader.querySelector('.swiper-button-prev')
                if (prev) {
                    (prev as HTMLElement).click()
                } else {
                    (reader.querySelector('.overflow') as HTMLElement)?.scrollBy(0, -100)
                }
                break
            case 'ArrowDown':
                const next = reader.querySelector('.swiper-button-next')
                if (next) {
                    (next as HTMLElement).click()
                } else {
                    (reader.querySelector('.overflow') as HTMLElement)?.scrollBy(0, 100)
                }
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
                        (document.querySelectorAll('.entry-item')[currentIndex] as HTMLElement)?.blur();
                        (reader.querySelector('.overflow') as HTMLElement)?.click()
                    }, 200 * i + 300);
                }
                break
        }
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
        watch(route, () => {
            currentIndex = -1
            currentSearchIndex = 0
        }, { immediate: true })
    })

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })

    watch(showSearch, () => {
        currentSearchIndex = 0
    })
    return {
        showHelp,
        showSearch
    }
}
