import { apiClient } from './client';
import { ApiResponse } from '../types/api';
import { Assessment } from '../types/assessment';

export const analysisApi = {
  analyzeSkin: async (formData: FormData) => {
    const res = await apiClient.post<ApiResponse>('/analysis/skin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  analyzeHair: async (formData: FormData) => {
    const res = await apiClient.post<ApiResponse>('/analysis/hair', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getAssessment: async (id: string) => {
    const res = await apiClient.get<ApiResponse>(`/analysis/${id}`);
    return res.data;
  },

  getHistory: async (page = 1, limit = 20, type?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (type && type !== 'all') params.append('type', type);

    const res = await apiClient.get<ApiResponse>(`/analysis/history?${params.toString()}`);
    return res.data;
  },

  compareAssessments: async (assessmentIds: string[]) => {
    const res = await apiClient.post<ApiResponse>('/analysis/compare', {
      assessment_ids: assessmentIds
    });
    return res.data;
  },

  deleteAssessment: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/analysis/${id}`);
    return res.data;
  }
};
