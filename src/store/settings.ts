import { defineStore } from 'pinia'
import { onBeforeMount, onMounted, ref, } from 'vue'

interface GeneralSettings {
    startPage: 'home' | 'all' | 'next' | 'firstfolder' | 'recom'
    defaultView: 'text' | 'card' | 'magazine'
    hideReadArticles: boolean
    autoRefresh: boolean
    refreshInterval: number
    pullDataFail: boolean
}

interface AppearanceSettings {
    themeMode: 'light' | 'dark' | 'system'
    themeColor: string
    fontFamily: string
    codeFont: string
    fontSize: number
    density: 'comfortable' | 'compact' | 'default'
    hideSidebar: boolean
}

interface IntegratedSettings {
    apiUrl: string;
    apiKey: string;
    summaryPrompt: string;
    isApiValid?: boolean;
    lastTestTime?: string;
    selectedModel?: string;
}

interface SettingsState {
    general: GeneralSettings
    appearance: AppearanceSettings
    integrated: IntegratedSettings
}



export const useSettingsStore = defineStore('settings', () => {
    const general = ref<GeneralSettings>({
        startPage: 'home',
        defaultView: 'text',
        hideReadArticles: true,
        autoRefresh: false,
        refreshInterval: 30 * 60,
        pullDataFail: false
    })

    const appearance = ref<AppearanceSettings>({
        themeMode: 'system',
        themeColor: '39, 174, 96',
        fontFamily: 'system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        codeFont: 'mono',
        fontSize: 14,
        density: 'default',
        hideSidebar: false
    })

    const integrated = ref<IntegratedSettings>({
        apiUrl: 'https://api.openai.com/v1',
        apiKey: '',
        summaryPrompt: '请用简洁的语言总结这篇文章的主要内容，突出核心观点和关键信息。',
        isApiValid: false,
        lastTestTime: '',
        selectedModel: 'gpt-4o-mini'
    })

    function updateCSSVariables() {
        const root = document.documentElement
        const lineHeights = {
            'comfortable': '1.5rem',
            'compact': '1rem',
            'default': '2rem'
        }
        // 更新字体相关变量
        root.style.setProperty('--font-family', appearance.value.fontFamily)
        root.style.setProperty('--code-font', appearance.value.codeFont)
        root.style.setProperty('--font-size', `${appearance.value.fontSize}px`)
        root.style.setProperty('--line-height', `${lineHeights[appearance.value.density]}`)

        // 更新主题颜色
        root.style.setProperty('--theme-color', appearance.value.themeColor)
        const metaTheme: any = document.querySelector('meta[name=theme-color]')
        if (metaTheme) {
            if (appearance.value.themeMode == 'dark' || window.matchMedia("(prefers-color-scheme: dark)").matches) {
                metaTheme.content = '#292929'
            } else {
                metaTheme.content = '#fff'
            }
        }

    }

    function saveToLocalStorage() {
        localStorage.setItem('app-settings', JSON.stringify({
            general: general.value,
            appearance: appearance.value,
            integrated: integrated.value
        }))
        updateCSSVariables()
    }

    function loadFromLocalStorage() {
        const settings = localStorage.getItem('app-settings')
        if (settings) {
            const parsed: SettingsState = JSON.parse(settings)
            general.value = { ...general.value, ...parsed.general }
            appearance.value = { ...appearance.value, ...parsed.appearance }
            integrated.value = { ...integrated.value, ...parsed.integrated }
        }
    }

    function resetGeneralSettings() {
        general.value = {
            startPage: 'all',
            defaultView: 'text',
            hideReadArticles: true,
            autoRefresh: false,
            refreshInterval: 30 * 60,
            pullDataFail: false
        }
        saveToLocalStorage()
    }

    function resetAppearanceSettings() {
        appearance.value = {
            themeMode: 'system',
            themeColor: '39, 174, 96',
            fontFamily: 'system-ui',
            codeFont: 'mono',
            fontSize: 14,
            density: 'default',
            hideSidebar: false
        }
        saveToLocalStorage()
    }

    function resetIntegratedSettings() {
        integrated.value = {
            apiUrl: 'https://api.openai.com/v1',
            apiKey: '',
            summaryPrompt: '请用简洁的语言总结这篇文章的主要内容，突出核心观点和关键信息。',
            isApiValid: false,
            lastTestTime: '',
            selectedModel: 'gpt-4o-mini',
        }
        saveToLocalStorage()
    }

    onBeforeMount(() => {
        loadFromLocalStorage()
    })

    onMounted(() => {
        updateCSSVariables()
    })

    return {
        general,
        appearance,
        integrated,
        saveToLocalStorage,
        resetGeneralSettings,
        resetAppearanceSettings,
        resetIntegratedSettings
    }
})
