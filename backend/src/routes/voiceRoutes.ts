import express from 'express';
import { recognizeVoice } from '../controllers/voiceController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 语音识别
router.post('/recognize', authMiddleware, recognizeVoice);

export default router;

