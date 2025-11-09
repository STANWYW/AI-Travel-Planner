import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { parseVoiceToTravelPlan } from '../services/voiceParserService';
import prisma from '../config/database';

/**
 * 解析语音文本为旅行计划数据
 */
export const parseVoice = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { text } = req.body;
    const userId = req.userId!;

    if (!text) {
      res.status(400).json({ error: '缺少语音文本' });
      return;
    }

    console.log('开始解析语音文本:', text);
    const planData = await parseVoiceToTravelPlan(userId, text);
    
    res.json({
      success: true,
      planData,
      message: '解析成功',
    });
  } catch (error: any) {
    console.error('解析语音失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '解析语音失败',
    });
  }
};

/**
 * 从语音文本直接创建旅行计划
 */
export const createPlanFromVoice = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { text, autoGenerate } = req.body;
    const userId = req.userId!;

    if (!text) {
      res.status(400).json({ error: '缺少语音文本' });
      return;
    }

    console.log('从语音创建旅行计划:', text);
    
    // 1. 解析语音文本
    const planData = await parseVoiceToTravelPlan(userId, text);
    
    // 2. 创建旅行计划
    const travelPlan = await prisma.travelPlan.create({
      data: {
        userId,
        title: planData.title,
        destination: planData.destination,
        startDate: new Date(planData.startDate),
        endDate: new Date(planData.endDate),
        days: planData.days,
        budget: planData.budget,
        travelers: planData.travelers || 1,
        preferences: planData.preferences || {},
        status: 'draft',
      },
    });

    // 3. 如果需要，自动生成 AI 行程
    let itinerary = null;
    if (autoGenerate) {
      try {
        const apiConfig = await prisma.apiConfig.findUnique({
          where: { userId },
          select: { aiProvider: true, selectedModel: true },
        });

        const aiProvider = apiConfig?.aiProvider || 'openrouter';
        const selectedModel = apiConfig?.selectedModel;

        if (aiProvider === 'deepseek') {
          const { generateTravelItineraryWithDeepSeek } = await import('../services/deepseekService');
          itinerary = await generateTravelItineraryWithDeepSeek(
            userId,
            {
              destination: planData.destination,
              days: planData.days,
              budget: planData.budget,
              travelers: planData.travelers || 1,
              preferences: planData.preferences || {},
            },
            selectedModel || 'deepseek-chat'
          );
        } else {
          const { generateTravelItinerary } = await import('../services/openrouterService');
          itinerary = await generateTravelItinerary(
            userId,
            {
              destination: planData.destination,
              days: planData.days,
              budget: planData.budget,
              travelers: planData.travelers || 1,
              preferences: planData.preferences || {},
            },
            selectedModel
          );
        }

        // 更新计划
        await prisma.travelPlan.update({
          where: { id: travelPlan.id },
          data: {
            itinerary,
            status: 'confirmed',
          },
        });
      } catch (error) {
        console.error('自动生成行程失败:', error);
        // 即使生成失败，也返回创建的计划
      }
    }

    res.json({
      success: true,
      message: '旅行计划创建成功',
      travelPlan: {
        ...travelPlan,
        itinerary: itinerary || travelPlan.itinerary,
      },
    });
  } catch (error: any) {
    console.error('从语音创建计划失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '创建计划失败',
    });
  }
};

