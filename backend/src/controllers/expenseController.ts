import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const addExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { travelPlanId } = req.params;
    const { category, amount, currency, description, date, voiceRecorded } = req.body;

    // 验证用户拥有该旅行计划
    const travelPlan = await prisma.travelPlan.findFirst({
      where: {
        id: travelPlanId,
        userId: req.userId,
      },
    });

    if (!travelPlan) {
      res.status(404).json({ error: '旅行计划未找到' });
      return;
    }

    const expense = await prisma.expense.create({
      data: {
        travelPlanId,
        category,
        amount: parseFloat(amount),
        currency: currency || 'CNY',
        description,
        date: new Date(date),
        voiceRecorded: voiceRecorded || false,
      },
    });

    res.status(201).json({
      message: '费用记录已添加',
      expense,
    });
  } catch (error) {
    console.error('添加费用错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

export const getExpenses = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { travelPlanId } = req.params;

    // 验证用户拥有该旅行计划
    const travelPlan = await prisma.travelPlan.findFirst({
      where: {
        id: travelPlanId,
        userId: req.userId,
      },
    });

    if (!travelPlan) {
      res.status(404).json({ error: '旅行计划未找到' });
      return;
    }

    const expenses = await prisma.expense.findMany({
      where: { travelPlanId },
      orderBy: { date: 'desc' },
    });

    // 计算统计数据
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const byCategory = expenses.reduce((acc: any, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    res.json({
      expenses,
      statistics: {
        total: totalAmount,
        count: expenses.length,
        byCategory,
        remaining: travelPlan.budget - totalAmount,
      },
    });
  } catch (error) {
    console.error('获取费用错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

export const updateExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 验证用户拥有该费用记录
    const expense = await prisma.expense.findFirst({
      where: { id },
      include: {
        travelPlan: true,
      },
    });

    if (!expense || expense.travelPlan.userId !== req.userId) {
      res.status(404).json({ error: '费用记录未找到' });
      return;
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: updateData,
    });

    res.json({ message: '费用记录已更新', expense: updatedExpense });
  } catch (error) {
    console.error('更新费用错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

export const deleteExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // 验证用户拥有该费用记录
    const expense = await prisma.expense.findFirst({
      where: { id },
      include: {
        travelPlan: true,
      },
    });

    if (!expense || expense.travelPlan.userId !== req.userId) {
      res.status(404).json({ error: '费用记录未找到' });
      return;
    }

    await prisma.expense.delete({
      where: { id },
    });

    res.json({ message: '费用记录已删除' });
  } catch (error) {
    console.error('删除费用错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

