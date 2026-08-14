import { apiClient } from './client';
import { ApiResponse } from '../types/api';

export const userApi = {
  getProfile: async () => {
    const res = await apiClient.get<ApiResponse>('/users/profile');
    return res.data;
  },

  updateProfile: async (data: any) => {
    const res = await apiClient.put<ApiResponse>('/users/profile', data);
    return res.data;
  },

  getStats: async () => {
    const res = await apiClient.get<ApiResponse>('/users/stats');
    return res.data;
  },

  getNotifications: async () => {
    const res = await apiClient.get<ApiResponse>('/users/notifications');
    return res.data;
  },

  markNotificationsRead: async () => {
    const res = await apiClient.put<ApiResponse>('/users/notifications/read-all');
    return res.data;
  },

  submitFeedback: async (feedback: { rating: number; comment?: string; assessment_id?: string }) => {
    const res = await apiClient.post<ApiResponse>('/users/feedback', feedback);
    return res.data;
  },

  exportData: async () => {
    const res = await apiClient.get<ApiResponse>('/users/export-data');
    return res.data;
  }
};
