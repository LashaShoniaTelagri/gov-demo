export type ServiceType = 'one-time' | 'annual';

export interface PricingInput {
  areaHa: number;
  crops: string[];
  serviceType: ServiceType;
}

export interface PricingBreakdown {
  areaCost: number;
  cropCost: number;
  total: number;
}

export const RATE_PER_HA: Record<ServiceType, number> = {
  'one-time': 1,
  annual: 3,
};

export const PRICE_PER_CROP = 5000;

export const calculatePrice = ({
  areaHa,
  crops,
  serviceType,
}: PricingInput): PricingBreakdown => {
  const areaCost = Math.max(0, areaHa) * RATE_PER_HA[serviceType];
  const cropCost = crops.length * PRICE_PER_CROP;
  return { areaCost, cropCost, total: areaCost + cropCost };
};
