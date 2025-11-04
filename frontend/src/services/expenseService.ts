import api from './api';
import { Expense } from './travelPlanService';

export interface CreateExpenseData {
  category: string;
  amount: number;
  currency?: string;
  description?: string;
  date: string;
  voiceRecorded?: boolean;
}

export const getExpenses = async (travelPlanId: string): Promise<Expense[]> => {
  const response = await api.get(`/api/travel-plans/${travelPlanId}/expenses`);
  return response.data.expenses;
};

export const createExpense = async (travelPlanId: string, data: CreateExpenseData): Promise<Expense> => {
  const response = await api.post(`/api/travel-plans/${travelPlanId}/expenses`, data);
  return response.data.expense;
};

export const updateExpense = async (expenseId: string, data: Partial<CreateExpenseData>): Promise<Expense> => {
  const response = await api.put(`/api/expenses/${expenseId}`, data);
  return response.data.expense;
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  await api.delete(`/api/expenses/${expenseId}`);
};

