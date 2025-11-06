import api from './api';

export interface TravelPlan {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  budget: number;
  travelers: number;
  preferences?: any;
  itinerary?: any;
  suggestions?: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTravelPlanData {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  budget: number;
  travelers: number;
  preferences?: any;
}

export const travelPlanService = {
  // 创建旅行计划
  create: async (data: CreateTravelPlanData): Promise<{ travelPlan: TravelPlan }> => {
    const response = await api.post<{ travelPlan: TravelPlan }>('/api/travel-plans', data);
    return response.data;
  },

  // 获取所有旅行计划
  getAll: async (): Promise<{ travelPlans: TravelPlan[] }> => {
    const response = await api.get<{ travelPlans: TravelPlan[] }>('/api/travel-plans');
    return response.data;
  },

  // 获取单个旅行计划
  getById: async (id: string): Promise<{ travelPlan: TravelPlan }> => {
    const response = await api.get<{ travelPlan: TravelPlan }>(`/api/travel-plans/${id}`);
    return response.data;
  },

  // 更新旅行计划
  update: async (id: string, data: Partial<TravelPlan>): Promise<{ travelPlan: TravelPlan }> => {
    const response = await api.put<{ travelPlan: TravelPlan }>(`/api/travel-plans/${id}`, data);
    return response.data;
  },

  // 删除旅行计划
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/travel-plans/${id}`);
  },

  // 生成 AI 行程
  generateItinerary: async (id: string): Promise<{ travelPlan: TravelPlan }> => {
    const response = await api.post<{ travelPlan: TravelPlan }>(
      `/api/travel-plans/${id}/generate`
    );
    return response.data;
  },
};
