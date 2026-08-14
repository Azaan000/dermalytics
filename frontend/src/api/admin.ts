import { apiClient } from './client';
import { ApiResponse } from '../types/api';

export const adminApi = {
  getUsers: async (page = 1, limit = 50) => {
    const res = await apiClient.get<ApiResponse>(`/admin/users?page=${page}&limit=${limit}`);
    return res.data;
  },

  toggleUserStatus: async (userId: string, isActive: boolean) => {
    const res = await apiClient.put<ApiResponse>(`/admin/users/${userId}/status`, { is_active: isActive });
    return res.data;
  },

  getAnalytics: async () => {
    const res = await apiClient.get<ApiResponse>('/admin/analytics');
    return res.data;
  },

  getHealth: async () => {
    const res = await apiClient.get<ApiResponse>('/admin/health');
    return res.data;
  },

  getMetrics: async () => {
    const res = await apiClient.get<ApiResponse>('/admin/metrics');
    return res.data;
  }
};
