import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import {
  agriOverlayUrl,
  MONITORING_COUNTRY_CENTERS,
  getScoreColor,
  scoreBucket,
  type FieldFeature,
  type FieldFeatureCollection,
  type MonitoringCountry,
} from '../lib/fieldsData';
import { translateRegion, translateMunicipality } from '../lib/regionTranslations';
import { GOOGLE_SAT_ATTRIBUTION, googleSatelliteUrl } from '../lib/mapTiles';

interface FieldsMapProps {
  fields: FieldFeatureCollection | null;
  visibleFieldIds: Set<string>;
  selectedFieldIds: Set<string>;
  selectionMode: boolean;
  country: MonitoringCountry;
  onFieldClick: (field: FieldFeature) => void;
  onEmptyClick: (latlng: { lat: number; lng: number }) => void;
  mapId?: string;
}

const AGRI_STYLE: L.PathOptions = {
  stroke: false,
  fillColor: 'rgba(76, 175, 80, 1)',
  fillOpacity: 0.18,
  interactive: false,
};

const HIDDEN_STYLE: L.PathOptions = {
  opacity: 0,
  fillOpacity: 0,
  interactive: false,
};

// Real cadastral boundary supplied by the GIS team (WithinCell_Fields_V2,
// "Cadastral area" feature). One registered parcel (~1.4 ha) enclosing a single
// planted plot (GE-F-51, ~0.6 ha) — showing that the planted area is only part
// of the cadastral-registered area. Coordinates are [lat, lng]; rendered as the
// GIS team's blue outline with no fill, non-interactive so the plot underneath
// stays clickable. Georgia only; not replicated to any other plot.
const CADASTRAL_SAMPLE_RING: L.LatLngExpression[] = [
  [41.890496275712295, 45.73708690900493],
  [41.890092744782365, 45.73758554049471],
  [41.88975595800599, 45.73797910033147],
  [41.88962756319972, 45.73805908668201],
  [41.88947232010632, 45.73808992449452],
  [41.888912758333134, 45.7372870058135],
  [41.889411630305666, 45.73667417671424],
  [41.8898425273752, 45.73615175793073],
];

const CADASTRAL_STYLE: L.PathOptions = {
  color: 'rgba(26,167,255,1.0)',
  weight: 2,
  lineCap: 'butt',
  lineJoin: 'miter',
  fill: false,
  interactive: false,
};

// The actual planted area (GIS "id 51" feature, ~0.6 ha) — roughly half of the
// cadastral parcel above. Drawn as a green transparent fill so the demo shows
// that only part of the registered cadastral area is planted. Coordinates are
// [lat, lng]; non-interactive so clicks fall through to the plot beneath.
const PLANTED_SAMPLE_RING: L.LatLngExpression[] = [
  [41.89049158646674, 45.737087429469966],
  [41.89008579183838, 45.737574702147306],
  [41.88945055407249, 45.73664650679688],
  [41.88983838515495, 45.736168227288054],
];

const PLANTED_STYLE: L.PathOptions = {
  stroke: false,
  fill: true,
  fillColor: '#16a34a',
  fillOpacity: 0.45,
  interactive: false,
};

// The evaluated plot that the cadastral demo wraps. Its own score-coloured fill
// is suppressed (invisible but still clickable) so the green planted overlay —
// not the full plot — is what reads as planted inside the cadastral outline.
const CADASTRAL_PLOT_ID = 'GE-F-51';

const PLOT_FILL_HIDDEN: L.PathOptions = {
  stroke: false,
  fill: true,
  fillOpacity: 0,
  interactive: true,
};


const scoreStyle = (score: number, selected: boolean): L.PathOptions => {
  const base = getScoreColor(score);
  return {
    color: selected ? '#1d4ed8' : base.stroke,
    weight: selected ? 3 : 1.5,
    fillColor: selected ? 'rgba(59, 130, 246, 0.55)' : base.fill,
    fillOpacity: 0.8,
    opacity: 1,
    interactive: true,
  };
};

