import { defineStore } from 'pinia'
import { ref, onBeforeMount, watch } from 'vue'

interface Play {
    currentPlaying: Audio | null,
    list: Audio[]
}

export interface Audio {
    id: number,
    url: string | undefined | null,
    thumbil: string,
    title: string,
    subtitle: string
    feedId?: number,
    currentTime: number,
}

export const usePlayListStore = defineStore('playlist', () => {

    const currentPlaying = ref<Audio | null>(null);
    const playlist = ref<Audio[]>([])
    const isPlaying = ref<boolean>(false);

    let tmpTogglePlaying: any = null

    watch(() => currentPlaying.value?.currentTime, () => {
        saveToLocalStorage()
    })

    function play(item: Audio) {
        if (playlist.value.filter(item0 => item0.id == item.id).length == 0) {
            add(item)
        }
        currentPlaying.value = item;
        saveToLocalStorage()
        setTimeout(() => {
            togglePlaying()
        }, 600);
    }

    function setPlaying(playing: boolean) {
        isPlaying.value = playing;
    }

    function add(item: Audio) {
        playlist.value.push(item)
        saveToLocalStorage()
    }

    function remove(itemId: number) {
        playlist.value = playlist.value.filter(item => item.id !== itemId)
        saveToLocalStorage()
    }

    function saveToLocalStorage() {
        const playinfo: Play = {
            currentPlaying: currentPlaying.value,
            list: playlist.value,
        }
        localStorage.setItem('playlist', JSON.stringify(playinfo))
    }

    function loadFromLocalStorage() {
        const storedPlayinfo = localStorage.getItem('playlist');
        if (storedPlayinfo) {
            const playinfo: Play = JSON.parse(storedPlayinfo);
            currentPlaying.value = playinfo.currentPlaying
            playlist.value = playinfo.list || []
        } else {
            currentPlaying.value = null
            playlist.value = []
        }
    }

    function setTogglePlaying(f: any) {
        tmpTogglePlaying = f
    }

    function togglePlaying() {

        if (tmpTogglePlaying) {
            tmpTogglePlaying()
        }
    }

    function setCurrentTime(currentTime: number) {
        if (currentPlaying.value) {
            currentPlaying.value.currentTime = currentTime
        }
    }

    onBeforeMount(() => {
        loadFromLocalStorage()
    })

    function clear() {
        localStorage.removeItem('playlist')
        setTimeout(() => {
            loadFromLocalStorage()
        }, 300);
    }

    return {
        playlist,
        currentPlaying,
        isPlaying,
        remove,
        play,
        setPlaying,
        togglePlaying,
        setTogglePlaying,
        setCurrentTime,
        clear
    }
})
