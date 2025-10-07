# Portfolio Monitoring System - Implementation Guide

## Overview
Created a comprehensive risk-based portfolio monitoring system for CB and SME bank portfolios with 105 farmers across Georgia.

## Data Structure

### Farmer Data (`src/data/farmers.json`)
- **Total Farmers**: 105
  - HIGH RISK: 15 farmers (Red)
  - NEEDS OBSERVATION: 30 farmers (Yellow)
  - UNDER CONTROL: 60 farmers (Green)

### Farmer Properties:
```json
{
  "id": "F001",
  "name": "გიორგი",           // Georgian name
  "surname": "მამულაშვილი",   // Georgian surname
  "nameEn": "Giorgi",         // English name
  "surnameEn": "Mamulashvili", // English surname
  "portfolio": "CB",          // CB or SME
  "riskStatus": "high",       // high, observation, controlled
  "crop": "Hazelnut",
  "area": 45.5,              // hectares
  "loanAmount": 125000,      // GEL
  "region": "Kakheti",
  "municipality": "Telavi",
  "lat": 41.9183,           // Latitude
  "lng": 45.4736            // Longitude
}
```

## Components to Implement

### 1. RiskStatusFilters Component
**Location**: `src/components/RiskStatusFilters.tsx`

Features:
- 3 color-coded buttons at top of map
- HIGH RISK (Red #ef4444)
- NEEDS OBSERVATION (Yellow #fbbf24)
- UNDER CONTROL (Green #10b981)
- Shows count for each status
- Toggle selection
- Filters farmers on map

### 2. PortfolioFilters Component
**Location**: `src/components/PortfolioFilters.tsx`

Features:
- Left sidebar filters
- Filter options:
  - **Crop**: Dropdown with all unique crops
  - **Area**: Range slider (0-60 ha)
  - **Loan**: Range slider (₾20K-₾150K)
  - **Region**: Dropdown with Georgian regions
  - **Municipality**: Dropdown (filtered by region)
- "CHECK UP" button to apply filters
- Filters are portfolio-specific (CB/SME)

### 3. PortfolioMap Component
**Location**: `src/components/PortfolioMap.tsx`

Features:
- Leaflet map centered on Georgia
- Farmers shown as colored dots:
  - Red dots: HIGH RISK
  - Yellow dots: NEEDS OBSERVATION
  - Green dots: UNDER CONTROL
- Dot size based on loan amount
- Click dot to select farmer
- Tooltip on hover showing farmer name
- Excludes South Ossetia and Abkhazia regions

### 4. FarmersList Component
**Location**: `src/components/FarmersList.tsx`

Features:
- Collapsible bottom panel
- Shows filtered farmers in table format
- Columns:
  - Name (Georgian/English based on language)
  - Crop
  - Area (ha)
  - Loan Amount (₾)
  - Region
  - Municipality
  - Risk Status (color-coded badge)
- Click row to focus on map
- Sortable columns
- Pagination (10 per page)

### 5. PortfolioDashboard Page
**Location**: `src/pages/PortfolioDashboard.tsx`

Layout:
```
┌─────────────────────────────────────────────────┐
│  [HIGH RISK] [NEEDS OBSERVATION] [UNDER CONTROL]│
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ FILTERS  │          MAP WITH DOTS               │
│          │                                      │
│ Crop     │                                      │
│ Area     │                                      │
│ Loan     │                                      │
│ Region   │                                      │
│ Municipality                                    │
│          │                                      │
│[CHECK UP]│                                      │
│          │                                      │
├──────────┴──────────────────────────────────────┤
│        FARMERS LIST (Collapsible)               │
└─────────────────────────────────────────────────┘
```

## Translation Keys

### English (`en.json`)
```json
{
  "portfolio": {
    "highRisk": "HIGH RISK",
    "needsObservation": "Needs Observation",
    "underControl": "Under Control",
    "filters": {
      "crop": "crop",
      "area": "area",
      "loan": "loan",
      "region": "region",
      "municipality": "municipality",
      "checkUp": "CHECK UP"
    },
    "farmersList": {
      "title": "Farmers List",
      "name": "Name",
      "crop": "Crop",
      "area": "Area",
      "loanAmount": "Loan Amount",
      "region": "Region",
      "municipality": "Municipality",
      "status": "Status"
    }
  }
}
```

### Georgian (`ka.json`)
```json
{
  "portfolio": {
    "highRisk": "მაღალი რისკი",
    "needsObservation": "საჭიროებს დაკვირვებას",
    "underControl": "კონტროლქვეშ",
    "filters": {
      "crop": "კულტურა",
      "area": "ფართობი",
      "loan": "სესხი",
      "region": "რეგიონი",
      "municipality": "მუნიციპალიტეტი",
      "checkUp": "შემოწმება"
    },
    "farmersList": {
      "title": "ფერმერების სია",
      "name": "სახელი",
      "crop": "კულტურა",
      "area": "ფართობი",
      "loanAmount": "სესხის თანხა",
      "region": "რეგიონი",
      "municipality": "მუნიციპალიტეტი",
      "status": "სტატუსი"
    }
  }
}
```

## State Management

Add to Zustand store (`src/lib/store.ts`):
```typescript
export type PortfolioFiltersState = {
  riskStatuses: ('high' | 'observation' | 'controlled')[];
  crop?: string;
  areaRange: [number, number];
  loanRange: [number, number];
  region?: string;
  municipality?: string;
};

export type PortfolioUIState = {
  selectedFarmerId?: string;
  showFarmersList: boolean;
};
```

## Conditional Rendering

Update `Dashboard.tsx`:
```typescript
const isPortfolioView = auth.portfolio === 'cb' || auth.portfolio === 'sme';
const isExecutiveView = auth.portfolio === 'board';

if (isExecutiveView) {
  return <ExecutiveDashboard />;
}

if (isPortfolioView) {
  return <PortfolioDashboard />;
}

// Default government/insurance view
return <StandardDashboard />;
```

## Styling Guidelines

### Risk Status Colors
- **HIGH RISK**: `bg-red-500` (#ef4444)
- **NEEDS OBSERVATION**: `bg-yellow-400` (#fbbf24)
- **UNDER CONTROL**: `bg-green-500` (#10b981)

### Button Styles
```css
.risk-button {
  @apply px-6 py-3 rounded-lg font-semibold text-white shadow-lg;
  @apply hover:shadow-xl transform hover:-translate-y-0.5;
  @apply transition-all duration-200;
}
```

### Map Markers
- Circle markers with radius 6-12px based on loan size
- Border: 2px white
- Shadow for depth
- Pulse animation on hover

## Data Distribution

### By Portfolio:
- **CB**: 35 farmers (larger loans, 20K-150K)
- **SME**: 70 farmers (smaller loans, 20K-50K)

### By Risk Status:
- **HIGH RISK**: 15 (14.3%)
- **NEEDS OBSERVATION**: 30 (28.6%)
- **UNDER CONTROL**: 60 (57.1%)

### By Region:
- Kakheti: 30 farmers (wine region)
- Imereti: 15 farmers
- Kvemo Kartli: 12 farmers
- Samegrelo: 10 farmers
- Guria: 8 farmers
- Adjara: 10 farmers
- Shida Kartli: 8 farmers
- Samtskhe-Javakheti: 7 farmers
- Racha-Lechkhumi: 5 farmers

### By Crop:
- Grape: 25 farmers
- Hazelnut: 20 farmers
- Apple: 15 farmers
- Peach: 10 farmers
- Cherry: 10 farmers
- Blueberry: 8 farmers
- Pear: 7 farmers
- Plum: 5 farmers
- Raspberry: 3 farmers
- Strawberry: 2 farmers

## Next Steps

1. Create all component files listed above
2. Implement filtering logic
3. Add map markers with proper styling
4. Create collapsible farmers list
5. Add sorting and pagination
6. Test all interactions
7. Add loading states
8. Optimize performance for 105 markers

## Notes

- All farmers have realistic Georgian names
- Coordinates are within Georgia (excluding occupied territories)
- Loan amounts correlate with portfolio type (CB > SME)
- Area sizes are realistic for Georgian agriculture
- Risk distribution follows realistic patterns
