import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import farmersData from '../data/farmers-v2.json';
import type { Farmer } from './PortfolioMap';

interface QualityRiskOverviewProps {
  portfolioFilter?: 'cb' | 'sme' | 'all';
}

// Helper function to get filtered farmers
const useFilteredFarmers = (portfolioFilter: 'cb' | 'sme' | 'all') => {
  return useMemo(() => {
    const farmers = farmersData as Farmer[];
    if (portfolioFilter === 'all') return farmers;
    return farmers.filter(f => f.portfolio.toLowerCase() === portfolioFilter);
  }, [portfolioFilter]);
};

// Risk Status Component
export const RiskStatus: React.FC<QualityRiskOverviewProps> = ({ portfolioFilter = 'all' }) => {
  const { t } = useTranslation();
  const filteredFarmers = useFilteredFarmers(portfolioFilter);

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

  return (
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
  );
};

// Monitoring Component
export const Monitoring: React.FC<QualityRiskOverviewProps> = ({ portfolioFilter = 'all' }) => {
  const { t } = useTranslation();
  const filteredFarmers = useFilteredFarmers(portfolioFilter);

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

  return (
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
  );
};

// Default export (for backward compatibility)
const QualityRiskOverview: React.FC<QualityRiskOverviewProps> = ({ portfolioFilter = 'all' }) => {
  return (
    <>
      <RiskStatus portfolioFilter={portfolioFilter} />
      <Monitoring portfolioFilter={portfolioFilter} />
    </>
  );
};

export default QualityRiskOverview;

