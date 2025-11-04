import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getCurrentUser } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 注册
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('请提供有效的邮箱地址'),
    body('username')
      .isLength({ min: 3, max: 20 })
      .withMessage('用户名长度必须在 3-20 个字符之间'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('密码长度至少为 6 个字符'),
  ],
  register
);

// 登录
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('请提供有效的邮箱地址'),
    body('password').notEmpty().withMessage('请提供密码'),
  ],
  login
);

// 获取当前用户信息
router.get('/me', authMiddleware, getCurrentUser);

export default router;

