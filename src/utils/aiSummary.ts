import { extractContentFromUrl } from "@/utils/extContext";
import { html2md } from "@/utils/mdUtils";
import { useSettingsStore } from "@/store";

interface SummaryOptions {
  link: string;
  description?: string;
  title?: string;
}

interface SummaryResult {
  title: string;
  description: string;
  summary: string;
  error?: string;
}

/**
 * 获取文章内容并生成AI总结
 * @param options - 配置选项
 * @returns Promise<SummaryResult> 包含文章内容和AI总结的结果
 */
export async function generateArticleSummary(options: SummaryOptions): Promise<SummaryResult> {
  const settingsStore = useSettingsStore();
  const settings = settingsStore.proxyIntegrated;
  
  // 验证API设置
  if (!settings.isApiValid || !settings.selectedModel || !settings.apiKey) {
    throw new Error('AI API配置无效');
  }

  const result: SummaryResult = {
    title: options.title || '',
    description: options.description || '',
    summary: '',
  };

  try {
    // 如果没有description，则从URL获取内容
    if (!options.description && options.link) {
      const extractResult = await extractContentFromUrl(options.link);
      if (extractResult.error) {
        throw new Error(`获取文章内容失败: ${extractResult.error}`);
      }
      
      result.title = extractResult.title;
      result.description = html2md(extractResult.content);
    }

    // 生成AI总结
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
            content: settings.summaryPrompt,
          },
          {
            role: "user",
            content: result.description,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API请求失败: ${response.statusText}`);
    }

    const data = await response.json();
    result.summary = data.choices[0].message.content;

    return result;
  } catch (error: any) {
    result.error = error.message;
    return result;
  }
}

// 使用示例：
/*
async function demo() {
  const result = await generateArticleSummary({
    url: 'https://example.com/article',
    title: '文章标题', // 可选
    description: '文章描述' // 可选，如果不提供会从URL获取
  });

  if (result.error) {
    console.error('生成总结失败:', result.error);
    return;
  }

  console.log('标题:', result.title);
  console.log('描述:', result.description);
  console.log('AI总结:', result.summary);
}
*/ 