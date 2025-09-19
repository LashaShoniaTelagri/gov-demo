# Georgia Agricultural Monitoring Demo – Project Specification

## Overview

Develop a lightweight, single‑page web application that demonstrates a prototype of a unified digital platform for digitizing and monitoring perennial orchards in Georgia. The app must enable decision‑makers to explore orchard data, visualize key metrics, and simulate interventions (e.g., adding irrigation). It should be bilingual (Georgian/English), run entirely in the browser without a backend, and use static mock data.

## Tech Stack

- **Vite** as the build tool and development server.
- **React** (with functional components and hooks) for UI.
- **TypeScript** for type safety.
- **Tailwind CSS** for styling; include a basic configuration.
- **Leaflet** for map rendering (use OpenStreetMap tiles).
- **Recharts** (or ECharts) for charts (sparklines, radar charts).
- **Zustand** (or a minimal context) for global state management.
- **i18next** for localization (Georgian ↔ English).
- **react‑to‑print** or **@react‑pdf/renderer** for PDF generation of the agronomic report.

No external API calls are allowed; all data must come from locally stored JSON/GeoJSON files.

## Data Sources (to be included in `/src/data`)

1. **Administrative Boundaries** – Use an open‑license administrative boundaries dataset for Georgia (ADM0–ADM2). Preload these for region/municipality filters.
2. **Orchards GeoJSON** – Create a mock dataset of 20–50 orchard polygons. Each feature must include:
   - `orchard_id`, `cadastre_code`, `region`, `municipality`
   - `crop`, `variety`, `area_ha`, `planting_year`, `age_years`
   - `scheme_trees_per_ha`, `seedling_origin`
   - `irrigation.has`, `irrigation.source`
   - `soil.ph`, `soil.n`, `soil.p`, `soil.k`
   - `indices.ndvi_mean`, `indices.vigor_index`, `indices.waterlogging_risk`
   - `risk.frost_pocket`, `risk.erosion`, `risk.wind_exposure`
   - `yield_history_t_ha` (array of 3–5 numbers)
   - `score` (0–100, computed in `scoring.ts`)
   - `flags` (array of strings).
3. **Monitoring Visits** – Create a JSON file mapping each `orchard_id` to an array of visits. Each visit should include:
   - `season` ("Spring", "EarlySummer", "LateSummer", "PostHarvest")
   - `date` (ISO date string)
   - `weeds`, `pest` (categorical: "low", "medium", "high")
   - `notes` (brief text)
   - `images` (array of relative image paths in `src/assets`).
4. **Translations** – Provide a `locales` folder with `ka.json` (Georgian) and `en.json` (English). All UI strings must be retrieved via i18next.

## Features and Requirements

### 1. Landing / Dashboard Page
- Display a full‑screen Leaflet map.
- Overlay orchard polygons; color them by score (red → amber → green).
- Provide layer toggles:
  - Show/hide orchards.
  - Show NDVI/vigor heatmap based on `indices.ndvi_mean`.
  - Show administrative boundaries.
  - Show optional environmental overlays (e.g., protected areas, biodiversity, forest inventory) if added later.
- Provide a filter side panel with dropdowns/sliders:
  - Region, Municipality (cascading from administrative boundaries).
  - Crop type, Orchard age (range slider).
  - Irrigation (Yes/No).
  - Score (range slider).
- Display KPI cards (summary statistics) above or beside the map:
  - Number of orchards, Total area (ha), Average score.
  - Percent irrigated orchards.
  - NDVI trend sparkline (last 12 months).
  - Count of flagged orchards.

### 2. Orchard Details Drawer
- When a polygon is clicked, open a sliding panel or modal showing:
  - Basic info: crop, variety, area, planting year, age, scheme, seedling origin, irrigation.
  - Score breakdown radar chart (customizable categories).
  - NDVI trend line for that orchard (last 12 months).
  - Monitoring visit timeline with collapsible sections:
    - Each visit shows date, season, weeds & pest rating, notes, and thumbnails of photos.
  - Button to **Download Agronomic Report**: generate a PDF summarizing the orchard’s status, score breakdown, and recommendations.

### 3. Targeting & Impact Simulation
- Display a table or list of orchards sorted by ascending score.
- Provide controls to simulate interventions:
  - For example, “Add irrigation (+15 to score)” or “Improve soil fertilization (+10)”.
  - Upon selection, update the displayed score and yield projection (linear uplift).
- Visualize the before/after difference using small bar charts or delta indicators.

### 4. Audit & Flags
- Provide a tab to list orchards with `flags` set.
- For each flagged orchard, show the reason (e.g., low soil nitrogen, missing irrigation, abnormal spacing).
- Allow quick navigation to the orchard on the map.

### 5. Localization & Accessibility
- Implement a language toggle (KA/EN). Use i18next to provide translations.
- Ensure text remains legible and that colors meet contrast guidelines.

### 6. Styling
- Use a clean, modern government‑grade aesthetic: light background, subtle grays, agriculture‑green accents.
- Use Tailwind CSS utilities; avoid inline styles.
- Provide responsive design for desktop; optional simplified mobile view.

### 7. Project Structure
src
/assets        (logos, photo placeholders)
/components    (Map.tsx, LayerToggles.tsx, Filters.tsx, KpiCards.tsx, OrchardDrawer.tsx, ScoreRadar.tsx, NdviTrend.tsx, Targeting.tsx, Audit.tsx)
/data          (orchards.geojson, visits.json, boundaries.geojson, etc.)
/locales       (ka.json, en.json)
/lib           (scoring.ts, i18n.ts, utils.ts)
/pages
Dashboard.tsx
Targeting.tsx
Audit.tsx
main.tsx
App.tsx


### 8. Implementation Notes
- Do not fetch remote resources; all data must be bundled with the app.
- Use `import` to read JSON/GeoJSON.
- Compute the **score** using `src/lib/scoring.ts`. Define a simple weighted formula:
score = 0.25 * (irrigation.has ? 100 : 0)
+ 0.20 * soilQualityScore
+ 0.20 * plantHealthScore
+ 0.15 * weedScore
+ 0.10 * pestScore
+ 0.10 * managementScore
- risk penalties

Each component must be derived from orchard attributes or monitoring notes.
- Provide tooltip explanations for each score component.
- Use React and Leaflet hooks (e.g., `useMap`, `GeoJSON` layers).
- Use Recharts/ECharts for charts; always include axis titles and chart titles.

### 9. Deliverables
- Fully functional SPA served via Vite (`npm run dev` to start).
- Mock data files in `/src/data`.
- Localization files.
- `README.md` explaining how to install dependencies and run the project.
- `README.md` should note that administrative boundaries and environmental layers were sourced from open datasets and are included as static files.


