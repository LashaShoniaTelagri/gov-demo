import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Farmer } from './PortfolioMap';
import { translateRegion, translateMunicipality, translateCrop, getCompanyName } from '../lib/regionTranslations';
import { useAppStore } from '../lib/store';

interface FarmersListProps {
  farmers: Farmer[];
  selectedFarmerId?: string;
  onFarmerSelect: (farmerId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const FarmersList: React.FC<FarmersListProps> = ({
  farmers,
  selectedFarmerId,
  onFarmerSelect,
  isOpen,
  onToggle,
}) => {
  const { t, i18n } = useTranslation();
  const auth = useAppStore((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Farmer>('company');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showGovernmentModal, setShowGovernmentModal] = useState(false);
  const [showF100Modal, setShowF100Modal] = useState(false);
  const [isGeneratingF100, setIsGeneratingF100] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFarmerForRequest, setSelectedFarmerForRequest] = useState<Farmer | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Generate simulated last updated date (current date - random 0-5 days)
  const getLastUpdated = () => {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 6); // 0-5 days
    const lastUpdated = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
    
    const dateString = lastUpdated.toLocaleDateString(i18n.language === 'ka' ? 'ka-GE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    return dateString;
  };

  // Export to Excel (CSV)
  const exportToExcel = () => {
    const headers = [
      t('portfolio.farmersList.company'),
      t('portfolio.farmersList.crop'),
      t('portfolio.farmersList.area'),
      t('portfolio.farmersList.loanAmount'),
      t('portfolio.farmersList.region'),
      t('portfolio.farmersList.municipality'),
      t('portfolio.farmersList.status'),
    ];
    
    const rows = sortedFarmers.map((farmer) => {
      const currencySymbol = farmer.currency === 'UZS' ? 'UZS' : '₾';
      const loanDisplay = farmer.currency === 'UZS' 
        ? `${farmer.loanAmount.toLocaleString()} ${currencySymbol}`
        : `${currencySymbol}${farmer.loanAmount.toLocaleString()}`;
      
      return [
        farmer.company,
        translateCrop(farmer.crop, 'en'), // Always use English for crops in export
        `${farmer.area.toFixed(1)} ha`,
        loanDisplay,
        translateRegion(farmer.region, i18n.language),
        translateMunicipality(farmer.municipality, i18n.language),
        farmer.riskStatus === 'high' ? t('portfolio.highRisk') : 
          farmer.riskStatus === 'observation' ? t('portfolio.needsObservation') : 
          t('portfolio.underControl'),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `farmers_list_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export to PDF
  const exportToPDF = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('portfolio.farmersList.title')}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f97316; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header { margin-bottom: 20px; }
          .date { color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${t('portfolio.farmersList.title')}</h1>
          <p class="date">${new Date().toLocaleDateString()}</p>
          <p><strong>${t('portfolio.farmersList.total')}: ${farmers.length}</strong></p>
        </div>
        <table>
          <thead>
            <tr>
              <th>${t('portfolio.farmersList.company')}</th>
              <th>${t('portfolio.farmersList.crop')}</th>
              <th>${t('portfolio.farmersList.area')}</th>
              <th>${t('portfolio.farmersList.loanAmount')}</th>
              <th>${t('portfolio.farmersList.region')}</th>
              <th>${t('portfolio.farmersList.municipality')}</th>
              <th>${t('portfolio.farmersList.status')}</th>
            </tr>
          </thead>
          <tbody>
            ${sortedFarmers
              .map(
                (farmer) => {
                  const currencySymbol = farmer.currency === 'UZS' ? 'UZS' : '₾';
                  const loanDisplay = farmer.currency === 'UZS' 
                    ? `${farmer.loanAmount.toLocaleString()} ${currencySymbol}`
                    : `${currencySymbol}${farmer.loanAmount.toLocaleString()}`;
                  return `
              <tr>
                <td>${farmer.company}</td>
                <td>${translateCrop(farmer.crop, 'en')}</td>
                <td>${farmer.area.toFixed(1)} ha</td>
                <td>${loanDisplay}</td>
                <td>${translateRegion(farmer.region, i18n.language)}</td>
                <td>${translateMunicipality(farmer.municipality, i18n.language)}</td>
                <td>${farmer.riskStatus === 'high' ? t('portfolio.highRisk') : farmer.riskStatus === 'observation' ? t('portfolio.needsObservation') : t('portfolio.underControl')}</td>
              </tr>
            `;
                }
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Sort farmers
  const sortedFarmers = [...farmers].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle name sorting based on language
    if (sortField === 'name') {
      if (i18n.language === 'ka') {
        aValue = `${a.name} ${a.surname}`;
        bValue = `${b.name} ${b.surname}`;
      } else if (i18n.language === 'ru') {
        aValue = `${a.nameRu || a.nameEn} ${a.surnameRu || a.surnameEn}`;
        bValue = `${b.nameRu || b.nameEn} ${b.surnameRu || b.surnameEn}`;
      } else {
        aValue = `${a.nameEn} ${a.surnameEn}`;
        bValue = `${b.nameEn} ${b.surnameEn}`;
      }
    }

    // Handle score sorting (undefined values go to the end)
    if (sortField === 'score') {
      const aScore = a.score ?? -Infinity;
      const bScore = b.score ?? -Infinity;
      return sortDirection === 'asc' ? aScore - bScore : bScore - aScore;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedFarmers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFarmers = sortedFarmers.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof Farmer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getRiskStatusButton = (status: string, farmerId: string) => {
    const badges = {
      high: {
        color: 'bg-red-500',
        hoverColor: 'hover:bg-red-600',
        label: t('portfolio.highRisk'),
      },
      observation: {
        color: 'bg-yellow-400',
        hoverColor: 'hover:bg-yellow-500',
        label: t('portfolio.needsObservation'),
      },
      controlled: {
        color: 'bg-green-500',
        hoverColor: 'hover:bg-green-600',
        label: t('portfolio.underControl'),
      },
    };

    const badge = badges[status as keyof typeof badges];
    return (
      <div className="flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFarmerSelect(farmerId);
          }}
          className={`w-12 h-6 ${badge.color} ${badge.hoverColor} rounded transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer relative group`}
          title={`${badge.label} - Click for details`}
          aria-label={`View ${badge.label} details`}
        >
          {/* Pulse animation hint */}
          <span className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 ring-2 ring-white ring-opacity-50"></span>
        </button>
      </div>
    );
  };

  const SortIcon = ({ field }: { field: keyof Farmer }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      {/* Header */}
      <div className="w-full px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggle}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <h3 className="text-lg font-bold text-gray-800">{t('portfolio.farmersList.title')}</h3>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
              {farmers.length}
            </span>
            <svg
              className={`w-6 h-6 text-gray-600 transition-transform duration-200`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              )}
            </svg>
          </button>
          
          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>
          </div>
        </div>
        
        {/* Last Updated Timestamp */}
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{t('portfolio.farmersList.lastUpdated')}: {getLastUpdated()}</span>
        </div>
      </div>

      {/* Content - Always visible */}
      <div className="px-6 pb-20">
          {/* Pagination - Top */}
          {totalPages > 1 && (
            <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 flex items-center justify-between shadow-sm">
              <div className="text-sm font-medium text-gray-700">
                <span className="text-orange-600 font-semibold">
                  {startIndex + 1}-{Math.min(startIndex + itemsPerPage, farmers.length)}
                </span>
                {' '}{t('portfolio.farmersList.of')}{' '}
                <span className="text-orange-600 font-semibold">{farmers.length}</span>
                {' '}{t('portfolio.farmersList.farmers')}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white border-2 border-orange-300 text-sm font-semibold text-orange-600 hover:bg-orange-50 hover:border-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t('portfolio.farmersList.previous')}
                  </div>
                </button>
                <div className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-md">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white border-2 border-orange-300 text-sm font-semibold text-orange-600 hover:bg-orange-50 hover:border-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <div className="flex items-center gap-1">
                    {t('portfolio.farmersList.next')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto min-h-0">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th
                    onClick={() => handleSort('company')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {t('portfolio.farmersList.company')}
                      <SortIcon field="company" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('crop')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {t('portfolio.farmersList.crop')}
                      <SortIcon field="crop" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('area')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {t('portfolio.farmersList.area')}
                      <SortIcon field="area" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('loanAmount')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {t('portfolio.farmersList.loanAmount')}
                      <SortIcon field="loanAmount" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('region')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {t('portfolio.farmersList.region')}
                      <SortIcon field="region" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('municipality')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {t('portfolio.farmersList.municipality')}
                      <SortIcon field="municipality" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('riskStatus')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {t('portfolio.farmersList.status')}
                      <SortIcon field="riskStatus" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t('portfolio.farmersList.checkup')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedFarmers.map((farmer) => (
                  <tr
                    key={farmer.id}
                    className={`transition-colors ${
                      selectedFarmerId === farmer.id
                        ? 'bg-orange-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {getCompanyName(farmer, i18n.language)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{translateCrop(farmer.crop, 'en')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{farmer.area.toFixed(1)} ha</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {farmer.currency === 'UZS' 
                        ? `${farmer.loanAmount.toLocaleString()} UZS`
                        : `₾${farmer.loanAmount.toLocaleString()}`
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{translateRegion(farmer.region, i18n.language)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{translateMunicipality(farmer.municipality, i18n.language)}</td>
                    <td className="px-4 py-3 text-sm">{getRiskStatusButton(farmer.riskStatus, farmer.id)}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFarmerForRequest(farmer);
                          // Show different modal based on portal type
                          if (auth.portal === 'government') {
                            setShowGovernmentModal(true);
                          } else {
                            setShowConfirmModal(true);
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors whitespace-nowrap mb-1"
                      >
                        {t('portfolio.farmersList.requestService')}
                      </button>
                      <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                        {farmer.checkupStatus === 'checked' && (
                          <span className="flex items-center gap-1">
                            ✅ {t('portfolio.filters.checkupChecked').replace('✅ ', '')}
                            {farmer.score && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 ml-1">
                                {farmer.score.toFixed(1)}
                              </span>
                            )}
                          </span>
                        )}
                        {farmer.checkupStatus === 'in_progress' && (
                          <span>⌛ {t('portfolio.filters.checkupInProgress').replace('⌛ ', '')}</span>
                        )}
                        {farmer.checkupStatus === 'not_checked' && (
                          <span>❌ {t('portfolio.filters.checkupNotChecked').replace('❌ ', '')}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Confirmation Modal (Bank/Insurance users only) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {t('portfolio.farmersList.confirmRequest')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('portfolio.farmersList.confirmMessage')}
            </p>
            {selectedFarmerForRequest && (
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">
                    {selectedFarmerForRequest.company}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {translateCrop(selectedFarmerForRequest.crop, 'en')} • {selectedFarmerForRequest.area.toFixed(1)} ha
                </p>
              </div>
            )}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <p className="text-base font-bold text-blue-900">
                {t('portfolio.farmersList.serviceCost')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedFarmerForRequest(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                {t('portfolio.farmersList.cancel')}
              </button>
              <button
                onClick={() => {
                  // Handle the service request here
                  console.log('Service requested for', selectedFarmerForRequest?.id);
                  setShowConfirmModal(false);
                  // Redirect to TelAgri dashboard
                  window.location.href = 'https://dashboard.telagri.com/auth';
                }}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                {t('portfolio.farmersList.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Government Service Modal */}
      {showGovernmentModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {t('portfolio.farmersList.governmentServiceTitle')}
              </h3>
              <button
                onClick={() => {
                  setShowGovernmentModal(false);
                  setSelectedFarmerForRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedFarmerForRequest && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  {selectedFarmerForRequest.company}
                </p>
                <p className="text-xs text-gray-600">
                  {translateCrop(selectedFarmerForRequest.crop, 'en')} • {selectedFarmerForRequest.area.toFixed(1)} ha
                </p>
              </div>
            )}
            <div className="space-y-3">
              <button
                onClick={() => {
                  window.open('https://drive.google.com/drive/u/0/folders/1xB-LND7qItO1_PBff6abc4E8aUFP63fE', '_blank');
                }}
                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('portfolio.farmersList.instructions')}
              </button>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('File selected for upload:', file.name, 'for farmer', selectedFarmerForRequest?.id);
                      // TODO: Implement actual file upload
                      // You can add file upload logic here
                      alert(`${t('portfolio.farmersList.fileSelected')}: ${file.name}`);
                    }
                    // Reset input
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {t('portfolio.farmersList.uploadData')}
                </button>
              </div>
              <button
                onClick={() => {
                  setIsGeneratingF100(true);
                  setShowGovernmentModal(false);
                  
                  // Simulate F-100 generation for 5 seconds
                  setTimeout(() => {
                    setIsGeneratingF100(false);
                    setShowF100Modal(true);
                  }, 5000);
                }}
                disabled={isGeneratingF100}
                className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGeneratingF100 ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('portfolio.farmersList.generatingF100')}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('portfolio.farmersList.generateF100')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F-100 Generation Loader */}
      {isGeneratingF100 && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t('portfolio.farmersList.generatingF100')}
            </h3>
            <p className="text-gray-600 text-center">
              {t('portfolio.farmersList.generatingF100Message')}
            </p>
          </div>
        </div>
      )}

      {/* Generated F-100 Document Modal */}
      {showF100Modal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] max-w-6xl max-h-[90vh] mx-4 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {t('portfolio.farmersList.f100Document')}
              </h3>
              <button
                onClick={() => {
                  setShowF100Modal(false);
                  setSelectedFarmerForRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src="https://docs.google.com/document/d/11o9fLf3ISH03axo_BSF5jfgYqSF4jSvz/preview"
                className="w-full h-full border-0"
                title={t('portfolio.farmersList.f100Document')}
                allow="fullscreen"
              />
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">
                {t('portfolio.farmersList.successMessage')}
              </h3>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default FarmersList;
