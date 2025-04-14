// src/utils/useImgPreview.ts

import { ref, createApp, h, defineComponent } from 'vue';
import ImagePreviewDialog from '@/components/ImagePreviewDialog.vue';

// 添加类型定义
interface ImgPreviewInstance {
    destroy: () => void;
    init: () => void;
}

interface ImgPreviewOptions {
    selector?: string;
    excludeClass?: string;
}

function createImgPreview(vuetify: any, options: ImgPreviewOptions = {}): ImgPreviewInstance {
    const dialog = ref(false);
    const imgSrc = ref('');
    const currentIndex = ref(0);
    const images = ref<HTMLImageElement[]>([]);

    const {
        selector = '.reading .reader-warp',
        excludeClass = 'noclick'
    } = options;

    // 使用 WeakMap 来存储事件监听器引用
    const eventListeners = new WeakMap();

    const parent = document.createElement('div');
    document.body.appendChild(parent);



    const collectImages = () => {
        const container = document.querySelector(selector);
        if (!container) return;

        try {
            const imgElements = container.querySelectorAll(`img:not(.${excludeClass})`);
            const validImages = Array.from(imgElements)
                .map(img => (img as HTMLImageElement))
                .filter(src => src); // 过滤掉无效的src

            images.value = validImages;
        } catch (error) {
            console.error('Error collecting images:', error);
        }
    };

    // 优化导航逻辑
    const navigateImage = (direction: 'prev' | 'next') => {
        if (images.value.length <= 1) return;
        const delta = direction === 'prev' ? -1 : 1;
        currentIndex.value = (currentIndex.value + delta + images.value.length) % images.value.length;
        imgSrc.value = images.value[currentIndex.value].src;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (!dialog.value) return;

        if (event.key === 'ArrowLeft') {
            navigateImage('prev');
        } else if (event.key === 'ArrowRight') {
            navigateImage('next');
        } else if (event.key === 'Escape') {
            closePreview();
        }
    };

    const openPreview = (src: string) => {
        collectImages();
        currentIndex.value = images.value.findIndex(img => img.src === src);
        imgSrc.value = src;
        dialog.value = true;
    };

    const closePreview = () => {
        dialog.value = false;
        imgSrc.value = '';
    };

    // 使用防抖处理图片点击
    const handleImageClick = (() => {
        let timeout: number;
        return (event: MouseEvent) => {
            if (timeout) {
                window.clearTimeout(timeout);
            }

            timeout = window.setTimeout(() => {
                const target = event.target as HTMLElement;
                if (document.querySelector('.reading')?.contains(target) && target.tagName === 'IMG' && !target.classList.contains(excludeClass)) {
                    openPreview((target as HTMLImageElement).src);
                }
            }, 100);
        };
    })();

    const app = createApp(defineComponent({
        setup() {
            return () => h(ImagePreviewDialog, {
                modelValue: dialog.value,
                'onUpdate:modelValue': (v: boolean) => dialog.value = v,
                imgSrc: imgSrc.value,
                images: images.value.map(img => img.src),
                onNavigate: (direction: 'prev' | 'next' | 'goto' | number) => {
                    if (typeof direction === 'number') {
                        // 处理点击缩略图的情况
                        currentIndex.value = direction;
                        imgSrc.value = images.value[direction].src;
                    } else if (direction === 'prev' || direction === 'next') {
                        // 处理前进/后退导航
                        navigateImage(direction);
                    } else if (direction === 'goto') {
                        images.value[currentIndex.value].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        closePreview();
                    }
                }
            });
        }
    }));
    app.use(vuetify)
    app.mount(parent)

    const init = () => {
        const mainContainer: HTMLElement | null = document.querySelector('.v-main');
        if (!mainContainer) {
            console.warn('Main container not found');
            return;
        }

        // 移除旧的事件监听器
        if (eventListeners.has(mainContainer)) {
            const oldListener = eventListeners.get(mainContainer);
            mainContainer.removeEventListener('click', oldListener);
        }

        // 添加新的事件监听器
        mainContainer.addEventListener('click', handleImageClick);
        eventListeners.set(mainContainer, handleImageClick);
        window.addEventListener('keydown', handleKeyDown);
        log('imgPreview init')
    };

    const destroy = () => {
        const mainContainer: HTMLElement | null = document.querySelector('.v-main');
        if (mainContainer && eventListeners.has(mainContainer)) {
            const listener = eventListeners.get(mainContainer);
            mainContainer.removeEventListener('click', listener);
            eventListeners.delete(mainContainer);
        }

        window.removeEventListener('keydown', handleKeyDown);
        parent.remove();
        app.unmount();
    };

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(init, 1000);
    });

    return {
        destroy,
        init
    };
}

// 优化插件导出
export default {
    install(app: any, options?: ImgPreviewOptions) {
        const vuetify = app.config.globalProperties.$vuetify;
        app.config.globalProperties.$useImgPreview = createImgPreview(vuetify, options);
    },
};