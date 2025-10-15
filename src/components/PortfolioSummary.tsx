import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import farmersData from '../data/farmers-v2.json';
import { translateCrop, translateRegion } from '../lib/regionTranslations';

interface Farmer {
  id: string;
  portfolio: string;
  crop: string;
  region: string;
  area: number;
  loanAmount?: number;
}

interface PortfolioSummaryProps {
  portfolioFilter?: 'cb' | 'sme' | 'all';
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolioFilter = 'all' }) => {
  const { t, i18n } = useTranslation();

  // Calculate data dynamically from farmers-v2.json
  const data = useMemo(() => {
    const farmers = farmersData as Farmer[];
    
    // Filter by portfolio
    const filteredFarmers = farmers.filter(farmer => {
      if (portfolioFilter === 'all') return true;
      return farmer.portfolio.toLowerCase() === portfolioFilter;
    });

    // Calculate statistics
    const totalUsers = filteredFarmers.length;
    const smeUsers = farmers.filter(f => f.portfolio.toLowerCase() === 'sme').length;
    const cbUsers = farmers.filter(f => f.portfolio.toLowerCase() === 'cb').length;
    
    // Get unique crops list
    const uniqueCrops = Array.from(new Set(filteredFarmers.map(f => f.crop))).sort();
    const cropsCount = uniqueCrops.length;
    
    // Get unique regions list
    const uniqueRegions = Array.from(new Set(filteredFarmers.map(f => f.region))).sort();
    const regionsCount = uniqueRegions.length;
    
    // Calculate total area
    const totalArea = filteredFarmers.reduce((sum, f) => sum + f.area, 0);

    // Calculate total loan amount
    const totalLoan = filteredFarmers.reduce((sum, f) => sum + (f.loanAmount || 0), 0);

    return {
      totalUsers,
      sme: smeUsers,
      cb: cbUsers,
      crops: cropsCount,
      cropsList: uniqueCrops,
      regions: regionsCount,
      regionsList: uniqueRegions,
      area: totalArea,
      totalLoan,
    };
  }, [portfolioFilter]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-3">
      <div className="grid grid-cols-12 gap-2">
        {/* Total Users */}
        <div className="col-span-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">{t('executive.totalUsers')}</h3>
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="text-xl font-bold text-blue-900 mb-1">{data.totalUsers.toLocaleString()}</div>
          {portfolioFilter === 'all' && (
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-gray-600">SME:</span>
                <span className="font-semibold text-gray-800">{data.sme}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-600">CB:</span>
                <span className="font-semibold text-gray-800">{data.cb}</span>
              </div>
            </div>
          )}
        </div>

        {/* Crops */}
        <div className="col-span-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[10px] font-semibold text-green-700 uppercase tracking-wide">{t('executive.crops')}</h3>
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 256 256">
                <path d="M223.45,40.07a8,8,0,0,0-7.52-7.52C139.8,28.08,78.82,51,52.82,94a87.09,87.09,0,0,0-12.76,49c.57,15.92,5.21,32,13.79,47.85l-19.51,19.5a8,8,0,0,0,11.32,11.32l19.5-19.51C81,210.73,97.09,215.37,113,215.94q1.67.06,3.33.06A86.93,86.93,0,0,0,162,203.18C205,177.18,227.93,116.21,223.45,40.07ZM153.75,189.5c-22.75,13.78-49.68,14-76.71.77l88.63-88.62a8,8,0,0,0-11.32-11.32L65.73,179c-13.19-27-13-54,.77-76.71,22.09-36.47,74.6-56.44,141.31-54.06C210.2,114.89,190.22,167.41,153.75,189.5Z"></path>
              </svg>
            </div>
          </div>
          <div className="text-xl font-bold text-green-900 mb-1">{data.crops}</div>
          <div className="flex flex-wrap gap-1">
            {data.cropsList.slice(0, 2).map((crop, index) => (
              <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-200 text-green-800">
                {translateCrop(crop, i18n.language)}
              </span>
            ))}
            {data.cropsList.length > 2 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-200 text-green-800">
                +{data.cropsList.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Regions */}
        <div className="col-span-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[10px] font-semibold text-purple-700 uppercase tracking-wide">{t('executive.regions')}</h3>
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="text-xl font-bold text-purple-900 mb-1">{data.regions}</div>
          <div className="flex flex-wrap gap-1">
            {data.regionsList.slice(0, 2).map((region, index) => (
              <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-200 text-purple-800">
                {translateRegion(region, i18n.language)}
              </span>
            ))}
            {data.regionsList.length > 2 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-200 text-purple-800">
                +{data.regionsList.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Total Area */}
        <div className="col-span-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[10px] font-semibold text-orange-700 uppercase tracking-wide">{t('executive.totalArea')}</h3>
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-orange-900">{data.area.toLocaleString()}</span>
            <span className="text-xs font-medium text-orange-700">ha</span>
          </div>
        </div>

        {/* Total Loan Amount */}
        <div className="col-span-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">{t('executive.totalLoanAmount')}</h3>
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <span className="text-sm" role="img" aria-label="money">💰</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-amber-900">₾{data.totalLoan.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;

