import { defineStore } from 'pinia'
import { onMounted, ref } from 'vue'

interface GeneralSettings {
    startPage: 'all' | 'next' | 'firstfolder'
    defaultView: 'text' | 'card' | 'magazine'
    hideReadArticles: boolean
    autoRefresh: boolean
    refreshInterval: number
}

interface AppearanceSettings {
    themeMode: 'light' | 'dark' | 'system'
    themeColor: string
    fontFamily: string
    codeFont: string
    fontSize: number
    density: 'comfortable' | 'compact' | 'default'
}

interface SettingsState {
    general: GeneralSettings
    appearance: AppearanceSettings
}



export const useSettingsStore = defineStore('settings', () => {
    const general = ref<GeneralSettings>({
        startPage: 'all',
        defaultView: 'magazine',
        hideReadArticles: false,
        autoRefresh: false,
        refreshInterval: 30 * 60
    })

    const appearance = ref<AppearanceSettings>({
        themeMode: 'system',
        themeColor: '39, 174, 96',
        fontFamily: 'system-ui',
        codeFont: 'mono',
        fontSize: 14,
        density: 'default'
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

    }

    function saveToLocalStorage() {
        localStorage.setItem('app-settings', JSON.stringify({
            general: general.value,
            appearance: appearance.value
        }))
        updateCSSVariables()
    }

    function loadFromLocalStorage() {
        const settings = localStorage.getItem('app-settings')
        if (settings) {
            const parsed: SettingsState = JSON.parse(settings)
            general.value = { ...general.value, ...parsed.general }
            appearance.value = { ...appearance.value, ...parsed.appearance }
        }
    }

    function resetGeneralSettings() {
        general.value = {
            startPage: 'all',
            defaultView: 'magazine',
            hideReadArticles: false,
            autoRefresh: false,
            refreshInterval: 30 * 60
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
            density: 'default'
        }
        saveToLocalStorage()
    }

    onMounted(() => {
        loadFromLocalStorage()
        updateCSSVariables()
    })

    return {
        general,
        appearance,
        saveToLocalStorage,
        resetGeneralSettings,
        resetAppearanceSettings
    }
})