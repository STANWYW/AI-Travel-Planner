import { Router } from 'express';
import { getApiConfig, updateApiConfig } from '../controllers/apiConfigController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

// GET /api/config - 获取 API 配置
router.get('/', getApiConfig);

// PUT /api/config - 更新 API 配置
router.put('/', updateApiConfig);

export default router;

