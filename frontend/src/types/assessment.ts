import { SkinPrediction, HairPrediction } from './prediction';

export interface Assessment {
  id: string;
  type: 'skin' | 'hair';
  image_url: string;
  thumbnail_url?: string;
  thumbnail?: string;
  grad_cam_url?: string;
  prediction: SkinPrediction | HairPrediction | any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processing_time_ms?: number;
}

export interface HistoryFilter {
  type?: 'all' | 'skin' | 'hair';
  search?: string;
  risk?: string;
  sortBy?: 'newest' | 'oldest' | 'confidence';
}
