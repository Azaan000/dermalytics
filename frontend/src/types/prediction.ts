export interface TopClass {
  class: string;
  full_name?: string;
  code: string;
  confidence: number;
  type: string;
  risk_level: string;
  description?: string;
}

export interface SkinPrediction {
  class: string;
  code: string;
  full_name?: string;
  confidence: number;
  top_classes: TopClass[];
  risk_level: 'low' | 'medium' | 'high';
  requires_consultation: boolean;
  diagnostic_rationale?: string;
  model_version: string;
  model_name: string;
}

export interface HairMetrics {
  coverage_percentage: number;
  follicle_density: number;
  hair_diameter: number;
  scalp_visibility: number;
  sebum_level?: string;
  inflammation_score?: string;
}

export interface HairPrediction {
  density_score: number;
  thinning_stage: string;
  hairline_type: string;
  severity: string;
  recommendation: string;
  diagnostic_rationale?: string;
  metrics: HairMetrics;
  model_version: string;
  model_name: string;
}

export type AssessmentPrediction = SkinPrediction | HairPrediction;
