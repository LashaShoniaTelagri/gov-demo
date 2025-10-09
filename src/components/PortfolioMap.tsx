import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

export interface Farmer {
  id: string;
  name: string;
  surname: string;
  nameEn: string;
  surnameEn: string;
  portfolio: string;
  riskStatus: 'high' | 'observation' | 'controlled';
  crop: string;
  area: number;
  loanAmount: number;
  region: string;
  municipality: string;
  lat: number;
  lng: number;
  checkupStatus?: 'checked' | 'not_checked' | 'in_progress';
  score?: number;
}

interface PortfolioMapProps {
  farmers: Farmer[];
  selectedFarmerId?: string;
  onFarmerSelect: (farmerId: string) => void;
  mapId?: string;
}

const PortfolioMap: React.FC<PortfolioMapProps> = ({
  farmers,
  selectedFarmerId,
  onFarmerSelect,
  mapId = 'portfolio-map',
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});
  const { t, i18n } = useTranslation();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map(mapId, {
        center: [42.0, 43.5], // Center of Georgia
        zoom: 7,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Add glow effect CSS for high-risk markers
      const style = document.createElement('style');
      style.textContent = `
        .high-risk-marker {
          filter: drop-shadow(0 0 3px rgba(239, 68, 68, 0.8)) drop-shadow(0 0 6px rgba(239, 68, 68, 0.4));
        }
      `;
      document.head.appendChild(style);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when farmers change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add new markers
    farmers.forEach((farmer) => {
      const isSelected = farmer.id === selectedFarmerId;
      const isHighRisk = farmer.riskStatus === 'high';
      
      // Determine color based on risk status
      const colors = {
        high: '#ef4444',
        observation: '#fbbf24',
        controlled: '#10b981',
      };
      const color = colors[farmer.riskStatus];

      // Smaller, more accurate radius with visual distinction for high risk
      const baseRadius = isHighRisk ? 5 : 4;
      const radius = isSelected ? baseRadius * 1.5 : baseRadius;

      // Create circle marker
      const marker = L.circleMarker([farmer.lat, farmer.lng], {
        radius: radius,
        fillColor: color,
        color: isHighRisk ? '#dc2626' : '#ffffff', // Darker red border for high risk
        weight: isHighRisk ? 2.5 : (isSelected ? 2 : 1.5),
        opacity: 1,
        fillOpacity: isSelected ? 1 : (isHighRisk ? 0.95 : 0.85),
        className: isHighRisk ? 'high-risk-marker' : '',
      });

      // Add tooltip
      const farmerName = i18n.language === 'ka' 
        ? `${farmer.name} ${farmer.surname}`
        : `${farmer.nameEn} ${farmer.surnameEn}`;
      
      marker.bindTooltip(
        `<div class="text-sm">
          <strong>${farmerName}</strong><br/>
          ${farmer.crop} • ${farmer.area.toFixed(1)} ha<br/>
          ₾${(farmer.loanAmount / 1000).toFixed(0)}K
        </div>`,
        {
          direction: 'top',
          offset: [0, -10],
        }
      );

      // Add click handler
      marker.on('click', () => {
        onFarmerSelect(farmer.id);
      });

      // Add hover effect
      marker.on('mouseover', function() {
        this.setStyle({
          fillOpacity: 1,
          weight: 3,
        });
      });

      marker.on('mouseout', function() {
        if (farmer.id !== selectedFarmerId) {
          this.setStyle({
            fillOpacity: 0.8,
            weight: 2,
          });
        }
      });

      marker.addTo(mapRef.current!);
      markersRef.current[farmer.id] = marker;
    });
  }, [farmers, selectedFarmerId, onFarmerSelect, i18n.language]);

  // Pan to selected farmer
  useEffect(() => {
    if (selectedFarmerId && mapRef.current) {
      const farmer = farmers.find((f) => f.id === selectedFarmerId);
      if (farmer) {
        mapRef.current.setView([farmer.lat, farmer.lng], 10, {
          animate: true,
          duration: 0.5,
        });
      }
    }
  }, [selectedFarmerId, farmers]);

  return (
    <div className="relative w-full h-full">
      <div id={mapId} className="w-full h-full rounded-lg" />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="text-xs font-semibold text-gray-700 mb-2">{t('map.riskStatus')}</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>
            <span className="text-xs text-gray-600">{t('map.highRisk')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-white"></div>
            <span className="text-xs text-gray-600">{t('map.needsObservation')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
            <span className="text-xs text-gray-600">{t('map.underControl')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioMap;
