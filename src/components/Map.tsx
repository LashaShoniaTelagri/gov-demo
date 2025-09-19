import React, { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../lib/store';
import orchardsRaw from '../data/orchards.geojson?raw';
import boundariesRaw from '../data/boundaries.geojson?raw';
import { useTranslation } from 'react-i18next';

const orchards: any = JSON.parse(orchardsRaw);
const boundaries: any = JSON.parse(boundariesRaw);

type OrchardFeature = any;

const FitBounds: React.FC<{ data: any }> = ({ data }) => {
  const map = useMap();
  React.useEffect(() => {
    const layer = L.geoJSON(data as any);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.05));
      map.setZoom(map.getZoom());
    }
  }, [data, map]);
  return null;
};

function getColor(score: number): string {
  if (score >= 70) return '#2e7d32';
  if (score >= 40) return '#f59e0b';
  return '#dc2626';
}

function getNdviColor(ndvi: number): string {
  // 0 -> red, 0.5 -> amber, 1 -> green
  if (ndvi >= 0.7) return '#2e7d32';
  if (ndvi >= 0.4) return '#f59e0b';
  return '#dc2626';
}

const Map: React.FC = () => {
  const { t } = useTranslation();
  const { filters, toggles, setUI } = useAppStore();
  const [zoom, setZoom] = React.useState<number>(8);

  const ZoomListener: React.FC<{ onZoom: (z: number) => void }> = ({ onZoom }) => {
    const map = useMapEvents({
      zoomend() {
        onZoom(map.getZoom());
      },
    });
    React.useEffect(() => {
      onZoom(map.getZoom());
    }, [map, onZoom]);
    return null;
  };

  function polygonCentroid(feature: any): [number, number] | null {
    const geom = feature.geometry;
    if (!geom) return null;
    const getRingCentroid = (ring: number[][]): [number, number] => {
      let sumLon = 0;
      let sumLat = 0;
      let count = 0;
      for (const coord of ring) {
        if (Array.isArray(coord) && coord.length >= 2) {
          sumLon += coord[0];
          sumLat += coord[1];
          count += 1;
        }
      }
      return count > 0 ? [sumLat / count, sumLon / count] : [0, 0];
    };
    if (geom.type === 'Polygon') {
      const ring = geom.coordinates?.[0] as number[][] | undefined;
      if (!ring) return null;
      return getRingCentroid(ring);
    }
    if (geom.type === 'MultiPolygon') {
      const firstPoly = geom.coordinates?.[0]?.[0] as number[][] | undefined;
      if (!firstPoly) return null;
      return getRingCentroid(firstPoly);
    }
    return null;
  }

  const filtered = useMemo(() => {
    const features = (orchards as any).features as any[];
    return features.filter((f) => {
      const p = f.properties;
      if (filters.region && p.region !== filters.region) return false;
      if (filters.municipality && p.municipality !== filters.municipality) return false;
      if (filters.crop && p.crop !== filters.crop) return false;
      if (filters.irrigation !== undefined && Boolean(p.irrigation?.has) !== filters.irrigation) return false;
      if (p.age_years < filters.ageRange[0] || p.age_years > filters.ageRange[1]) return false;
      if ((p.area_ha ?? 0) < filters.areaRangeHa[0] || (p.area_ha ?? 0) > filters.areaRangeHa[1]) return false;
      if (p.score < filters.scoreRange[0] || p.score > filters.scoreRange[1]) return false;
      const lab = filters.lab || {} as any;
      if (lab.ph && (p.soil?.ph ?? 0) < lab.ph[0] || lab.ph && (p.soil?.ph ?? 0) > lab.ph[1]) return false;
      if (lab.n && (p.soil?.n ?? 0) < lab.n[0] || lab.n && (p.soil?.n ?? 0) > lab.n[1]) return false;
      if (lab.p && (p.soil?.p ?? 0) < lab.p[0] || lab.p && (p.soil?.p ?? 0) > lab.p[1]) return false;
      if (lab.k && (p.soil?.k ?? 0) < lab.k[0] || lab.k && (p.soil?.k ?? 0) > lab.k[1]) return false;
      // Diseases and insects: if any are checked, include features that match at least one checked condition.
      const anyDiseaseChecked = Object.values(filters.diseases || {}).some(Boolean);
      if (anyDiseaseChecked) {
        const flags: string[] = p.flags || [];
        const diseaseToFlag: Record<string,string> = {
          alternaria_alternata: 'disease_alternaria',
          verticillium_dahliae: 'disease_verticillium',
          colletotrichum_acutatum: 'disease_anthracnose',
        };
        const match = Object.entries(filters.diseases).some(([k, v]) => v && flags.includes((diseaseToFlag as any)[k]));
        if (!match) return false;
      }
      const anyInsectChecked = Object.values(filters.insects || {}).some(Boolean);
      if (anyInsectChecked) {
        const flags: string[] = p.flags || [];
        const insectToFlag: Record<string,string> = {
          myzus_persicae: 'insect_green_aphid',
          cydia_pomonella: 'insect_codling_moth',
          tetranychus_urticae: 'insect_spider_mite',
        };
        const match = Object.entries(filters.insects).some(([k, v]) => v && flags.includes((insectToFlag as any)[k]));
        if (!match) return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <div className="w-full h-full relative">
      <MapContainer className="w-full h-full" zoom={8} center={[42.0, 43.5]}>
        <ZoomListener onZoom={setZoom} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {toggles.showAdmin && (
          <GeoJSON key={`admin-${toggles.showAdmin}`} data={boundaries as any} style={{ color: '#64748b', weight: 1, fill: false }} />
        )}
        {toggles.showOrchards && zoom >= 10 && (
          <GeoJSON
            key={`orchards-${filters.region||'all'}-${filters.municipality||'all'}-${filters.crop||'all'}-${String(filters.irrigation)}-${filters.ageRange.join('-')}-${filters.scoreRange.join('-')}-${toggles.showNdvi}`}
            data={{ type: 'FeatureCollection', features: filtered } as any}
            style={(feature: any) => ({
              color: '#111827',
              weight: 1,
              fillColor: toggles.showNdvi
                ? getNdviColor(feature?.properties?.indices?.ndvi_mean ?? 0)
                : getColor(feature?.properties?.score ?? 0),
              fillOpacity: 0.6,
            })}
            onEachFeature={(feature: any, layer: any) => {
              const p = feature.properties;
              layer.bindTooltip(`${p.crop} • ${p.area_ha} ${t('unit.ha')} • ${t('orchard.score')}: ${p.score}`);
              layer.on('click', () => setUI({ selectedOrchardId: p.orchard_id, showRightPanel: true }));
            }}
          />
        )}
        {toggles.showOrchards && zoom < 10 && (
          <>
            {filtered.map((f: any) => {
              const p = f.properties;
              const center = polygonCentroid(f);
              if (!center) return null;
              const radius = Math.max(5, Math.min(12, Math.sqrt(Math.max(1, p.area_ha))));
              const fill = toggles.showNdvi ? getNdviColor(p.indices?.ndvi_mean ?? 0) : getColor(p.score ?? 0);
              return (
                <CircleMarker
                  key={p.orchard_id}
                  center={center}
                  radius={radius}
                  pathOptions={{ color: '#111827', weight: 1, fillColor: fill, fillOpacity: 0.8 }}
                  eventHandlers={{ click: () => setUI({ selectedOrchardId: p.orchard_id, showRightPanel: true }) }}
                />
              );
            })}
          </>
        )}
        <FitBounds data={boundaries as any} />
      </MapContainer>
      {zoom < 10 && (
        <div className="absolute bottom-3 left-3 z-[400] bg-white/90 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700">
          {t('map.zoomHint')}
        </div>
      )}
    </div>
  );
};

export default Map;


