export type CountryCode = 'georgia' | 'uzbekistan';

export interface GridSource {
  geojsonUrl: string;
  agriOverlayUrl?: string;
  center: [number, number];
  zoom: number;
  available: boolean;
}

export const GRID_SOURCES: Record<CountryCode, GridSource> = {
  georgia: {
    geojsonUrl: '/grids/grid-georgia.geojson',
    agriOverlayUrl: '/grids/grid-georgia-agri.geojson',
    center: [42.0, 43.5],
    zoom: 7,
    available: true,
  },
  // Uzbekistan grid currently covers only the Fergana valley — full-country
  // coverage is pending from the GIS team. Center/zoom target Fergana.
  uzbekistan: {
    geojsonUrl: '/grids/grid-uzbekistan.geojson',
    center: [40.5, 71.5],
    zoom: 8,
    available: true,
  },
};

export const CROPS = [
  'Apple', 'Hazelnut', 'Blueberry', 'Grape', 'Cherry', 'Peach', 'Plum',
  'Walnut', 'Kiwi', 'Almond', 'Pear', 'Cotton', 'Wheat', 'Apricot',
];

export const REGIONS_BY_COUNTRY: Record<CountryCode, string[]> = {
  georgia: [
    'Kakheti', 'Kvemo Kartli', 'Shida Kartli', 'Samtskhe-Javakheti',
    'Imereti', 'Guria', 'Samegrelo', 'Racha-Lechkhumi', 'Adjara', 'Mtskheta-Mtianeti',
  ],
  // Uzbekistan grid coverage is currently limited to the Fergana valley.
  // Add viloyats here as the GIS team delivers them.
  uzbekistan: ['Fergana'],
};

// TODO: replace with real formula once provided by the business team.
// Current placeholder: value = area * cropFactor * regionFactor.
const CROP_FACTOR: Record<string, number> = {
  Apple: 1200, Hazelnut: 1800, Blueberry: 3500, Grape: 1500, Cherry: 2200,
  Peach: 1400, Plum: 1100, Walnut: 2000, Kiwi: 2800, Almond: 1700, Pear: 1300,
  Cotton: 900, Wheat: 600, Apricot: 1600,
};

const REGION_FACTOR: Record<string, number> = {
  Kakheti: 1.2, 'Kvemo Kartli': 1.0, 'Shida Kartli': 1.1, 'Samtskhe-Javakheti': 0.9,
  Imereti: 1.05, Guria: 0.95, Samegrelo: 1.0, 'Racha-Lechkhumi': 0.85,
  Adjara: 1.1, 'Mtskheta-Mtianeti': 0.9,
  Andijan: 1.1, Bukhara: 1.0, Fergana: 1.05, Samarqand: 1.0, Tashkent: 1.15,
};

export interface CalculatorInput {
  area: number;
  crop: string;
  region: string;
}

export const calculateValue = ({ area, crop, region }: CalculatorInput): number => {
  const cropFactor = CROP_FACTOR[crop] ?? 1000;
  const regionFactor = REGION_FACTOR[region] ?? 1.0;
  return area * cropFactor * regionFactor;
};
