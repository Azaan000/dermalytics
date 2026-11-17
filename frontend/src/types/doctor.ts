export interface Doctor {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  pmdc_number: string;
  qualifications: string;
  specialties: string[];
  bio?: string;
  hospital_affiliation: string;
  clinic_address: string;
  city: string;
  area: string;
  latitude?: number;
  longitude?: number;
  consultation_fee: number;
  rating: number;
  is_available_online: boolean;
  is_verified: boolean;
  distance_km?: number | null;
}

export interface ScanReview {
  id: string;
  assessment_id: string;
  patient_id: string;
  doctor_id: string;
  status: 'pending' | 'in_review' | 'reviewed' | 'completed' | 'rejected';
  patient_notes?: string;
  doctor_notes?: string;
  agreed_with_ai?: boolean | null;
  clinical_impression?: string;
  recommended_action?: string;
  follow_up_days?: number;
  urgency_level: 'routine' | 'soon' | 'urgent' | 'emergency';
  reviewed_at?: string;
  created_at: string;
  doctor?: Doctor;
  assessment?: {
    id: string;
    image_url: string;
    ai_prediction?: string;
    gradcam_url?: string;
    confidence_score?: number;
    assessment_type?: string;
    created_at?: string;
  };
}

export interface RequestReviewPayload {
  assessment_id: string;
  doctor_id?: string;
  patient_notes?: string;
}

export interface SubmitReviewPayload {
  // Field names must match backend ScanReview model exactly
  doctor_agreement: 'agree' | 'partial' | 'disagree';
  clinical_impression: string;
  doctor_notes?: string;
  recommended_action?: string;
  prescription_advice?: string;
  urgency_tier?: 'routine' | 'semi_urgent' | 'immediate';
}
