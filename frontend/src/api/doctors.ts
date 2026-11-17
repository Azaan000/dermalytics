import { apiClient } from './client';
import { Doctor, ScanReview, RequestReviewPayload, SubmitReviewPayload } from '../types/doctor';

export interface DoctorFilterParams {
  city?: string;
  area?: string;
  specialty?: string;
  query?: string;
  user_lat?: number;
  user_lon?: number;
  limit?: number;
  offset?: number;
}

export const doctorsApi = {
  getDoctors: async (params?: DoctorFilterParams): Promise<{ doctors: Doctor[]; total: number }> => {
    const response = await apiClient.get('/doctors', { params });
    return response.data.data;
  },

  getDoctorById: async (doctorId: string): Promise<Doctor> => {
    const response = await apiClient.get(`/doctors/${doctorId}`);
    return response.data.data?.doctor || response.data.data;
  },

  requestReview: async (payload: RequestReviewPayload): Promise<ScanReview> => {
    const response = await apiClient.post('/doctors/reviews/request', payload);
    return response.data.data?.review || response.data.data;
  },

  getReviewForAssessment: async (assessmentId: string): Promise<ScanReview | null> => {
    try {
      const response = await apiClient.get(`/doctors/reviews/assessment/${assessmentId}`);
      return response.data.data?.review || response.data.data || null;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  getPendingReviews: async (): Promise<ScanReview[]> => {
    const response = await apiClient.get('/doctors/reviews/pending');
    return response.data.data?.reviews || (Array.isArray(response.data.data) ? response.data.data : []);
  },

  getMyReviews: async (): Promise<ScanReview[]> => {
    const response = await apiClient.get('/doctors/reviews/my');
    return response.data.data?.reviews || (Array.isArray(response.data.data) ? response.data.data : []);
  },

  submitReview: async (reviewId: string, payload: SubmitReviewPayload): Promise<ScanReview> => {
    const response = await apiClient.post(`/doctors/reviews/${reviewId}/submit`, payload);
    return response.data.data?.review || response.data.data;
  }
};
