import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { recognizeAudioBase64 } from '../services/xfyunService';

/**
 * 语音识别接口
 */
export const recognizeVoice = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { audioBase64 } = req.body;
    const userId = req.userId!;

    if (!audioBase64) {
      res.status(400).json({ error: '缺少音频数据' });
      return;
    }

    console.log('开始语音识别...');
    const text = await recognizeAudioBase64(userId, audioBase64);
    
    res.json({
      success: true,
      text,
      message: '识别成功',
    });
  } catch (error: any) {
    console.error('语音识别失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '语音识别失败',
    });
  }
};