const centroidOf = (feature: FieldFeature): L.LatLng | null => {
  const coords: number[][] = [];
  const walk = (c: unknown) => {
    if (Array.isArray(c) && typeof c[0] === 'number') {
      coords.push(c as number[]);
      return;
    }
    if (Array.isArray(c)) for (const x of c) walk(x);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walk((feature.geometry as any).coordinates);
  if (!coords.length) return null;
  let x = 0;
  let y = 0;
  for (const [lng, lat] of coords) {
    x += lng;
    y += lat;
  }
  return L.latLng(y / coords.length, x / coords.length);
};

const FieldsMap: React.FC<FieldsMapProps> = ({
  fields,
  visibleFieldIds,
  selectedFieldIds,
  selectionMode,
  country,
  onFieldClick,
  onEmptyClick,
  mapId = 'fields-map',
}) => {
  const { t, i18n } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const agriRef = useRef<L.GeoJSON | null>(null);
  const cadastralRef = useRef<L.Polygon | null>(null);
  const plantedRef = useRef<L.Polygon | null>(null);
  const fieldsLayerRef = useRef<L.GeoJSON | null>(null);
  const labelsRef = useRef<L.LayerGroup | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const onFieldClickRef = useRef(onFieldClick);
  const onEmptyClickRef = useRef(onEmptyClick);
  onFieldClickRef.current = onFieldClick;
  onEmptyClickRef.current = onEmptyClick;
  const i18nRef = useRef({ t, lang: i18n.language });
  i18nRef.current = { t, lang: i18n.language };
  const selectionModeRef = useRef(selectionMode);
  selectionModeRef.current = selectionMode;

  const buildTooltip = (p: FieldFeature['properties']): string => {
    const { t: tr, lang } = i18nRef.current;
    const cropLabel = p.crop
      ? tr(`placeOrder.cropNames.${p.crop.toLowerCase()}`)
      : '—';
    const scoreText = p.is_cell ? '—' : p.score.toFixed(1);
    const municipalityRow = p.municipality
      ? `<div><span class="k">${tr('monitoring.tooltip.municipality')}</span><span class="v">${translateMunicipality(p.municipality, lang)}</span></div>`
      : '';
    return `
      <div class="grid-tooltip">
        <div><span class="k">${tr('monitoring.tooltip.id')}</span><span class="v">${p.field_id}</span></div>
        <div><span class="k">${tr('monitoring.tooltip.crop')}</span><span class="v">${cropLabel}</span></div>
        <div><span class="k">${tr('monitoring.tooltip.score')}</span><span class="v">${scoreText}</span></div>
        <div><span class="k">${tr('monitoring.tooltip.area')}</span><span class="v">${p.area_ha.toLocaleString()}</span></div>
        <div><span class="k">${tr('monitoring.tooltip.region')}</span><span class="v">${translateRegion(p.region, lang)}</span></div>
        ${municipalityRow}
      </div>`;
  };

  useEffect(() => {
    if (!mapRef.current) {
      const initial = MONITORING_COUNTRY_CENTERS[country];
      const map = L.map(mapId, {
        center: initial.center,
        zoom: initial.zoom,
        zoomControl: true,
      });
      tileRef.current = L.tileLayer(
        googleSatelliteUrl(i18n.language),
        {
          subdomains: ['0', '1', '2', '3'],
          attribution: GOOGLE_SAT_ATTRIBUTION,
          maxZoom: 20,
          maxNativeZoom: 19,
        },
      ).addTo(map);
      // Dedicated panes so fields always sit above the agri overlay,
      // regardless of which geojson finishes loading first.
      map.createPane('agri').style.zIndex = '410';
      map.createPane('fields').style.zIndex = '450';
      // Planted overlay sits just above the (suppressed) plot fill; the
      // cadastral outline sits above that. Both are non-interactive, so the
      // plot underneath stays clickable.
      map.createPane('planted').style.zIndex = '455';
      map.createPane('cadastral').style.zIndex = '460';
      map.on('click', (e: L.LeafletMouseEvent) => {
        onEmptyClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
      mapRef.current = map;
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        agriRef.current = null;
        cadastralRef.current = null;
        plantedRef.current = null;
        fieldsLayerRef.current = null;
        labelsRef.current = null;
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
    if (agriRef.current) {
      agriRef.current.remove();
      agriRef.current = null;
    }
    let cancelled = false;
    fetch(agriOverlayUrl(country))
      .then((r) => r.json())
      .then((fc: GeoJSON.FeatureCollection) => {
        if (cancelled || !mapRef.current) return;
        const layer = L.geoJSON(fc, {
          pane: 'agri',
          style: () => AGRI_STYLE,
        });
        layer.addTo(mapRef.current);
        agriRef.current = layer;
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load agri overlay', err);
      });
    return () => {
      cancelled = true;
    };
  }, [country]);

  // Single sample cadastral demo (real GIS geometry) — the green planted area
  // and the blue cadastral outline around it. Georgia only.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const clear = () => {
      if (plantedRef.current) {
        plantedRef.current.remove();
        plantedRef.current = null;
      }
      if (cadastralRef.current) {
        cadastralRef.current.remove();
        cadastralRef.current = null;
      }
    };
    clear();
    if (country !== 'georgia') return;
    plantedRef.current = L.polygon(PLANTED_SAMPLE_RING, {
      pane: 'planted',
      ...PLANTED_STYLE,
    }).addTo(map);
    cadastralRef.current = L.polygon(CADASTRAL_SAMPLE_RING, {
      pane: 'cadastral',
      ...CADASTRAL_STYLE,
    }).addTo(map);
    return clear;
  }, [country]);

  // Refs so the style/selection effects can read the latest props without
  // being declared as deps — keeps clicks from re-running the layer-build
  // effect (which would fit bounds and reset the user's zoom).
  const visibleRef = useRef(visibleFieldIds);
  visibleRef.current = visibleFieldIds;
  const selectedRef = useRef(selectedFieldIds);
  selectedRef.current = selectedFieldIds;

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fields) return;

    if (fieldsLayerRef.current) {
      fieldsLayerRef.current.remove();
      fieldsLayerRef.current = null;
    }

    const layer = L.geoJSON(fields, {
      pane: 'fields',
      style: (feature) => {
        const p = (feature as FieldFeature).properties;
        if (!visibleRef.current.has(p.field_id)) return HIDDEN_STYLE;
        if (p.field_id === CADASTRAL_PLOT_ID) return PLOT_FILL_HIDDEN;
        return scoreStyle(p.score, selectedRef.current.has(p.field_id));
      },
      onEachFeature: (feature, lyr) => {
        const p = (feature as FieldFeature).properties;
        lyr.bindTooltip(buildTooltip(p), {
          sticky: true,
          direction: 'top',
          opacity: 1,
          offset: L.point(0, -24),
        });
        lyr.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          if (!visibleRef.current.has(p.field_id)) return;
          onFieldClickRef.current(feature as FieldFeature);
        });
      },
    }).addTo(map);
    fieldsLayerRef.current = layer;

    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
  }, [fields]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = fieldsLayerRef.current;
    if (!map || !layer) return;

    layer.eachLayer((lyr) => {
      const feature = (lyr as L.GeoJSON & { feature?: FieldFeature }).feature;
      if (!feature) return;
      const p = feature.properties;
      const visible = visibleFieldIds.has(p.field_id);
      (lyr as L.Path).setStyle(
        !visible
          ? HIDDEN_STYLE
          : p.field_id === CADASTRAL_PLOT_ID
            ? PLOT_FILL_HIDDEN
            : scoreStyle(p.score, selectedFieldIds.has(p.field_id)),
      );
    });

    if (labelsRef.current) {
      labelsRef.current.remove();
      labelsRef.current = null;
    }
    const labels = L.layerGroup().addTo(map);
    labelsRef.current = labels;

    fields?.features.forEach((feature) => {
      const p = feature.properties;
      if (!visibleFieldIds.has(p.field_id)) return;
      // Cell-bounding row carries no real score — skip the marker label so we
      // don't paint a 0/placeholder badge over the cell.
      if (p.is_cell) return;
      const c = centroidOf(feature);
      if (!c) return;
      const isSelected = selectedFieldIds.has(p.field_id);
      const scoreClasses = [
        'fm-score',
        `fm-score-${scoreBucket(p.score)}`,
        selectionMode ? 'fm-selectable' : '',
        selectionMode && isSelected ? 'fm-selected' : '',
      ]
        .filter(Boolean)
        .join(' ');
      const check =
        selectionMode && isSelected
          ? '<span class="fm-check">✓</span>'
          : '';
      const icon = L.divIcon({
        className: 'fm-icon',
        html: `<div class="${scoreClasses}">${p.score.toFixed(1)}${check}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      labels.addLayer(L.marker(c, { icon, interactive: false }));
    });
  }, [fields, visibleFieldIds, selectedFieldIds, selectionMode]);

  useEffect(() => {
    const layer = fieldsLayerRef.current;
    if (!layer) return;
    layer.eachLayer((lyr) => {
      const feature = (lyr as L.GeoJSON & { feature?: FieldFeature }).feature;
      if (!feature) return;
      const p = feature.properties;
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

  return <div id={mapId} className="w-full h-full" />;
};

export default FieldsMap;
