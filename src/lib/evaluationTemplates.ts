import type { ScoreBucket } from './fieldsData';

// Per-spec hardcoded analysis templates per score bucket. The clicked field
// supplies its own Crop / Score / Area / Region / Municipality, but the
// evaluation panel below the divider always uses the bucket's template:
// regional average, 4-category breakdown, 3-month trend, narrative paragraph,
// Bank view text, and Monitoring text.
export interface EvaluationTemplate {
  regionalAverage: number;
  breakdown: {
    climate: number;
    irrigation: number;
    management: number;
    pests: number;
  };
  trend: { m3: number; m2: number; m1: number };
}

export const EVALUATION_TEMPLATES: Record<ScoreBucket, EvaluationTemplate> = {
  low: {
    regionalAverage: 6.8,
    breakdown: { climate: 6, irrigation: 3, management: 4, pests: 4 },
    trend: { m3: 5.1, m2: 4.8, m1: 4.2 },
  },
  mid: {
    regionalAverage: 6.7,
    breakdown: { climate: 8, irrigation: 6, management: 5, pests: 6 },
    trend: { m3: 6.0, m2: 6.1, m1: 6.3 },
  },
  high: {
    regionalAverage: 7.1,
    breakdown: { climate: 9, irrigation: 8, management: 9, pests: 8 },
    trend: { m3: 8.1, m2: 8.4, m1: 8.6 },
  },
};
