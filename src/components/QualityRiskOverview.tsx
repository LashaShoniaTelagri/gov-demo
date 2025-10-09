import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import farmersData from '../data/farmers-v2.json';
import type { Farmer } from './PortfolioMap';

interface QualityRiskOverviewProps {
  portfolioFilter?: 'cb' | 'sme' | 'all';
}

const QualityRiskOverview: React.FC<QualityRiskOverviewProps> = ({ portfolioFilter = 'all' }) => {
  const { t, i18n } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState<string>('all');

  // Filter farmers based on portfolio
  const filteredFarmers = useMemo(() => {
    const farmers = farmersData as Farmer[];
    if (portfolioFilter === 'all') return farmers;
    return farmers.filter(f => f.portfolio.toLowerCase() === portfolioFilter);
  }, [portfolioFilter]);

  // Chart #1: Risk Status
  const riskStatusData = useMemo(() => {
    const high = filteredFarmers.filter(f => f.riskStatus === 'high').length;
    const observation = filteredFarmers.filter(f => f.riskStatus === 'observation').length;
    const controlled = filteredFarmers.filter(f => f.riskStatus === 'controlled').length;
    const total = filteredFarmers.length;

    return {
      high: { count: high, percentage: ((high / total) * 100).toFixed(1) },
      observation: { count: observation, percentage: ((observation / total) * 100).toFixed(1) },
      controlled: { count: controlled, percentage: ((controlled / total) * 100).toFixed(1) },
    };
  }, [filteredFarmers]);

  // Chart #2: Check Up Status with Average Score
  const checkUpStatusData = useMemo(() => {
    const checked = filteredFarmers.filter(f => f.checkupStatus === 'checked');
    const notChecked = filteredFarmers.filter(f => f.checkupStatus === 'not_checked').length;
    const inProgress = filteredFarmers.filter(f => f.checkupStatus === 'in_progress').length;
    const total = filteredFarmers.length;

    // Calculate average score for checked farmers
    const scoresSum = checked.reduce((sum, f) => sum + (f.score || 0), 0);
    const avgScore = checked.length > 0 ? (scoresSum / checked.length).toFixed(1) : '0.0';

    return {
      checked: { 
        count: checked.length, 
        percentage: ((checked.length / total) * 100).toFixed(1),
        avgScore 
      },
      notChecked: { count: notChecked, percentage: ((notChecked / total) * 100).toFixed(1) },
      inProgress: { count: inProgress, percentage: ((inProgress / total) * 100).toFixed(1) },
    };
  }, [filteredFarmers]);

  // Chart #3: Checked-Up Farmers' Scores per Crop
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart #1: Risk Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">{t('executive.riskStatus')}</h3>
        <div className="space-y-4">
          {/* High Risk */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{t('portfolio.highRisk')}</span>
              <span className="text-sm font-bold text-gray-900">
                {riskStatusData.high.count} ({riskStatusData.high.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${riskStatusData.high.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Needs Observation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{t('portfolio.needsObservation')}</span>
              <span className="text-sm font-bold text-gray-900">
                {riskStatusData.observation.count} ({riskStatusData.observation.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${riskStatusData.observation.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Under Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{t('portfolio.underControl')}</span>
              <span className="text-sm font-bold text-gray-900">
                {riskStatusData.controlled.count} ({riskStatusData.controlled.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${riskStatusData.controlled.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart #2: Check Up Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">{t('executive.checkUpStatus')}</h3>
        <div className="space-y-4">
          {/* Checked with Average Score */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">✅ {t('executive.checked')}</span>
              <span className="text-sm font-bold text-green-900">
                {checkUpStatusData.checked.count} ({checkUpStatusData.checked.percentage}%)
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-green-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-green-700">{t('executive.averageScore')}:</span>
                <span className="text-2xl font-bold text-green-900">{checkUpStatusData.checked.avgScore}</span>
              </div>
            </div>
          </div>

          {/* Not Checked */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">❌ {t('executive.notChecked')}</span>
              <span className="text-sm font-bold text-gray-900">
                {checkUpStatusData.notChecked.count} ({checkUpStatusData.notChecked.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gray-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${checkUpStatusData.notChecked.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* In Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">⌛ {t('executive.inProgress')}</span>
              <span className="text-sm font-bold text-gray-900">
                {checkUpStatusData.inProgress.count} ({checkUpStatusData.inProgress.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${checkUpStatusData.inProgress.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart #3: Checked-Up Farmers' Scores per Crop */}
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
    </div>
  );
};

export default QualityRiskOverview;

