export function debound<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: number | undefined;

    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        const context = this;

        // 清除之前的计时器
        if (timeout !== undefined) {
            clearTimeout(timeout);
        }

        // 重新设置计时器
        timeout = window.setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}