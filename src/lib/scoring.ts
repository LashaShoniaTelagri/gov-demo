export type SoilProps = { ph: number; n: number; p: number; k: number };
export type IndicesProps = { ndvi_mean: number; vigor_index: number; waterlogging_risk: number };
export type RiskProps = { frost_pocket: boolean; erosion: boolean; wind_exposure: boolean };

export type ScoreInputs = {
  irrigationHas: boolean;
  soil: SoilProps;
  plantHealthIndex: number;
  weedScore: number;
  pestScore: number;
  managementScore: number;
  risk: RiskProps;
};

export function computeSoilQualityScore(soil: SoilProps): number {
  const phScore = 100 - Math.abs(6.5 - soil.ph) * 20; // best around 6.5
  const macroScore = Math.min(100, (soil.n + soil.p + soil.k) / 3);
  return clamp((phScore * 0.5) + (macroScore * 0.5));
}

export function computePlantHealthScore(indices: IndicesProps): number {
  const ndviScore = indices.ndvi_mean * 100;
  const vigorScore = indices.vigor_index * 100;
  const waterPenalty = indices.waterlogging_risk * 30;
  return clamp((ndviScore * 0.5) + (vigorScore * 0.5) - waterPenalty);
}

export function computeOverallScore(inputs: ScoreInputs): number {
  const soilQualityScore = computeSoilQualityScore(inputs.soil);
  const plantHealthScore = inputs.plantHealthIndex;
  const irrigationScore = inputs.irrigationHas ? 100 : 0;

  let base = 0.25 * irrigationScore
    + 0.20 * soilQualityScore
    + 0.20 * plantHealthScore
    + 0.15 * inputs.weedScore
    + 0.10 * inputs.pestScore
    + 0.10 * inputs.managementScore;

  const riskPenalty = (inputs.risk.frost_pocket ? 10 : 0)
    + (inputs.risk.erosion ? 7 : 0)
    + (inputs.risk.wind_exposure ? 5 : 0);

  return clamp(base - riskPenalty);
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}


