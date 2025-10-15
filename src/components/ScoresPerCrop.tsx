import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import farmersData from '../data/farmers-v2.json';
import type { Farmer } from './PortfolioMap';

interface ScoresPerCropProps {
  portfolioFilter?: 'cb' | 'sme' | 'all';
}

const ScoresPerCrop: React.FC<ScoresPerCropProps> = ({ portfolioFilter = 'all' }) => {
  const { t, i18n } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState<string>('all');

  // Filter farmers based on portfolio
  const filteredFarmers = useMemo(() => {
    const farmers = farmersData as Farmer[];
    if (portfolioFilter === 'all') return farmers;
    return farmers.filter(f => f.portfolio.toLowerCase() === portfolioFilter);
  }, [portfolioFilter]);

  // Crop scores data
  const cropScoresData = useMemo(() => {
    const checkedFarmers = filteredFarmers.filter(f => f.checkupStatus === 'checked' && f.score);
    
    // Get unique crops
    const crops = [...new Set(checkedFarmers.map(f => f.crop))];
    
    return crops.map(crop => {
      const cropFarmers = checkedFarmers.filter(f => f.crop === crop);
      const avgScore = cropFarmers.length > 0 
        ? (cropFarmers.reduce((sum, f) => sum + (f.score || 0), 0) / cropFarmers.length).toFixed(1)
        : '0.0';
      
      return {
        crop,
        count: cropFarmers.length,
        avgScore: parseFloat(avgScore)
      };
    }).sort((a, b) => b.avgScore - a.avgScore);
  }, [filteredFarmers]);

  // Get filtered crop scores based on selected crop
  const selectedCropData = useMemo(() => {
    if (selectedCrop === 'all') return null;
    
    const checkedFarmers = filteredFarmers.filter(
      f => f.checkupStatus === 'checked' && f.score && f.crop === selectedCrop
    );
    
    if (checkedFarmers.length === 0) return null;
    
    const avgScore = (checkedFarmers.reduce((sum, f) => sum + (f.score || 0), 0) / checkedFarmers.length).toFixed(1);
    
    return {
      crop: selectedCrop,
      count: checkedFarmers.length,
      avgScore: parseFloat(avgScore)
    };
  }, [filteredFarmers, selectedCrop]);

  const translateCrop = (crop: string) => {
    const cropTranslations: Record<string, string> = {
      'ნუში': 'Almond',
      'ვაშლი': 'Apple',
      'მსხალი': 'Pear',
      'ატამი': 'Persimmon',
      'ალუბალი': 'Sour Cherry',
      'ბალი': 'Cherry',
      'ვენახი': 'Grape',
      'ალუჩა': 'Cherry Plum',
      'ქლიავი': 'Plum',
      'მოცვი': 'Blueberry',
      'კივი': 'Kiwi',
    };
    
    if (i18n.language === 'en' && cropTranslations[crop]) {
      return cropTranslations[crop];
    }
    return crop;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{t('executive.scoresPerCrop')}</h3>
      
      {/* Crop Selector */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-2">{t('executive.selectCrop')}</label>
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        >
          <option value="all">{t('executive.allCrops')}</option>
          {cropScoresData.map(item => (
            <option key={item.crop} value={item.crop}>
              {translateCrop(item.crop)}
            </option>
          ))}
        </select>
      </div>

      {/* Display selected crop data or all crops */}
      {selectedCrop === 'all' ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {cropScoresData.map((item) => (
            <div key={item.crop} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{translateCrop(item.crop)}</span>
                <span className="text-xs text-gray-500">{item.count} {t('executive.farmers')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(item.avgScore / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 min-w-[3rem] text-right">
                  {item.avgScore}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : selectedCropData ? (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-indigo-200">
          <div className="text-center mb-4">
            <h4 className="text-xl font-bold text-indigo-900 mb-1">{translateCrop(selectedCropData.crop)}</h4>
            <p className="text-sm text-indigo-600">{selectedCropData.count} {t('executive.checkedFarmers')}</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-indigo-700 mb-2">{t('executive.averageScore')}</p>
              <div className="text-5xl font-bold text-indigo-900">{selectedCropData.avgScore}</div>
              <div className="mt-2 text-xs text-indigo-600">{t('executive.outOf10')}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {t('executive.noCheckedFarmers')}
        </div>
      )}
    </div>
  );
};

export default ScoresPerCrop;

