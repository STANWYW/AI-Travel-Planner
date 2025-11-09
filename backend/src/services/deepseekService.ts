import axios from 'axios';
import { getDecryptedApiKey } from '../controllers/apiConfigController';

// DeepSeek API 地址（官方文档：https://api.deepseek.com 或 https://api.deepseek.com/v1）
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// DeepSeek 可用模型列表
export const DEEPSEEK_MODELS = [
  { value: 'deepseek-chat', label: 'DeepSeek Chat (推荐)' },
  { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
  { value: 'deepseek-coder', label: 'DeepSeek Coder' },
];

interface TravelPlanInput {
  destination: string;
  days: number;
  budget: number;
  travelers: number;
  preferences?: any;
}

/**
 * 使用 DeepSeek API 生成旅行计划
 */
export async function generateTravelItineraryWithDeepSeek(
  userId: string,
  planInput: TravelPlanInput,
  model: string = 'deepseek-chat'
): Promise<any> {
  try {
    // 获取用户的 DeepSeek API Key
    const apiKey = await getDecryptedApiKey(userId, 'deepseekKey');
    
    if (!apiKey) {
      throw new Error('请先在设置中配置 DeepSeek API Key');
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

    console.log(`使用 DeepSeek 模型: ${model}`);

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的旅行规划助手，擅长根据用户需求生成详细的旅行计划。请始终以 JSON 格式返回结果。'
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
          'Content-Type': 'application/json',
        },
      }
    );

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
    console.error('DeepSeek API 错误:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message || 
      '生成行程失败，请检查 DeepSeek API Key 是否正确'
    );
  }
}

/**
 * 使用 DeepSeek API 生成预算建议
 */
export async function generateBudgetSuggestionWithDeepSeek(
  userId: string,
  destination: string,
  days: number,
  travelers: number,
  model: string = 'deepseek-chat'
): Promise<any> {
  try {
    const apiKey = await getDecryptedApiKey(userId, 'deepseekKey');
    
    if (!apiKey) {
      throw new Error('请先在设置中配置 DeepSeek API Key');
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

    const response = await axios.post(
      DEEPSEEK_API_URL,
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
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('生成预算建议错误:', error);
    throw new Error('生成预算建议失败');
  }
}

