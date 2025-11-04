import api from './api';

export interface ApiConfig {
  openrouterKey?: string;
  xfyunAppId?: string;
  xfyunApiKey?: string;
  xfyunApiSecret?: string;
  amapKey?: string;
  baiduMapKey?: string;
}

export const getApiConfig = async (): Promise<ApiConfig> => {
  const response = await api.get('/api/config');
  return response.data;
};

export const updateApiConfig = async (config: ApiConfig): Promise<void> => {
  await api.put('/api/config', config);
};

