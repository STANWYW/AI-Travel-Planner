import api from './api';

export interface Expense {
  id: string;
  travelPlanId: string;
  category: string;
  amount: number;
  currency: string;
  description?: string;
  date: string;
  voiceRecorded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseStatistics {
  total: number;
  count: number;
  byCategory: Record<string, number>;
  remaining: number;
}

export const expenseService = {
  // 添加费用
  add: async (
    travelPlanId: string,
    data: {
      category: string;
      amount: number;
      currency?: string;
      description?: string;
      date: string;
      voiceRecorded?: boolean;
    }
  ): Promise<{ expense: Expense }> => {
    const response = await api.post<{ expense: Expense }>(
      `/api/travel-plans/${travelPlanId}/expenses`,
      data
    );
    return response.data;
  },

  // 获取费用列表和统计
  getByPlanId: async (
    travelPlanId: string
  ): Promise<{ expenses: Expense[]; statistics: ExpenseStatistics }> => {
    const response = await api.get<{ expenses: Expense[]; statistics: ExpenseStatistics }>(
      `/api/travel-plans/${travelPlanId}/expenses`
    );
    return response.data;
  },

  // 更新费用
  update: async (id: string, data: Partial<Expense>): Promise<{ expense: Expense }> => {
    const response = await api.put<{ expense: Expense }>(`/api/expenses/${id}`, data);
    return response.data;
  },

  // 删除费用
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/expenses/${id}`);
  },
};
