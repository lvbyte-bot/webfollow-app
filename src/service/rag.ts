import { feedRepo, Item, itemRepo } from "@/repository"
import { useSettingsStore } from "@/store/settings"

export interface FeedContext {
    title: string
    content: string
    source: string
    pubDate: number
    id: number,
    score: number
}

interface ScoredContext extends FeedContext {
    score: number
}

export interface KeywordWeight {
    keyword: string
    weight: number
}

interface RAGAnswer {
    answer: string;
    contexts: FeedContext[];
}

interface RAGResponse {
    contexts: FeedContext[];
    genAnswer: () => Promise<RAGAnswer>;
}

export async function queryWithRAG(query: string): Promise<RAGResponse> {
    const settingsStore = useSettingsStore()
    const settings = settingsStore.proxyIntegrated

    if (!settings.isApiValid || !settings.apiKey) {
        throw new Error("LLM 配置无效")
    }

    // 1. 获取相关上下文
    const contexts = await retrieveRelevantContexts(query)

    return {
        contexts, genAnswer: async () => {
            // 2. 构建 prompt
            const prompt = buildRAGPrompt(query, contexts)

            // 3. 调用 LLM
            try {
                const response = await fetch(settings.apiUrl + "/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${settings.apiKey}`,
                    },
                    body: JSON.stringify({
                        model: settings.selectedModel,
                        messages: [
                            {
                                role: "system",
                                content: "你是一个智能的RSS阅读助手。使用提供的上下文信息来回答用户的问题。如果无法从上下文中找到答案，请诚实地说明。",
                            },
                            {
                                role: "user",
                                content: prompt,
                            },
                        ],
                        temperature: 0.7,
                        max_tokens: 1000,
                    }),
                })

                if (!response.ok) {
                    throw new Error(`API 请求失败: ${response.statusText}`)
                }

                const data = await response.json()
                return {
                    answer: data.choices[0].message.content,
                    contexts: contexts
                }
            } catch (error: any) {
                throw new Error("LLM 调用失败：" + error.message)
            }
        }
    }


}

/**
 * 或取 keywordsWithWeights || query 对应的相关内容
 * @param query 
 * @param keywordsWithWeights 
 * @returns 
 */
export async function retrieveRelevantContexts(query: string, keywordsWithWeights: KeywordWeight[] = [], split: number = 6): Promise<FeedContext[]> {
    // 获取所有订阅源
    const feeds = await feedRepo.getAll()
    const contexts: ScoredContext[] = []
    // 对查询语句进行AI分词和权重分配
    keywordsWithWeights = keywordsWithWeights.length ? keywordsWithWeights : await splitToKeywordsWithAI(query)
    log("AI分词及权重结果：", keywordsWithWeights)
    const feedId2items: any = (await itemRepo.listAll(_ => true)).reduce((acc: any, item: Item) => {
        acc[item.feedId] = acc[item.feedId] || []
        acc[item.feedId].push(item)
        return acc;
    })


    // 从每个订阅源获取最近的文章
    for (const feed of feeds) {

        // 计算 feed 标题的相关性得分
        const feedTitleScore = calculateRelevanceScore(feed.title, keywordsWithWeights)

        // 计算每篇文章的得分
        const scoredItems = feedId2items[feed.id]?.map((item: Item) => {
            const titleScore = calculateRelevanceScore(item.title, keywordsWithWeights)
            const contentScore = calculateRelevanceScore(item.description, keywordsWithWeights)
            return {
                item,
                score: titleScore * 2 + contentScore + feedTitleScore * 1.5
            }
        }).filter((x: any) => x.score > 0) || []

        // 按相关性得分排序，取前3篇
        const relevantItems = scoredItems
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, 3)

        for (const { item, score } of relevantItems) {
            contexts.push({
                title: item.title,
                content: item.description,
                source: feed.title,
                score: score,
                pubDate: item.pubDate,
                id: item.id,
            })
        }
    }
    // 对所有上下文按得分排序，返回最相关的前5条
    return contexts
        .sort((a, b) => b.score - a.score)
        .slice(0, split)
        .map(({ id, title, content, source, pubDate, score }) => ({ id, title, content, source, pubDate, score }))
}

/**
 * 使用 AI 进行分词处理
 */
