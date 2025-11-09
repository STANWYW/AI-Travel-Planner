import express from 'express';
import { recognizeVoice } from '../controllers/voiceController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 语音识别
router.post('/recognize', authenticateToken, recognizeVoice);

export default router;

