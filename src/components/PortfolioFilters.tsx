import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateRegion, translateMunicipality } from '../lib/regionTranslations';

export interface PortfolioFiltersState {
  crop?: string;
  areaRange: [number, number];
  loanRange: [number, number];
  region?: string;
  municipality?: string;
  checkupStatus?: string;
}

interface PortfolioFiltersProps {
  filters: PortfolioFiltersState;
  onFiltersChange: (filters: PortfolioFiltersState) => void;
  availableOptions: {
    crops: string[];
    regions: string[];
    municipalities: string[];
  };
}

const PortfolioFilters: React.FC<PortfolioFiltersProps> = ({
  filters,
  onFiltersChange,
  availableOptions,
}) => {
  const { t, i18n } = useTranslation();
  const [areaMinInput, setAreaMinInput] = useState(filters.areaRange[0].toString());
  const [areaMaxInput, setAreaMaxInput] = useState(filters.areaRange[1].toString());
  const [loanMinInput, setLoanMinInput] = useState(filters.loanRange[0].toString());
  const [loanMaxInput, setLoanMaxInput] = useState(filters.loanRange[1].toString());

  const handleFilterChange = (newFilters: Partial<PortfolioFiltersState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    onFiltersChange(updatedFilters);
  };

  const handleReset = () => {
    const resetFilters: PortfolioFiltersState = {
      areaRange: [0, 350],
      loanRange: [0, 5500000],
    };
    setAreaMinInput('0');
    setAreaMaxInput('350');
    setLoanMinInput('0');
    setLoanMaxInput('5500000');
    onFiltersChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 space-y-3">
      {/* Header */}
      <div className="border-b border-gray-200 pb-2">
        <h2 className="text-base font-bold text-orange-500 uppercase tracking-wide">
          {t('portfolio.filters.title')}
        </h2>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-xs font-medium text-orange-500 mb-1.5 lowercase">
          {t('portfolio.filters.checkupStatus')}
        </label>
        <div className="relative">
          <select
            value={filters.checkupStatus || ''}
            onChange={(e) => handleFilterChange({ checkupStatus: e.target.value || undefined })}
            className="w-full px-2 py-1.5 pr-8 text-sm border-2 border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25rem 1.25rem',
              appearance: 'none'
            }}
          >
            <option value="">{t('portfolio.filters.statusAll')}</option>
            <option value="checked">{t('portfolio.filters.statusChecked')}</option>
            <option value="not_checked">{t('portfolio.filters.statusNotChecked')}</option>
            <option value="in_progress">{t('portfolio.filters.statusInProgress')}</option>
          </select>
        </div>
      </div>

      {/* Crop Filter */}
      <div>
        <label className="block text-xs font-medium text-orange-500 mb-1.5 lowercase">
          {t('portfolio.filters.crop')}
        </label>
        <div className="relative">
          <select
            value={filters.crop || ''}
            onChange={(e) => handleFilterChange({ crop: e.target.value || undefined })}
            className="w-full px-2 py-1.5 pr-8 text-sm border-2 border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25rem 1.25rem',
              appearance: 'none'
            }}
          >
            <option value="">{t('portfolio.filters.all')}</option>
            {availableOptions.crops.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Area Filter */}
      <div>
        <label className="block text-xs font-medium text-orange-500 mb-1.5 lowercase">
          {t('portfolio.filters.area')} (ha)
        </label>
        <div className="flex gap-1.5">
          <div className="flex-1">
            <label className="block text-[10px] text-gray-500 mb-0.5">Min</label>
            <input
              type="text"
              value={areaMinInput}
              onChange={(e) => setAreaMinInput(e.target.value)}
              onBlur={(e) => {
                const value = parseFloat(e.target.value);
                const finalValue = isNaN(value) || value < 0 ? 0 : value;
                setAreaMinInput(finalValue.toString());
                handleFilterChange({
                  areaRange: [finalValue, filters.areaRange[1]],
                });
              }}
              className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] text-gray-500 mb-0.5">Max</label>
            <input
              type="text"
              value={areaMaxInput}
              onChange={(e) => setAreaMaxInput(e.target.value)}
              onBlur={(e) => {
                const value = parseFloat(e.target.value);
                const finalValue = isNaN(value) || value < 0 ? 350 : value;
                setAreaMaxInput(finalValue.toString());
                handleFilterChange({
                  areaRange: [filters.areaRange[0], finalValue],
                });
              }}
              className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Loan Filter */}
      <div>
        <label className="block text-xs font-medium text-orange-500 mb-1.5 lowercase">
          {t('portfolio.filters.loan')} (₾)
        </label>
        <div className="flex gap-1.5">
          <div className="flex-1">
            <label className="block text-[10px] text-gray-500 mb-0.5">Min</label>
            <input
              type="text"
              value={loanMinInput}
              onChange={(e) => setLoanMinInput(e.target.value.replace(/\D/g, ''))}
              onBlur={(e) => {
                const value = parseInt(e.target.value.replace(/\D/g, ''));
                const finalValue = isNaN(value) || value < 0 ? 0 : value;
                setLoanMinInput(finalValue.toString());
                handleFilterChange({
                  loanRange: [finalValue, filters.loanRange[1]],
                });
              }}
              className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] text-gray-500 mb-0.5">Max</label>
            <input
              type="text"
              value={loanMaxInput}
              onChange={(e) => setLoanMaxInput(e.target.value.replace(/\D/g, ''))}
              onBlur={(e) => {
                const value = parseInt(e.target.value.replace(/\D/g, ''));
                const finalValue = isNaN(value) || value < 0 ? 5500000 : value;
                setLoanMaxInput(finalValue.toString());
                handleFilterChange({
                  loanRange: [filters.loanRange[0], finalValue],
                });
              }}
              className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Region Filter */}
      <div>
        <label className="block text-xs font-medium text-orange-500 mb-1.5 lowercase">
          {t('portfolio.filters.region')}
        </label>
        <div className="relative">
          <select
            value={filters.region || ''}
            onChange={(e) => {
              handleFilterChange({
                region: e.target.value || undefined,
                municipality: undefined, // Reset municipality when region changes
              });
            }}
            className="w-full px-2 py-1.5 pr-8 text-sm border-2 border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25rem 1.25rem',
              appearance: 'none'
            }}
          >
            <option value="">{t('portfolio.filters.all')}</option>
            {availableOptions.regions.map((region) => (
              <option key={region} value={region}>
                {translateRegion(region, i18n.language)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Municipality Filter */}
      <div>
        <label className="block text-xs font-medium text-orange-500 mb-1.5 lowercase">
          {t('portfolio.filters.municipality')}
        </label>
        <div className="relative">
          <select
            value={filters.municipality || ''}
            onChange={(e) =>
              handleFilterChange({ municipality: e.target.value || undefined })
            }
            disabled={!filters.region}
            className="w-full px-2 py-1.5 pr-8 text-sm border-2 border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25rem 1.25rem',
              appearance: 'none'
            }}
          >
            <option value="">{t('portfolio.filters.all')}</option>
            {availableOptions.municipalities.map((municipality) => (
              <option key={municipality} value={municipality}>
                {translateMunicipality(municipality, i18n.language)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-2">
        <button
          onClick={handleReset}
          className="w-full px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors duration-200 text-xs"
        >
          {t('portfolio.filters.reset')}
        </button>
      </div>
    </div>
  );
};

export default PortfolioFilters;
