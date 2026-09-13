import { apiClient } from './client';
import { ApiResponse } from '../types/api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponseData {
  reply: string;
  model: string;
  is_live_api: boolean;
  disclaimer: string;
}

export interface ChatConfigData {
  has_server_key: boolean;
  default_model: string;
  popular_models: { id: string; name: string; is_free?: boolean }[];
}

export const chatApi = {
  sendMessage: async (messages: ChatMessage[], apiKey?: string, model?: string) => {
    const res = await apiClient.post<ApiResponse<ChatResponseData>>('/chat', {
      messages,
      api_key: apiKey || undefined,
      model: model || undefined
    });
    return res.data;
  },

  getConfig: async () => {
    const res = await apiClient.get<ApiResponse<ChatConfigData>>('/chat/config');
    return res.data;
  }
};
