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
  expenses?: Expense[];
}

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

export interface CreateExpenseData {
  category: string;
  amount: number;
  currency?: string;
  description?: string;
  date: string;
  voiceRecorded?: boolean;
}

export const createTravelPlan = async (data: CreateTravelPlanData): Promise<TravelPlan> => {
  const response = await api.post('/api/travel-plans', data);
  return response.data.travelPlan;
};

export const getTravelPlans = async (): Promise<TravelPlan[]> => {
  const response = await api.get('/api/travel-plans');
  return response.data.travelPlans;
};

export const getTravelPlan = async (id: string): Promise<TravelPlan> => {
  const response = await api.get(`/api/travel-plans/${id}`);
  return response.data.travelPlan;
};

export const updateTravelPlan = async (id: string, data: Partial<CreateTravelPlanData>): Promise<TravelPlan> => {
  const response = await api.put(`/api/travel-plans/${id}`, data);
  return response.data.travelPlan;
};

export const deleteTravelPlan = async (id: string): Promise<void> => {
  await api.delete(`/api/travel-plans/${id}`);
};

export const generateItinerary = async (id: string): Promise<TravelPlan> => {
  const response = await api.post(`/api/travel-plans/${id}/generate`);
  return response.data.travelPlan;
};

