import axios from 'axios';
import { getDecryptedApiKey } from '../controllers/apiConfigController';
import prisma from '../config/database';

// OpenRouter API
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// DeepSeek API
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * 使用 AI 解析语音文本，提取旅行计划信息
 */
export async function parseVoiceToTravelPlan(
  userId: string,
  voiceText: string
): Promise<any> {
  try {
    // 获取用户的 AI 提供商配置
    const apiConfig = await prisma.apiConfig.findUnique({
      where: { userId },
      select: { aiProvider: true, selectedModel: true },
    });

    const aiProvider = apiConfig?.aiProvider || 'openrouter';
    const selectedModel = apiConfig?.selectedModel;

    // 构建解析 prompt
    const prompt = `请从以下语音输入中提取旅行计划信息：

语音内容："${voiceText}"

请提取以下信息并以 JSON 格式返回：
{
  "title": "计划标题（如果没有则根据目的地和天数生成）",
  "destination": "目的地",
  "days": 天数（数字）,
  "budget": 预算（数字，单位：元）,
  "travelers": 人数（数字，默认1）,
  "preferences": {
    "interests": ["兴趣1", "兴趣2"],
    "pace": "轻松/中等/紧凑"
  },
  "startDate": "开始日期（ISO 格式，如果未提及则使用未来7天后的日期）",
  "endDate": "结束日期（ISO 格式，如果未提及则根据天数计算）"
}

注意：
- 如果信息缺失，请根据上下文合理推断
- 日期如果未提及，使用合理的默认值
- 只返回 JSON，不要其他文字`;

    let response;

    if (aiProvider === 'deepseek') {
      // 使用 DeepSeek API
      const apiKey = await getDecryptedApiKey(userId, 'deepseekKey');
      if (!apiKey) {
        throw new Error('请先配置 DeepSeek API Key');
      }

      const models = [
        selectedModel || 'deepseek-chat',
        'deepseek-chat',
        'deepseek-reasoner',
      ];

      for (const model of models) {
        try {
          response = await axios.post(
            DEEPSEEK_API_URL,
            {
              model,
              messages: [
                {
                  role: 'system',
                  content: '你是一个专业的旅行信息提取助手，擅长从自然语言中提取结构化信息。请始终以 JSON 格式返回结果。'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.3,
              max_tokens: 2000,
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
            }
          );
          break;
        } catch (error: any) {
          if (error.response?.status !== 429) {
            throw error;
          }
        }
      }
    } else {
      // 使用 OpenRouter API
      const apiKey = await getDecryptedApiKey(userId, 'openrouterKey');
      if (!apiKey) {
        throw new Error('请先配置 OpenRouter API Key');
      }

      const defaultModels = [
        'deepseek/deepseek-chat-v3-0324:free',
        'deepseek/deepseek-r1-0528:free',
        'tngtech/deepseek-r1t2-chimera:free',
        'google/gemini-2.0-flash-exp:free',
      ];

      const models = selectedModel 
        ? [selectedModel, ...defaultModels.filter(m => m !== selectedModel)]
        : defaultModels;

      for (const model of models) {
        try {
          response = await axios.post(
            OPENROUTER_API_URL,
            {
              model,
              messages: [
                {
                  role: 'system',
                  content: '你是一个专业的旅行信息提取助手，擅长从自然语言中提取结构化信息。请始终以 JSON 格式返回结果。'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.3,
              max_tokens: 2000,
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': process.env.APP_URL || 'http://localhost',
                'X-Title': 'AI Travel Planner',
                'Content-Type': 'application/json',
              },
            }
          );
          break;
        } catch (error: any) {
          if (error.response?.data?.error?.code !== 429) {
            throw error;
          }
        }
      }
    }

    if (!response) {
      throw new Error('所有 AI 模型都不可用');
    }

    const content = response.data.choices[0].message.content;
    
    // 解析 JSON 响应
    try {
      // 提取 JSON 部分（可能被包裹在 markdown 代码块中）
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/{[\s\S]*}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        // 验证和补充必要字段
        if (!parsed.destination) {
          throw new Error('无法从语音中提取目的地');
        }
        
        // 如果没有日期，使用默认值
        if (!parsed.startDate) {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() + 7);
          parsed.startDate = startDate.toISOString();
        }
        
        if (!parsed.endDate && parsed.days) {
          const endDate = new Date(parsed.startDate);
          endDate.setDate(endDate.getDate() + (parsed.days - 1));
          parsed.endDate = endDate.toISOString();
        } else if (!parsed.endDate) {
          const endDate = new Date(parsed.startDate);
          endDate.setDate(endDate.getDate() + 6);
          parsed.endDate = endDate.toISOString();
          parsed.days = 7;
        }
        
        if (!parsed.days && parsed.startDate && parsed.endDate) {
          const start = new Date(parsed.startDate);
          const end = new Date(parsed.endDate);
          parsed.days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        }
        
        if (!parsed.days) {
          parsed.days = 7;
        }
        
        if (!parsed.travelers) {
          parsed.travelers = 1;
        }
        
        if (!parsed.budget) {
          parsed.budget = 5000; // 默认预算
        }
        
        if (!parsed.title) {
          parsed.title = `${parsed.destination}${parsed.days}日游`;
        }
        
        return parsed;
      }
      throw new Error('无法解析 AI 响应');
    } catch (parseError) {
      console.error('解析 AI 响应失败:', parseError);
      throw new Error('AI 解析失败，请重试');
    }
  } catch (error: any) {
    console.error('解析语音文本失败:', error);
    throw new Error(error.message || '解析语音文本失败');
  }
}

