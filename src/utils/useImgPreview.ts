// src/utils/useImgPreview.ts

import { ref, onMounted, onBeforeUnmount, createApp, h, defineComponent } from 'vue';
import { VBtn, VDialog, VImg } from 'vuetify/components';
import vuetify from '@/plugins/vuetify';

export function useImgPreview() {
    const dialog = ref(false);
    const imgSrc = ref('');

    const parent = document.createElement('div')
    document.body.appendChild(parent)

    const app = createApp(defineComponent({
        setup() {
            return { dialog, imgSrc };
        },
        render() {
            return h(
                VDialog,
                { 'modelValue': this.dialog, 'onUpdate:modelValue': (v: boolean) => this.dialog = v, fullscreen: true, },
                [h('div', { style: { height: '100vh', display: 'flex', 'align-items': 'center' } }, h(VImg, { src: this.imgSrc, maxHeight: '80vh', maxWidth: '100vw', })), h(VBtn, { onClick: () => { this.dialog = false }, icon: 'mdi-close', style: { position: 'absolute', top: '1rem', right: '1rem' } })]
            );
        },
    }))
    app.use(vuetify)
    app.mount(parent)

    const openPreview = (src: string) => {
        imgSrc.value = src;
        dialog.value = true; // 打开对话框
        showDialog(); // 显示对话框
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

    const showDialog = () => {

    };

    onMounted(() => {
        const d = document.querySelector('.reader-warp')
        if (d) {
            d.addEventListener('click', handleImageClick);
        }
    });

    onBeforeUnmount(() => {
        const d = document.querySelector('.reader-warp')
        if (d) {
            d.removeEventListener('click', handleImageClick);
        }
    });

    return {
        openPreview,
        closePreview,
    };
}
