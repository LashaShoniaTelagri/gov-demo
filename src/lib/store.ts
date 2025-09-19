import { create } from 'zustand';

export type FiltersState = {
  region?: string;
  municipality?: string;
  crop?: string;
  ageRange: [number, number];
  areaRangeHa: [number, number];
  irrigation?: boolean;
  scoreRange: [number, number];
  lab: {
    ph?: [number, number];
    n?: [number, number];
    p?: [number, number];
    k?: [number, number];
  };
  indices: {
    ndvi: boolean;
    evi: boolean;
    ndre: boolean;
    mcari: boolean;
    pri: boolean;
    ndwi: boolean;
    ndmi: boolean;
    lswi: boolean;
    savi: boolean;
    msavi: boolean;
  };
  diseases: {
    alternaria_alternata: boolean;
    verticillium_dahliae: boolean;
    colletotrichum_acutatum: boolean;
  };
  insects: {
    myzus_persicae: boolean;
    cydia_pomonella: boolean;
    tetranychus_urticae: boolean;
  };
};

export type LayerTogglesState = {
  showOrchards: boolean;
  showNdvi: boolean;
  showAdmin: boolean;
};

export type UIState = {
  selectedOrchardId?: string;
  showLeftPanel: boolean;
  showRightPanel: boolean;
};

type AppState = {
  filters: FiltersState;
  toggles: LayerTogglesState;
  ui: UIState;
  setFilters: (partial: Partial<FiltersState>) => void;
  setToggles: (partial: Partial<LayerTogglesState>) => void;
  setUI: (partial: Partial<UIState>) => void;
};

export const useAppStore = create<AppState>((set) => ({
  filters: {
    ageRange: [0, 50],
    areaRangeHa: [0, 1000],
    scoreRange: [0, 100],
    lab: {},
    indices: { ndvi: false, evi: false, ndre: false, mcari: false, pri: false, ndwi: false, ndmi: false, lswi: false, savi: false, msavi: false },
    diseases: { alternaria_alternata: false, verticillium_dahliae: false, colletotrichum_acutatum: false },
    insects: { myzus_persicae: false, cydia_pomonella: false, tetranychus_urticae: false },
  },
  toggles: {
    showOrchards: true,
    showNdvi: false,
    showAdmin: true,
  },
  ui: { showLeftPanel: true, showRightPanel: false },
  setFilters: (partial) => set((state) => ({ filters: { ...state.filters, ...partial } })),
  setToggles: (partial) => set((state) => ({ toggles: { ...state.toggles, ...partial } })),
  setUI: (partial) => set((state) => ({ ui: { ...state.ui, ...partial } })),
}));


