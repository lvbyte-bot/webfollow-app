import { createApp, h, ref } from "vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
export interface ConfirmOptions {
    title?: string;
    message: string;
}

const createConfirm = (vuetify: any) => {
    return (options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            const div = document.createElement("div");
            document.body.appendChild(div);

            const app = createApp({
                setup() {
                    const visible = ref(true);

                    const destroy = () => {
                        app.unmount();
                        div.remove();
                    };

                    const handleConfirm = () => {
                        visible.value = false;
                        destroy();
                        resolve(true);
                    };

                    const handleCancel = () => {
                        visible.value = false;
                        destroy();
                        resolve(false);
                    };

                    return () =>
                        h(ConfirmDialog, {
                            ...options,
                            modelValue: visible.value,
                            show: () => (visible.value = true),
                            onConfirm: handleConfirm,
                            onCancel: handleCancel,
                        });
                },
            });
            app.use(vuetify);
            app.mount(div);
        });
    }
};

export let confirm: (options: ConfirmOptions) => Promise<boolean>;

export default {
    install(app: any) {
        const vuetify = app.config.globalProperties.$vuetify;
        confirm = createConfirm(vuetify);
        app.config.globalProperties.$confirm = confirm;
    },
}; 