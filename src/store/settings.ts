import { defineStore } from 'pinia'
import { computed, onBeforeMount, onMounted, ref, } from 'vue'
import { ViewMode } from './types'

interface GeneralSettings {
    startPage: 'welcome' | 'all' | 'next' | 'firstfolder' | 'explore'
    defaultView: ViewMode
    hideReadArticles: boolean
    autoRefresh: boolean
    refreshInterval: number
    pullDataFail: boolean
    enableListAISummary: boolean
}

interface AppearanceSettings {
    themeMode: 'light' | 'dark' | 'system'
    themeColor: string
    fontFamily: string
    codeFont: string
    fontSize: number
    density: 'comfortable' | 'compact' | 'default'
    // 减少动画
    lessAnimation: boolean,
    hideSidebar: boolean
    sidebarWidth: number
}

interface IntegratedSettings {
    apiUrl: string;
    apiKey: string;
    summaryPrompt: string;
    isApiValid?: boolean;
    lastTestTime?: string;
    selectedModel?: string;
}

interface FilterItem {
    id: string;
    name: string;
    keywords: KeywordWeight[];
    createTime: number;
}

interface KeywordWeight {
    keyword: string;
    weight: number;
}

interface AutomationSettings {
    filters: FilterItem[];
}

interface SettingsState {
    general: GeneralSettings
    appearance: AppearanceSettings
    integrated: IntegratedSettings
    automation: AutomationSettings
}

export const useSettingsStore = defineStore('settings', () => {
    const general = ref<GeneralSettings>({
        startPage: 'welcome',
        defaultView: 'auto',
        hideReadArticles: true,
        autoRefresh: false,
        refreshInterval: 30 * 60,
        pullDataFail: false,
        enableListAISummary: false
    })

    const appearance = ref<AppearanceSettings>({
        themeMode: 'system',
        themeColor: '39, 174, 96',
        fontFamily: 'system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, SN Pro',
        codeFont: 'mono',
        fontSize: 14,
        density: 'default',
        lessAnimation: false,
        hideSidebar: false,
        sidebarWidth: 256
    })

    const integrated = ref<IntegratedSettings>({
        apiUrl: 'https://api.openai.com/v1',
        apiKey: '',
        summaryPrompt: '请用简洁的语言总结这篇文章的主要内容，突出核心观点和关键信息。',
        isApiValid: false,
        lastTestTime: '',
        selectedModel: 'gpt-4o-mini'
    })

    const automation = ref<AutomationSettings>({
        filters: []
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
            integrated: integrated.value,
            automation: automation.value
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
            automation.value = { ...automation.value, ...parsed.automation }
        }
    }

    function resetGeneralSettings() {
        general.value = {
            startPage: 'welcome',
            defaultView: 'auto',
            hideReadArticles: true,
            autoRefresh: false,
            refreshInterval: 30 * 60,
            pullDataFail: false,
            enableListAISummary: false
        }
        saveToLocalStorage()
    }

    function resetAppearanceSettings() {
        appearance.value = {
            themeMode: 'system',
            themeColor: '39, 174, 96',
            fontFamily: 'system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, SN Pro',
            codeFont: 'mono',
            fontSize: 14,
            density: 'default',
            lessAnimation: false,
            hideSidebar: false,
            sidebarWidth: 256
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
            selectedModel: 'gpt-4o-mini'
        }
        saveToLocalStorage()
    }

    function resetAutomationSettings() {
        automation.value = {
            filters: []
        }
        saveToLocalStorage()
    }

    function getFilter(filterId: string): FilterItem | undefined {
        return automation.value.filters.find(f => f.id === filterId);
    }

    onBeforeMount(() => {
        loadFromLocalStorage()
    })

    onMounted(() => {
        updateCSSVariables()
    })

    const proxyIntegrated = computed(() => ({
        ...integrated.value,
        apiUrl: integrated.value.apiKey ? integrated.value.apiUrl : 'https://oneapi.jisuai.cn/v1',
        apiKey: integrated.value.apiKey ? integrated.value.apiKey : 'sk-z6Qddv96AOIsjwGIL5ivKrfxHjojBOkl6z2MvKOgFbooydV7',
        selectedModel: integrated.value.apiKey ? integrated.value.selectedModel : 'deepseek-chat',
        isApiValid: integrated.value.apiKey ? integrated.value.isApiValid : true,
    }))

    return {
        general,
        appearance,
        integrated,
        proxyIntegrated,
        automation,
        getFilter,
        saveToLocalStorage,
        resetGeneralSettings,
        resetAppearanceSettings,
        resetIntegratedSettings,
        resetAutomationSettings
    }
})
