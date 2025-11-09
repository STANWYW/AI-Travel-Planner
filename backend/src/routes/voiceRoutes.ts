import express from 'express';
import { recognizeVoice } from '../controllers/voiceController';
import { parseVoice, createPlanFromVoice } from '../controllers/voiceParserController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 语音识别
router.post('/recognize', authMiddleware, recognizeVoice);

// 解析语音文本为旅行计划数据
router.post('/parse', authMiddleware, parseVoice);

// 从语音文本直接创建旅行计划
router.post('/create-plan', authMiddleware, createPlanFromVoice);

export default router;

