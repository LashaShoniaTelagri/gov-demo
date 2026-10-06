import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import type { FieldVisitCase, Parcel } from '../lib/fieldVisitCases';
import { GOOGLE_SAT_ATTRIBUTION, googleSatelliteUrl } from '../lib/mapTiles';

interface FieldVisitMapProps {
  mapConfig: FieldVisitCase['map'];
  selectedParcel: Parcel | null;
  matchedCode: string | null;
}

// The searched parcel gets a prominent boundary/fill; the other parcels of the
// same orchard stay visible with a lighter, dashed outline.
const SEARCHED_STYLE: L.PathOptions = {
  color: '#f59e0b', // amber-500
  weight: 4,
  fillColor: '#f59e0b',
  fillOpacity: 0.35,
  interactive: false,
};
const OTHER_STYLE: L.PathOptions = {
  color: '#facc15', // amber-400
  weight: 2,
  fillColor: '#facc15',
  fillOpacity: 0.1,
  dashArray: '4',
  interactive: false,
};

// Country-level view shown before any parcel is searched (matches the
// monitoring map's Georgia framing).
const GEORGIA_CENTER: L.LatLngExpression = [42.0, 43.5];
const GEORGIA_ZOOM = 7;

// Imperative leaflet map (same pattern as FieldsMap.tsx): Google satellite base
// + the GIS team's orthophoto image overlays + the searched orchard's parcels.
// Parcels are drawn only once a search selects an orchard, and the map zooms to
// fit all of them.
const FieldVisitMap: React.FC<FieldVisitMapProps> = ({ mapConfig, selectedParcel, matchedCode }) => {
  const { i18n } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const parcelsRef = useRef<L.LayerGroup | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);

  // Init map once.
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('field-visit-map', { zoomControl: true });
      map.setView(GEORGIA_CENTER, GEORGIA_ZOOM);
      tileRef.current = L.tileLayer(googleSatelliteUrl(i18n.language), {
        subdomains: ['0', '1', '2', '3'],
        attribution: GOOGLE_SAT_ATTRIBUTION,
        maxZoom: 22,
        maxNativeZoom: 20,
      }).addTo(map);
      mapConfig.orthos.forEach((ortho) => {
        L.imageOverlay(ortho.url, ortho.bounds, { opacity: 1 }).addTo(map);
      });
      parcelsRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        parcelsRef.current = null;
        tileRef.current = null;
      }
    };
    // mapConfig is stable per case (component remounts on case change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow the interface language for map labels.
  useEffect(() => {
    tileRef.current?.setUrl(googleSatelliteUrl(i18n.language));
  }, [i18n.language]);

  // Draw / clear the orchard's parcels and zoom to fit them on selection change.
  useEffect(() => {
    const map = mapRef.current;
    const group = parcelsRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (selectedParcel) {
      selectedParcel.parcels.forEach((p) => {
        const style = p.cadastralCode === matchedCode ? SEARCHED_STYLE : OTHER_STYLE;
        L.polygon(p.ringLatLng, style).addTo(group);
      });
      const bounds = (group.getLayers() as L.Polygon[]).reduce(
        (acc, layer) => acc.extend(layer.getBounds()),
        L.latLngBounds([]),
      );
      map.flyToBounds(bounds, { padding: [40, 40], duration: 2 });
    } else {
      map.flyTo(GEORGIA_CENTER, GEORGIA_ZOOM, { duration: 1.5 });
    }
  }, [selectedParcel, matchedCode]);

  return <div id="field-visit-map" className="w-full h-full" />;
};

export default FieldVisitMap;
