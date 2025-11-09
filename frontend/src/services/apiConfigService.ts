import api from './api';

export interface ApiConfig {
  aiProvider?: string;
  selectedModel?: string;
  openrouterKey: string;
  deepseekKey?: string;
  xfyunAppId: string;
  xfyunApiKey: string;
  xfyunApiSecret: string;
  amapKey: string;
  baiduMapKey: string;
}

export const apiConfigService = {
  // 获取 API 配置
  get: async (): Promise<ApiConfig> => {
    const response = await api.get<ApiConfig>('/api/config');
    return response.data;
  },

  // 更新 API 配置
  update: async (config: Partial<ApiConfig>): Promise<{ message: string; success: boolean }> => {
    const response = await api.put<{ message: string; success: boolean }>('/api/config', config);
    return response.data;
  },
};

