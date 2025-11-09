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
        aiProvider: 'openrouter',
        selectedModel: '',
        openrouterKey: '',
        deepseekKey: '',
        xfyunAppId: '',
        xfyunApiKey: '',
        xfyunApiSecret: '',
        amapKey: '',
        baiduMapKey: '',
      });
      return;
    }

    // 返回配置（包含完整值以便编辑）
    res.json({
      aiProvider: apiConfig.aiProvider || 'openrouter',
      selectedModel: apiConfig.selectedModel || '',
      openrouterKey: apiConfig.openrouterKey || '',
      deepseekKey: apiConfig.deepseekKey || '',
      xfyunAppId: apiConfig.xfyunAppId || '',
      xfyunApiKey: apiConfig.xfyunApiKey || '',
      xfyunApiSecret: apiConfig.xfyunApiSecret || '',
      amapKey: apiConfig.amapKey || '',
      baiduMapKey: apiConfig.baiduMapKey || '',
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
      aiProvider,
      selectedModel,
      openrouterKey,
      deepseekKey,
      xfyunAppId,
      xfyunApiKey,
      xfyunApiSecret,
      amapKey,
      baiduMapKey,
    } = req.body;

    // 直接存储（演示版本）
    const updateData: any = {};
    if (aiProvider !== undefined) updateData.aiProvider = aiProvider;
    if (selectedModel !== undefined) updateData.selectedModel = selectedModel;
    if (openrouterKey !== undefined) updateData.openrouterKey = openrouterKey;
    if (deepseekKey !== undefined) updateData.deepseekKey = deepseekKey;
    if (xfyunAppId !== undefined) updateData.xfyunAppId = xfyunAppId;
    if (xfyunApiKey !== undefined) updateData.xfyunApiKey = xfyunApiKey;
    if (xfyunApiSecret !== undefined) updateData.xfyunApiSecret = xfyunApiSecret;
    if (amapKey !== undefined) updateData.amapKey = amapKey;
    if (baiduMapKey !== undefined) updateData.baiduMapKey = baiduMapKey;

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

