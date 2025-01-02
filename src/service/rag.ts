import { feedRepo, itemRepo } from "@/repository"
import { useSettingsStore } from "@/store/settings"

export interface FeedContext {
    title: string
    content: string
    source: string
    pubDate: number
    id: number,
}

interface ScoredContext extends FeedContext {
    score: number
}

interface KeywordWeight {
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
    const settings = settingsStore.integrated

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

async function retrieveRelevantContexts(query: string): Promise<FeedContext[]> {
    // 获取所有订阅源
    const feeds = await feedRepo.getAll()
    const contexts: ScoredContext[] = []

    // 对查询语句进行AI分词和权重分配
    const keywordsWithWeights = await splitToKeywordsWithAI(query)
    console.log("AI分词及权重结果：", keywordsWithWeights)

    // 从每个订阅源获取最近的文章
    for (const feed of feeds) {
        const items = await itemRepo.listAll(item => item.feedId === feed.id)

        // 计算 feed 标题的相关性得分
        const feedTitleScore = calculateRelevanceScore(feed.title, keywordsWithWeights)

        // 计算每篇文章的得分
        const scoredItems = items.map(item => {
            const titleScore = calculateRelevanceScore(item.title, keywordsWithWeights)
            const contentScore = calculateRelevanceScore(item.description, keywordsWithWeights)
            return {
                item,
                score: titleScore * 2 + contentScore + feedTitleScore * 1.5
            }
        }).filter(x => x.score > 0)

        // 按相关性得分排序，取前3篇
        const relevantItems = scoredItems
            .sort((a, b) => b.score - a.score)
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
        .slice(0, 6)
        .map(({ title, content, source, pubDate, id }) => ({ title, content, source, pubDate, id }))
}

/**
 * 使用 AI 进行分词处理
 */
async function splitToKeywordsWithAI(query: string): Promise<KeywordWeight[]> {
    const settingsStore = useSettingsStore()
    const settings = settingsStore.integrated

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
                max_tokens: 100,
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
    let prompt = `问题: ${query}\n\n相关上下文:\n\n`

    contexts.forEach((ctx, index) => {
        prompt += `[${index + 1}] 来自 "${ctx.source}":\n标题: ${ctx.title} \n发布时间:${formattedDate(ctx.pubDate)}\n内容: ${ctx.content}\n\n`
    })

    prompt += `\n基于以上上下文，请回答问题。如果上下文信息不足以回答问题，请说明。`

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