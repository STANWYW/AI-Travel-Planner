import axios from 'axios';
import { getDecryptedApiKey, getUserSelectedModel } from '../controllers/apiConfigController';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface TravelPlanInput {
  destination: string;
  days: number;
  budget: number;
  travelers: number;
  preferences?: any;
}

export async function generateTravelItinerary(
  userId: string,
  planInput: TravelPlanInput
): Promise<any> {
  try {
    // 获取用户的 OpenRouter API Key
    const apiKey = await getDecryptedApiKey(userId, 'openrouterKey');
    
    if (!apiKey) {
      throw new Error('请先在设置中配置 OpenRouter API Key');
    }

    // 构建 prompt
    const prompt = `请为我生成一个详细的旅行计划：

目的地：${planInput.destination}
天数：${planInput.days} 天
预算：${planInput.budget} 元人民币
人数：${planInput.travelers} 人
偏好：${JSON.stringify(planInput.preferences || {})}

⚠️ 重要要求：
1. **必须为每一天安排具体的住宿**（酒店名称、位置、价格区间）
2. 住宿要根据预算合理安排（经济型/舒适型/豪华型）
3. 考虑住宿位置的便利性（交通、景点）

请生成包含以下内容的详细行程：
1. 每日行程安排（景点、活动、用餐）
2. **每日住宿安排**（必须详细，包括酒店推荐）
3. 交通建议（往返交通+当地交通）
4. 预算分配建议（明确住宿预算）
5. 注意事项和实用建议

请以 JSON 格式返回，结构如下：
{
  "overview": "行程概述",
  "dailyItinerary": [
    {
      "day": 1,
      "activities": [
        {"time": "09:00", "activity": "活动名称", "location": "地点", "cost": 100}
      ],
      "meals": {
        "breakfast": "早餐建议",
        "lunch": "午餐建议",
        "dinner": "晚餐建议"
      },
      "accommodation": {
        "hotel": "酒店名称/类型",
        "area": "所在区域",
        "priceRange": "价格区间",
        "reason": "推荐理由"
      }
    }
  ],
  "transportation": {
    "overview": "交通概述",
    "toDestination": "往返交通建议",
    "local": "当地交通建议"
  },
  "budgetBreakdown": {
    "transportation": 2000,
    "accommodation": 3000,
    "food": 2000,
    "activities": 2000,
    "other": 1000
  },
  "accommodationSummary": {
    "totalNights": ${planInput.days - 1},
    "estimatedTotal": "住宿总预算",
    "recommendations": ["推荐1", "推荐2"]
  },
  "tips": ["建议1", "建议2"]
}`;

    // 获取用户选择的模型
    const userSelectedModel = await getUserSelectedModel(userId);
    
    // 定义可用的免费模型列表（按优先级排序）
    const defaultModels = [
      'deepseek/deepseek-chat-v3-0324:free',
      'deepseek/deepseek-r1-0528:free',
      'tngtech/deepseek-r1t2-chimera:free',
      'tngtech/deepseek-r1t-chimera:free',
      'google/gemini-2.0-flash-exp:free',
    ];

    // 如果用户选择了模型，优先使用；否则使用默认列表
    const models = userSelectedModel 
      ? [userSelectedModel, ...defaultModels.filter(m => m !== userSelectedModel)]
      : defaultModels;

    let response;
    let lastError;

    // 尝试每个模型，直到成功
    for (const model of models) {
      try {
        console.log(`尝试使用模型: ${model}`);
        response = await axios.post(
          OPENROUTER_API_URL,
          {
            model,
            messages: [
              {
                role: 'system',
                content: '你是一个专业的旅行规划助手，擅长根据用户需求生成详细的旅行计划。'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 4000,
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
        console.log(`✅ 成功使用模型: ${model}`);
        break; // 成功则跳出循环
      } catch (error: any) {
        lastError = error;
        console.log(`❌ 模型 ${model} 失败:`, error.response?.data?.error?.message || error.message);
        
        // 如果不是限流错误，直接抛出
        if (error.response?.data?.error?.code !== 429) {
          throw error;
        }
        // 否则继续尝试下一个模型
      }
    }

    if (!response) {
      throw lastError || new Error('所有模型都不可用');
    }

    const content = response.data.choices[0].message.content;
    
    // 尝试解析 JSON 响应
    try {
      // 提取 JSON 部分（可能被包裹在 markdown 代码块中）
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/{[\s\S]*}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }
      return { rawContent: content };
    } catch (parseError) {
      return { rawContent: content };
    }
  } catch (error: any) {
    console.error('OpenRouter API 错误:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message || 
      '生成行程失败，请检查 API Key 是否正确'
    );
  }
}

// 生成预算建议
export async function generateBudgetSuggestion(
  userId: string,
  destination: string,
  days: number,
  travelers: number
): Promise<any> {
  try {
    const apiKey = await getDecryptedApiKey(userId, 'openrouterKey');
    
    if (!apiKey) {
      throw new Error('请先在设置中配置 OpenRouter API Key');
    }

    const prompt = `请为以下旅行生成预算建议：

目的地：${destination}
天数：${days} 天
人数：${travelers} 人

请提供详细的预算建议，包括：
1. 交通费用（往返+当地交通）
2. 住宿费用（不同档次）
3. 餐饮费用
4. 景点门票
5. 其他开销

请以 JSON 格式返回。`;

    // 获取用户选择的模型
    const userSelectedModel = await getUserSelectedModel(userId);
    
    // 使用相同的模型列表
    const defaultModels = [
      'deepseek/deepseek-chat-v3-0324:free',
      'deepseek/deepseek-r1-0528:free',
      'tngtech/deepseek-r1t2-chimera:free',
      'tngtech/deepseek-r1t-chimera:free',
      'google/gemini-2.0-flash-exp:free',
    ];

    const models = userSelectedModel 
      ? [userSelectedModel, ...defaultModels.filter(m => m !== userSelectedModel)]
      : defaultModels;

    let response;
    let lastError;

    for (const model of models) {
      try {
        response = await axios.post(
          OPENROUTER_API_URL,
          {
            model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.5,
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
        lastError = error;
        if (error.response?.data?.error?.code !== 429) {
          throw error;
        }
      }
    }

    if (!response) {
      throw lastError || new Error('所有模型都不可用');
    }

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('生成预算建议错误:', error);
    throw new Error('生成预算建议失败');
  }
}

