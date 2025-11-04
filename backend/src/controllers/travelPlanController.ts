import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createTravelPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      destination,
      startDate,
      endDate,
      days,
      budget,
      travelers,
      preferences,
    } = req.body;

    const travelPlan = await prisma.travelPlan.create({
      data: {
        userId: req.userId!,
        title,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        budget: parseFloat(budget),
        travelers: parseInt(travelers) || 1,
        preferences: preferences || {},
      },
    });

    res.status(201).json({
      message: '旅行计划创建成功',
      travelPlan,
    });
  } catch (error) {
    console.error('创建旅行计划错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

export const getTravelPlans = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const travelPlans = await prisma.travelPlan.findMany({
      where: { userId: req.userId },
      include: {
        expenses: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ travelPlans });
  } catch (error) {
    console.error('获取旅行计划错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

export const getTravelPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const travelPlan = await prisma.travelPlan.findFirst({
      where: {
        id,
        userId: req.userId,
      },
      include: {
        expenses: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!travelPlan) {
      res.status(404).json({ error: '旅行计划未找到' });
      return;
    }

    res.json({ travelPlan });
  } catch (error) {
    console.error('获取旅行计划错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

export const updateTravelPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 确保用户拥有该计划
    const existing = await prisma.travelPlan.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: '旅行计划未找到' });
      return;
    }

    const travelPlan = await prisma.travelPlan.update({
      where: { id },
      data: updateData,
    });

    res.json({ message: '旅行计划已更新', travelPlan });
  } catch (error) {
    console.error('更新旅行计划错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

export const deleteTravelPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // 确保用户拥有该计划
    const existing = await prisma.travelPlan.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: '旅行计划未找到' });
      return;
    }

    await prisma.travelPlan.delete({
      where: { id },
    });

    res.json({ message: '旅行计划已删除' });
  } catch (error) {
    console.error('删除旅行计划错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 生成 AI 行程
export const generateItinerary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // 确保用户拥有该计划
    const travelPlan = await prisma.travelPlan.findFirst({
      where: { id, userId: req.userId },
    });

    if (!travelPlan) {
      res.status(404).json({ error: '旅行计划未找到' });
      return;
    }

    // 这里将调用 OpenRouter API 生成行程
    // 实现在下一步
    res.json({
      message: '行程生成功能将在集成 OpenRouter API 后可用',
      travelPlanId: id,
    });
  } catch (error) {
    console.error('生成行程错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

