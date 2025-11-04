import { Router } from 'express';
import {
  createTravelPlan,
  getTravelPlans,
  getTravelPlan,
  updateTravelPlan,
  deleteTravelPlan,
  generateItinerary,
} from '../controllers/travelPlanController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

// POST /api/travel-plans - 创建旅行计划
router.post('/', createTravelPlan);

// GET /api/travel-plans - 获取所有旅行计划
router.get('/', getTravelPlans);

// GET /api/travel-plans/:id - 获取单个旅行计划
router.get('/:id', getTravelPlan);

// PUT /api/travel-plans/:id - 更新旅行计划
router.put('/:id', updateTravelPlan);

// DELETE /api/travel-plans/:id - 删除旅行计划
router.delete('/:id', deleteTravelPlan);

// POST /api/travel-plans/:id/generate - 生成 AI 行程
router.post('/:id/generate', generateItinerary);

export default router;

