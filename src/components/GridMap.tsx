import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import type { GridSource } from '../lib/gridCalculator';
import { translateRegion, translateMunicipality } from '../lib/regionTranslations';
import { GOOGLE_SAT_ATTRIBUTION, googleSatelliteUrl } from '../lib/mapTiles';

export interface GridCellSelection {
  cellId: string;
  area: number;
  region: string;
}

interface GridMapProps {
  source: GridSource;
  onCellToggle: (selection: GridCellSelection) => void;
  selectedCellIds: Set<string>;
  focusRegion?: string;
  mapId?: string;
}

const COUNTRY_I18N_KEYS: Record<string, string> = {
  GE: 'grid.countries.georgia',
  UZ: 'grid.countries.uzbekistan',
};

// Match the GIS team's Georgia_Grid_V2 deliverable: green outline only, fill
// transparent so the satellite basemap shows through.
const BASE_STYLE: L.PathOptions = {
  color: 'rgba(15, 166, 75, 1)',
  weight: 1,
  fillOpacity: 0,
};

const SELECTED_STYLE: L.PathOptions = {
  color: '#1d4ed8',
  weight: 2.5,
  fillColor: '#3b82f6',
  fillOpacity: 0.45,
};

// Soft green halo behind the clickable cells, mirrors V2's agri overlay tint.
const AGRI_STYLE: L.PathOptions = {
  stroke: false,
  fillColor: 'rgba(180, 224, 163, 1)',
  fillOpacity: 0.43,
  interactive: false,
};

const GridMap: React.FC<GridMapProps> = ({
  source,
  onCellToggle,
  selectedCellIds,
  focusRegion,
  mapId = 'grid-map',
}) => {
  const { t, i18n } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const agriRef = useRef<L.GeoJSON | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const onCellToggleRef = useRef(onCellToggle);
  onCellToggleRef.current = onCellToggle;
  const i18nRef = useRef({ t, lang: i18n.language });
  i18nRef.current = { t, lang: i18n.language };

  const buildTooltip = (p: Record<string, unknown>): string => {
    const { t: tr, lang } = i18nRef.current;
    const cellId = String(p.cell_id ?? '');
    const area = Number(p.area_ha ?? 0);
    const region = String(p.region ?? '');
    const municipality = p.municipality ? String(p.municipality) : '';
    const countryKey = COUNTRY_I18N_KEYS[String(p.country ?? '')];
    const countryName = countryKey ? tr(countryKey) : String(p.country ?? '');
    const municipalityRow = municipality
      ? `<div><span class="k">${tr('placeOrder.tooltip.municipality')}</span><span class="v">${translateMunicipality(municipality, lang)}</span></div>`
      : '';
    return `
      <div class="grid-tooltip">
        <div><span class="k">${tr('placeOrder.tooltip.id')}</span><span class="v">${cellId}</span></div>
        <div><span class="k">${tr('placeOrder.tooltip.area')}</span><span class="v">${area.toLocaleString()}</span></div>
        <div><span class="k">${tr('placeOrder.tooltip.country')}</span><span class="v">${countryName}</span></div>
        <div><span class="k">${tr('placeOrder.tooltip.region')}</span><span class="v">${translateRegion(region, lang)}</span></div>
        ${municipalityRow}
      </div>`;
  };

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map(mapId, {
        center: source.center,
        zoom: source.zoom,
        zoomControl: true,
      });
      // Google Hybrid (satellite + labels) — matches FieldsMap and the
      // GIS team's V2 deliverable basemap choice for agricultural context.
      tileRef.current = L.tileLayer(googleSatelliteUrl(i18n.language), {
        subdomains: ['0', '1', '2', '3'],
        attribution: GOOGLE_SAT_ATTRIBUTION,
        maxZoom: 20,
        maxNativeZoom: 19,
      }).addTo(map);
      mapRef.current = map;
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
        tileRef.current = null;
      }
    };
  }, [mapId]);

  // Follow the interface language for map labels.
  useEffect(() => {
    tileRef.current?.setUrl(googleSatelliteUrl(i18n.language));
  }, [i18n.language]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }
    if (agriRef.current) {
      agriRef.current.remove();
      agriRef.current = null;
    }

    if (!source.available) {
      map.setView(source.center, source.zoom);
      return;
    }

    let cancelled = false;

    if (source.agriOverlayUrl) {
      fetch(source.agriOverlayUrl)
        .then((r) => r.json())
        .then((fc: GeoJSON.FeatureCollection) => {
          if (cancelled || !mapRef.current) return;
          agriRef.current = L.geoJSON(fc, { style: () => AGRI_STYLE }).addTo(
            mapRef.current,
          );
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load agri overlay', err);
        });
    }

    fetch(source.geojsonUrl)
      .then((r) => r.json())
      .then((fc: GeoJSON.FeatureCollection) => {
        if (cancelled || !mapRef.current) return;
        const layer = L.geoJSON(fc, {
          style: () => BASE_STYLE,
          onEachFeature: (feature, lyr) => {
            const p = feature.properties ?? {};
            const cellId = String(p.cell_id ?? '');
            const area = Number(p.area_ha ?? 0);
            const region = String(p.region ?? '');
            lyr.bindTooltip(buildTooltip(p), {
              sticky: true,
              direction: 'top',
              opacity: 1,
              offset: L.point(0, -24),
            });
            lyr.on('click', () => {
              if (!cellId) return;
              onCellToggleRef.current({ cellId, area, region });
            });
          },
        }).addTo(mapRef.current);
        layerRef.current = layer;
        const bounds = layer.getBounds();
        if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load grid GeoJSON', err);
      });

    return () => {
      cancelled = true;
    };
  }, [source]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.eachLayer((lyr) => {
      const feature = (lyr as L.GeoJSON & { feature?: GeoJSON.Feature }).feature;
      if (!feature) return;
      const cellId = String(feature.properties?.cell_id ?? '');
      const isSelected = selectedCellIds.has(cellId);
      (lyr as L.Path).setStyle(isSelected ? SELECTED_STYLE : BASE_STYLE);
    });
  }, [selectedCellIds]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.eachLayer((lyr) => {
      const feature = (lyr as L.GeoJSON & { feature?: GeoJSON.Feature }).feature;
      if (!feature) return;
      const p = feature.properties ?? {};
      (lyr as L.Layer).unbindTooltip();
      (lyr as L.Layer).bindTooltip(buildTooltip(p), {
        sticky: true,
        direction: 'top',
        opacity: 1,
        offset: L.point(0, -24),
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer || !focusRegion) return;
    const regionBounds = L.latLngBounds([]);
    layer.eachLayer((lyr) => {
      const feature = (lyr as L.GeoJSON & { feature?: GeoJSON.Feature }).feature;
      if (!feature) return;
      if (String(feature.properties?.region ?? '') !== focusRegion) return;
      const b = (lyr as L.Polygon).getBounds?.();
      if (b && b.isValid()) regionBounds.extend(b);
    });
    if (regionBounds.isValid()) map.flyToBounds(regionBounds, { padding: [30, 30], duration: 0.8 });
  }, [focusRegion]);

  return <div id={mapId} className="w-full h-full" />;
};

export default GridMap;
