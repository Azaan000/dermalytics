import { apiClient } from './client';
import { ApiResponse } from '../types/api';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<ApiResponse>('/auth/login', { email, password });
    return res.data;
  },

  register: async (userData: { email: string; username: string; password: string; first_name?: string; last_name?: string; gender?: string }) => {
    const res = await apiClient.post<ApiResponse>('/auth/register', userData);
    return res.data;
  },

  registerDoctor: async (doctorData: {
    email: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    pmdc_number: string;
    qualification: string;
    specialty: string;
    hospital_name: string;
    city?: string;
    area?: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
    consultation_fee?: number;
  }) => {
    const res = await apiClient.post<ApiResponse>('/auth/register-doctor', doctorData);
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post<ApiResponse>('/auth/logout');
    return res.data;
  },

  resetPassword: async (email: string) => {
    const res = await apiClient.post<ApiResponse>('/auth/reset-password', { email });
    return res.data;
  }
};
