// src/utils/useImgPreview.ts

import { ref, onMounted, onBeforeUnmount, createApp, h, defineComponent } from 'vue';
import { VBtn, VDialog, VImg } from 'vuetify/components';
import vuetify from '@/plugins/vuetify';

export function useImgPreview() {
    const dialog = ref(false);
    const imgSrc = ref('');
    const currentIndex = ref(0);
    const images = ref<string[]>([]);

    const parent = document.createElement('div')
    document.body.appendChild(parent)

    const app = createApp(defineComponent({
        setup() {
            return { dialog, imgSrc, currentIndex, images };
        },
        render() {
            return h(
                VDialog,
                {
                    'modelValue': this.dialog,
                    'onUpdate:modelValue': (v: boolean) => this.dialog = v,
                    fullscreen: true,
                },
                [
                    h('div', {
                        style: {
                            height: '100vh',
                            display: 'flex',
                            'align-items': 'center',
                            'justify-content': 'center',
                            position: 'relative'
                        }
                    }, [

                        h(VImg, {
                            src: this.imgSrc,
                            maxHeight: '100vh',
                            maxWidth: '100vw',
                        }),
                        h(VBtn, {
                            onClick: () => navigateImage('prev'),
                            icon: 'mdi-chevron-left',
                            style: { position: 'absolute', left: '1rem' }
                        }),
                        h(VBtn, {
                            onClick: () => navigateImage('next'),
                            icon: 'mdi-chevron-right',
                            style: { position: 'absolute', right: '1rem' }
                        })
                    ]),
                    h(VBtn, {
                        onClick: () => { this.dialog = false },
                        icon: 'mdi-close',
                        style: { position: 'absolute', top: '1rem', right: '1rem' }
                    })
                ]
            );
        },
    }))
    app.use(vuetify)
    app.mount(parent)

    const collectImages = () => {
        const d = document.querySelector('.reader-warp');
        if (d) {
            const imgElements = d.querySelectorAll('img:not(.noclick)');
            images.value = Array.from(imgElements).map(img => (img as HTMLImageElement).src);
        }
    };

    const navigateImage = (direction: 'prev' | 'next') => {
        if (images.value.length <= 1) return;

        if (direction === 'prev') {
            currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length;
        } else {
            currentIndex.value = (currentIndex.value + 1) % images.value.length;
        }
        imgSrc.value = images.value[currentIndex.value];
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
        currentIndex.value = images.value.findIndex(img => img === src);
        imgSrc.value = src;
        dialog.value = true;
    };

    const closePreview = () => {
        dialog.value = false;
        imgSrc.value = '';
    };

    const handleImageClick = (event: any) => {
        const target = event.target as HTMLImageElement;
        // console.log(target)
        if (target.tagName === 'IMG' && !target.classList.contains('noclick')) {
            openPreview(target.src); // 点击图片时打开预览
        }
    };

    onMounted(() => {
        const d = document.querySelector('.reader-warp')
        if (d) {
            d.addEventListener('click', handleImageClick);
        }
        window.addEventListener('keydown', handleKeyDown);
    });

    onBeforeUnmount(() => {
        const d = document.querySelector('.reader-warp')
        if (d) {
            d.removeEventListener('click', handleImageClick);
        }
        window.removeEventListener('keydown', handleKeyDown);
    });

    return {
        openPreview,
        closePreview,
    };
}
