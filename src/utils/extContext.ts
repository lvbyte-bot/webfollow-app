// 定义接口和类型
interface ExtractOptions {
    proxyUrl?: string;
    timeout?: number;
}

export interface ExtractResult {
    title: string;
    content: string;
    error: string | null;
}

// 为 Readability 添加类型定义
// 由于 Readability.js 是第三方库，我们需要声明它的类型
declare class Readability {
    constructor(document: Document, options?: object);
    parse(): {
        title: string;
        content: string;
        textContent: string;
        length: number;
        excerpt: string;
        byline: string;
        dir: string;
        siteName: string;
    } | null;
}

/**
 * 从URL获取网页内容并提取正文
 * @param url - 要提取内容的网页URL
 * @param options - 配置选项
 * @returns Promise<ExtractResult> 包含提取结果的Promise
 */
export async function extractContentFromUrl(
    url: string,
    options: ExtractOptions = {}
): Promise<ExtractResult> {
    // 默认配置
    const defaultOptions: Required<ExtractOptions> = {
        proxyUrl: 'https://api.webfollow.cc/proxy?url={url}',
        timeout: 30000, // 30秒超时
    };

    // 合并选项
    const finalOptions: Required<ExtractOptions> = {
        ...defaultOptions,
        ...options
    };

    // 返回结果对象
    const result: ExtractResult = {
        title: '',
        content: '',
        error: null
    };

    try {
        // 验证URL
        if (!url) {
            throw new Error('URL不能为空');
        }

        // 构建代理URL
        const proxyUrl: string = finalOptions.proxyUrl.replace(
            '{url}',
            encodeURIComponent(url)
        );

        // 创建 AbortController 用于超时控制
        const controller: AbortController = new AbortController();
        const timeoutId: number = window.setTimeout(
            () => controller.abort(),
            finalOptions.timeout
        );

        // 发起请求
        const response: Response = await fetch(proxyUrl, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }

        // 获取HTML内容
        const html: string = await response.text();

        // 使用DOMParser解析HTML
        const parser: DOMParser = new DOMParser();
        const doc: Document = parser.parseFromString(html, 'text/html');

        // 使用Readability提取内容
        const reader: Readability = new Readability(doc);
        const article = reader.parse();

        if (!article) {
            throw new Error('无法提取页面内容');
        }

        result.title = article.title;
        result.content = article.textContent;

        return result;

    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                result.error = '请求超时';
            } else {
                result.error = error.message;
            }
        } else {
            result.error = '未知错误';
        }
        return result;
    }
}

// 使用示例：
/*
// 基本使用
async function demo(): Promise<void> {
    const result = await extractContentFromUrl('https://example.com');
    
    if (result.error) {
        console.error('提取失败:', result.error);
        return;
    }
    
    console.log('标题:', result.title);
    console.log('正文:', result.content);
}
*/