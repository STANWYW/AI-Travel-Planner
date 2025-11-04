import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

// 简单的加密/解密（生产环境应使用更安全的方案）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here!!';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export const getApiConfig = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const apiConfig = await prisma.apiConfig.findUnique({
      where: { userId: req.userId },
    });

    if (!apiConfig) {
      res.json({
        openrouterKey: '',
        xfyunAppId: '',
        xfyunApiKey: '',
        xfyunApiSecret: '',
        amapKey: '',
        baiduMapKey: '',
      });
      return;
    }

    // 解密返回（仅返回是否配置，不返回完整 key）
    res.json({
      openrouterKey: apiConfig.openrouterKey ? '已配置' : '',
      xfyunAppId: apiConfig.xfyunAppId ? '已配置' : '',
      xfyunApiKey: apiConfig.xfyunApiKey ? '已配置' : '',
      xfyunApiSecret: apiConfig.xfyunApiSecret ? '已配置' : '',
      amapKey: apiConfig.amapKey ? '已配置' : '',
      baiduMapKey: apiConfig.baiduMapKey ? '已配置' : '',
    });
  } catch (error) {
    console.error('获取 API 配置错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

export const updateApiConfig = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      openrouterKey,
      xfyunAppId,
      xfyunApiKey,
      xfyunApiSecret,
      amapKey,
      baiduMapKey,
    } = req.body;

    // 加密存储
    const encryptedData: any = {};
    if (openrouterKey) encryptedData.openrouterKey = encrypt(openrouterKey);
    if (xfyunAppId) encryptedData.xfyunAppId = encrypt(xfyunAppId);
    if (xfyunApiKey) encryptedData.xfyunApiKey = encrypt(xfyunApiKey);
    if (xfyunApiSecret) encryptedData.xfyunApiSecret = encrypt(xfyunApiSecret);
    if (amapKey) encryptedData.amapKey = encrypt(amapKey);
    if (baiduMapKey) encryptedData.baiduMapKey = encrypt(baiduMapKey);

    const apiConfig = await prisma.apiConfig.upsert({
      where: { userId: req.userId! },
      update: encryptedData,
      create: {
        userId: req.userId!,
        ...encryptedData,
      },
    });

    res.json({ message: 'API 配置已更新', success: true });
  } catch (error) {
    console.error('更新 API 配置错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取解密的 API Key（内部使用）
export async function getDecryptedApiKey(
  userId: string,
  keyName: string
): Promise<string | null> {
  try {
    const apiConfig = await prisma.apiConfig.findUnique({
      where: { userId },
    });

    if (!apiConfig) return null;

    const encryptedKey = (apiConfig as any)[keyName];
    if (!encryptedKey) return null;

    return decrypt(encryptedKey);
  } catch (error) {
    console.error('解密 API Key 错误:', error);
    return null;
  }
}

