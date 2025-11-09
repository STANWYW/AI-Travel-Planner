import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// 注意：演示版本暂不加密存储
// 生产环境应使用加密或外部密钥管理服务（如 AWS Secrets Manager, HashiCorp Vault）

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
        aiModel: '',
      });
      return;
    }

    // 返回配置（aiModel 返回实际值，其他返回是否配置）
    res.json({
      openrouterKey: apiConfig.openrouterKey ? '已配置' : '',
      xfyunAppId: apiConfig.xfyunAppId ? '已配置' : '',
      xfyunApiKey: apiConfig.xfyunApiKey ? '已配置' : '',
      xfyunApiSecret: apiConfig.xfyunApiSecret ? '已配置' : '',
      amapKey: apiConfig.amapKey ? '已配置' : '',
      baiduMapKey: apiConfig.baiduMapKey ? '已配置' : '',
      aiModel: apiConfig.aiModel || '',
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
      aiModel,
    } = req.body;

    // 直接存储（演示版本）
    const updateData: any = {};
    if (openrouterKey !== undefined) updateData.openrouterKey = openrouterKey;
    if (xfyunAppId !== undefined) updateData.xfyunAppId = xfyunAppId;
    if (xfyunApiKey !== undefined) updateData.xfyunApiKey = xfyunApiKey;
    if (xfyunApiSecret !== undefined) updateData.xfyunApiSecret = xfyunApiSecret;
    if (amapKey !== undefined) updateData.amapKey = amapKey;
    if (baiduMapKey !== undefined) updateData.baiduMapKey = baiduMapKey;
    if (aiModel !== undefined) updateData.aiModel = aiModel;

    await prisma.apiConfig.upsert({
      where: { userId: req.userId! },
      update: updateData,
      create: {
        userId: req.userId!,
        ...updateData,
      },
    });

    res.json({ message: 'API 配置已更新', success: true });
  } catch (error) {
    console.error('更新 API 配置错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取 API Key（内部使用）
export async function getDecryptedApiKey(
  userId: string,
  keyName: string
): Promise<string | null> {
  try {
    const apiConfig = await prisma.apiConfig.findUnique({
      where: { userId },
    });

    if (!apiConfig) return null;

    const key = (apiConfig as any)[keyName];
    return key || null;
  } catch (error) {
    console.error('获取 API Key 错误:', error);
    return null;
  }
}

// 获取用户选择的 AI 模型
export async function getUserSelectedModel(
  userId: string
): Promise<string | null> {
  try {
    const apiConfig = await prisma.apiConfig.findUnique({
      where: { userId },
    });

    if (!apiConfig) return null;

    return apiConfig.aiModel || null;
  } catch (error) {
    console.error('获取 AI 模型错误:', error);
    return null;
  }
}

