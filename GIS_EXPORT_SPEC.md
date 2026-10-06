# Export spec for grid GeoJSON

## 1. Format
- **File type:** plain **GeoJSON** (`.geojson`). **Do not** use QGIS's "Export to Web (qgis2web)" — we don't want the OpenLayers bundle, just the data.
- **Structure:** single `FeatureCollection` per country.

## 2. Coordinate system (most important — cost us an inline reprojection step)
- **Project the layer to EPSG:4326 (WGS84, lat/lon in degrees) before exporting.**
- In QGIS: right-click layer → *Export → Save Features As…* → CRS: **EPSG:4326**.
- Double-check: coordinates should look like `[44.8, 41.7]`, not `[4461218.5, 5390035.7]`. If you see the big numbers, the file is still in Web Mercator (EPSG:3857) and will break.

## 3. Per-cell properties (schema)
Every feature's `properties` must include:

| Key | Type | Notes |
|---|---|---|
| `cell_id` | integer | Stable, unique within the file. Needed so selections survive re-exports. |
| `area_ha` | number | Area in **hectares**. Rename — we saw just `Area` with unclear units. |
| `country` | string | `"GE"` or `"UZ"` (ISO-2). Lets us merge files later. |
| `region` | string | Must match our region names exactly (see list below). Use QGIS spatial join against official admin boundaries. |
| `municipality` | string | Same — match our municipality names. |

Without `region`/`municipality` pre-joined, the user has to pick them manually. With them, we can auto-detect from the clicked cell.

**Region names to match (Georgia):** `Kakheti`, `Kvemo Kartli`, `Shida Kartli`, `Samtskhe-Javakheti`, `Imereti`, `Guria`, `Samegrelo`, `Racha-Lechkhumi`, `Adjara`, `Mtskheta-Mtianeti`.

**Region names to match (Uzbekistan):** `Andijan`, `Bukhara`, `Fergana`, `Samarqand`, `Tashkent` (add more viloyats as coverage grows).

## 4. Geometry
- **Use `Polygon`, not `MultiPolygon`** — grid cells are simple rectangles. MultiPolygon just bloats the file.
- **Coordinate precision:** 6 decimal places is plenty (~10 cm). More than that just increases file size.
- **Clip cells to the country boundary** (current Georgia export already does this — keep doing it).

## 5. Grid sizing
- **Keep cell size consistent across countries** (e.g. 10 km × 10 km, or whatever the business rule is). We saw Georgia cells ranging ~150 ha to ~5,260 ha — fine if edge cells are the clipped boundary cells, not fine if the grid itself is non-uniform.
- **Target feature count:** Georgia is ~1,400 cells and renders fine. For Uzbekistan (~6× the area), expect **8,000–10,000 cells at the same resolution**. If it exceeds ~15,000, flag us — we may need vector tiles instead of a single GeoJSON fetch.

## 6. File naming
- Name files `grid-<country>.geojson`, lowercase country: `grid-georgia.geojson`, `grid-uzbekistan.geojson`.
- One file per country — don't merge countries into one file.

## 7. Quick self-check before handing over
1. Open the `.geojson` in a text editor, confirm coordinates are `lat/lon-looking` (small decimals).
2. Load the file into [geojson.io](https://geojson.io) — the grid should land on the correct country. If it's on Null Island (0,0) or in the ocean, the CRS is wrong.
3. Click any feature in geojson.io and confirm all five properties (`cell_id`, `area_ha`, `country`, `region`, `municipality`) are present and populated.