async function splitToKeywordsWithAI(query: string): Promise<KeywordWeight[]> {
    const settingsStore = useSettingsStore()
    const settings = settingsStore.proxyIntegrated

    if (!settings.isApiValid || !settings.apiKey) {
        // 如果 AI 配置无效，回退到简单分词，所有权重设为1
        return query.toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1)
            .map(word => ({ keyword: word, weight: 1 }))
    }

    try {
        const response = await fetch(settings.apiUrl + "/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${settings.apiKey}`,
            },
            body: JSON.stringify({
                model: settings.selectedModel,
                messages: [
                    {
                        role: "system",
                        content: "你是一个分词助手。请将用户输入的查询语句最关键的部分分解为关键词数组，起于部分忽略，并为每个关键词分配权重(1-99)。权重基于词语在查询中的重要性,核心概念给最高可以给99分，重要修饰词给最高3分，一般词给1分。返回格式为JSON数组，每项包含keyword和weight字段。",
                    },
                    {
                        role: "user",
                        content: `请分析以下查询语句，返回关键词及其权重：\n${query}\n只返回JSON数组，不要其他任何内容和md的格式,请参照这个格式返回[{ keyword: word, weight: 1 }]`,
                    },
                ],
                temperature: 0.1,
                max_tokens: 300,
            }),
        })

        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.statusText}`)
        }

        const data = await response.json()
        const result = data.choices[0].message.content

        try {
            const keywords = JSON.parse(result)
            if (Array.isArray(keywords) && keywords.every(k => k.keyword && k.weight)) {
                return keywords.filter(k => k.keyword.length > 1)
            }
        } catch (e) {
            console.error("AI返回结果解析失败:", e)
        }

        // 解析失败时的回退方案
        return query.toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1)
            .map(word => ({ keyword: word, weight: 1 }))

    } catch (error) {
        console.error("AI分词失败:", error)
        return query.toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1)
            .map(word => ({ keyword: word, weight: 1 }))
    }
}

/**
 * 
 * @param query 
 * @returns 
 */
export async function getRelatedKeywords(query: string): Promise<KeywordWeight[]> {
    const settingsStore = useSettingsStore()
    const settings = settingsStore.proxyIntegrated

    if (!settings.isApiValid || !settings.apiKey) {
        throw new Error("AI 配置无效")
    }

    try {
        const response = await fetch(settings.apiUrl + "/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${settings.apiKey}`,
            },
            body: JSON.stringify({
                model: settings.selectedModel,
                messages: [
                    {
                        role: "system",
                        content: "你是一个关键字分析助手。请将用户输入的查询语句最关键的部分分解为以及经常与这些关键词一起出现的其他关键词，包括相关人物、事件和相似词汇等，其与部分忽略，并为每个关键词分配权重(1-99)。权重基于词语在查询中的重要性,核心概念给最高可以给99分，重要修饰词给最高3分，一般词给1分。返回格式为JSON数组，每项包含keyword和weight字段。",
                    },
                    {
                        role: "user",
                        content: `请分析以下语句，\n"${query}"相关人物、事件和相似词汇, 返回其中的关键词，以及经常与这些关键词一起出现的其他关键词，并给出相应的权重,只返回JSON数组，不要其他内容和Markdown格式，请按照以下格式返回：[{"keyword": "word", "weight": 1}]。`,
                    },
                ],
                temperature: 0.1,
                max_tokens: 300,
            }),
        })
        if (!response.ok) {
            throw new Error(`API 请求失败: ${(await response.json())?.error?.message || response.statusText}`)
        }

        const data = await response.json()
        const result = data.choices[0].message.content
        try {
            const keywords = JSON.parse(result)
            if (Array.isArray(keywords) && keywords.every(k => k.keyword && k.weight)) {
                return keywords.filter(k => k.keyword.length > 1)
            }
        } catch (e) {
            console.error("AI返回结果解析失败:", e)
        }

        return []
    } catch (error) {
        alert("AI调用失败:" + error)
        return []
    }
}

/**
 * 计算文本与关键词的相关性得分
 */
function calculateRelevanceScore(text: string, keywords: KeywordWeight[]): number {
    if (!text) return 0

    const normalizedText = text.toLowerCase()
    let score = 0

    for (const kw of keywords) {
        // 计算每个关键词在文本中出现的次数
        const regex = new RegExp(kw.keyword, 'g')
        const matches = normalizedText.match(regex)
        if (matches) {
            // 基础分数：关键词出现一次得分 = 匹配次数 * 权重
            score += matches.length * kw.weight

            // 完整词组匹配加分
            if (keywords.length > 1 && normalizedText.includes(keywords.map(k => k.keyword).join(''))) {
                score += 3
            }

            // 标题中出现加分
            if (text.length < 100 && matches.length > 0) {
                score += 2 * kw.weight // 标题匹配时也考虑权重
            }
        }
    }

    return score
}

function buildRAGPrompt(query: string, contexts: FeedContext[]): string {
    let prompt = `问题: ${query}\n\n相关上下文:"""\n\n`

    contexts.forEach((ctx, index) => {
        prompt += `[${index + 1}] 来自 "${ctx.source}":\n标题: ${ctx.title} \n发布时间:${formattedDate(ctx.pubDate)}\n`
    })

    prompt += `"""\n基于以上上下文，请回答问题。如果上下文信息不足以回答问题，请说明。`

    return prompt
}

function formattedDate(pubDate: number): string {
    const options: any = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // 24小时制
    };
    const formattedDate = new Date(pubDate * 1000).toLocaleString(
        "zh-CN",
        options
    );
    return `${formattedDate}`;
}