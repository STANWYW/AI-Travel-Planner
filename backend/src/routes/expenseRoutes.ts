import { Router } from 'express';
import {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

// POST /api/travel-plans/:travelPlanId/expenses - 添加费用
router.post('/:travelPlanId/expenses', addExpense);

// GET /api/travel-plans/:travelPlanId/expenses - 获取费用列表
router.get('/:travelPlanId/expenses', getExpenses);

// PUT /api/expenses/:id - 更新费用
router.put('/expenses/:id', updateExpense);

// DELETE /api/expenses/:id - 删除费用
router.delete('/expenses/:id', deleteExpense);

export default router;

