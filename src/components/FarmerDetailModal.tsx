import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Farmer } from './PortfolioMap';

interface FarmerDetailModalProps {
  farmer: Farmer;
  onClose: () => void;
}

interface RiskIndicator {
  key: string;
  label: string;
  status: 'high' | 'observation' | 'controlled';
}

const FarmerDetailModal: React.FC<FarmerDetailModalProps> = ({ farmer, onClose }) => {
  const { t } = useTranslation();

  // Mock risk indicators based on farmer's overall risk status
  const getRiskIndicators = (): RiskIndicator[] => {
    if (farmer.riskStatus === 'high') {
      return [
        { key: 'weakPlants', label: t('farmerDetail.weakPlants'), status: 'high' },
        { key: 'driedPlants', label: t('farmerDetail.driedPlants'), status: 'high' },
        { key: 'missingPlants', label: t('farmerDetail.missingPlants'), status: 'controlled' },
        { key: 'vegetationIndex', label: t('farmerDetail.vegetationIndex'), status: 'high' },
        { key: 'waterUniformity', label: t('farmerDetail.waterUniformity'), status: 'high' },
        { key: 'waterDeficiency', label: t('farmerDetail.waterDeficiency'), status: 'controlled' },
        { key: 'excessiveWater', label: t('farmerDetail.excessiveWater'), status: 'controlled' },
        { key: 'weedIssues', label: t('farmerDetail.weedIssues'), status: 'observation' },
        { key: 'hailArea', label: t('farmerDetail.hailArea'), status: 'controlled' },
        { key: 'highWindZone', label: t('farmerDetail.highWindZone'), status: 'observation' },
        { key: 'excessRainfall', label: t('farmerDetail.excessRainfall'), status: 'controlled' },
        { key: 'droughtArea', label: t('farmerDetail.droughtArea'), status: 'controlled' },
        { key: 'frostArea', label: t('farmerDetail.frostArea'), status: 'high' },
      ];
    } else if (farmer.riskStatus === 'observation') {
      return [
        { key: 'weakPlants', label: t('farmerDetail.weakPlants'), status: 'observation' },
        { key: 'driedPlants', label: t('farmerDetail.driedPlants'), status: 'controlled' },
        { key: 'missingPlants', label: t('farmerDetail.missingPlants'), status: 'controlled' },
        { key: 'vegetationIndex', label: t('farmerDetail.vegetationIndex'), status: 'high' },
        { key: 'waterUniformity', label: t('farmerDetail.waterUniformity'), status: 'controlled' },
        { key: 'waterDeficiency', label: t('farmerDetail.waterDeficiency'), status: 'controlled' },
        { key: 'excessiveWater', label: t('farmerDetail.excessiveWater'), status: 'controlled' },
        { key: 'weedIssues', label: t('farmerDetail.weedIssues'), status: 'observation' },
        { key: 'hailArea', label: t('farmerDetail.hailArea'), status: 'controlled' },
        { key: 'highWindZone', label: t('farmerDetail.highWindZone'), status: 'observation' },
        { key: 'excessRainfall', label: t('farmerDetail.excessRainfall'), status: 'controlled' },
        { key: 'droughtArea', label: t('farmerDetail.droughtArea'), status: 'controlled' },
        { key: 'frostArea', label: t('farmerDetail.frostArea'), status: 'high' },
      ];
    } else {
      return [
        { key: 'weakPlants', label: t('farmerDetail.weakPlants'), status: 'controlled' },
        { key: 'driedPlants', label: t('farmerDetail.driedPlants'), status: 'observation' },
        { key: 'missingPlants', label: t('farmerDetail.missingPlants'), status: 'controlled' },
        { key: 'vegetationIndex', label: t('farmerDetail.vegetationIndex'), status: 'controlled' },
        { key: 'waterUniformity', label: t('farmerDetail.waterUniformity'), status: 'controlled' },
        { key: 'waterDeficiency', label: t('farmerDetail.waterDeficiency'), status: 'controlled' },
        { key: 'excessiveWater', label: t('farmerDetail.excessiveWater'), status: 'controlled' },
        { key: 'weedIssues', label: t('farmerDetail.weedIssues'), status: 'controlled' },
        { key: 'hailArea', label: t('farmerDetail.hailArea'), status: 'controlled' },
        { key: 'highWindZone', label: t('farmerDetail.highWindZone'), status: 'observation' },
        { key: 'excessRainfall', label: t('farmerDetail.excessRainfall'), status: 'controlled' },
        { key: 'droughtArea', label: t('farmerDetail.droughtArea'), status: 'high' },
        { key: 'frostArea', label: t('farmerDetail.frostArea'), status: 'controlled' },
      ];
    }
  };

  const getStatusColor = (status: 'high' | 'observation' | 'controlled') => {
    switch (status) {
      case 'high':
        return 'bg-red-500';
      case 'observation':
        return 'bg-yellow-400';
      case 'controlled':
        return 'bg-green-500';
    }
  };

  const getHeaderColor = () => {
    switch (farmer.riskStatus) {
      case 'high':
        return 'bg-red-500';
      case 'observation':
        return 'bg-yellow-400';
      case 'controlled':
        return 'bg-green-500';
    }
  };

  const getHeaderText = () => {
    switch (farmer.riskStatus) {
      case 'high':
        return t('portfolio.highRisk').toUpperCase();
      case 'observation':
        return t('farmerDetail.needObservation').toUpperCase();
      case 'controlled':
        return t('farmerDetail.underControl').toUpperCase();
    }
  };

  const indicators = getRiskIndicators();

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with risk status color */}
        <div className={`${getHeaderColor()} text-white px-6 py-4 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold">{getHeaderText()}</h2>
        </div>

        {/* Farmer Info */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{farmer.company}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">{t('portfolio.farmersList.crop')}:</span>
              <span className="ml-2 font-medium text-gray-800">{farmer.crop}</span>
            </div>
            <div>
              <span className="text-gray-600">{t('portfolio.farmersList.area')}:</span>
              <span className="ml-2 font-medium text-gray-800">{farmer.area.toFixed(1)} ha</span>
            </div>
            <div>
              <span className="text-gray-600">{t('portfolio.farmersList.region')}:</span>
              <span className="ml-2 font-medium text-gray-800">{farmer.region}</span>
            </div>
            <div>
              <span className="text-gray-600">{t('portfolio.farmersList.municipality')}:</span>
              <span className="ml-2 font-medium text-gray-800">{farmer.municipality}</span>
            </div>
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            {indicators.map((indicator, index) => (
              <div
                key={indicator.key}
                className="flex items-center justify-between py-3 px-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <span className="text-sm font-medium text-gray-800 flex-1">
                  {indicator.label}
                </span>
                <div className={`w-8 h-8 ${getStatusColor(indicator.status)} rounded`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <span className="font-medium text-gray-700">{t('portfolio.highRisk')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-400 rounded"></div>
              <span className="font-medium text-gray-700">{t('portfolio.needsObservation')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              <span className="font-medium text-gray-700">{t('portfolio.underControl')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDetailModal;







