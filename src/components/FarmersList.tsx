import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Farmer } from './PortfolioMap';
import { translateRegion, translateMunicipality } from '../lib/regionTranslations';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Farmer>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFarmerForRequest, setSelectedFarmerForRequest] = useState<Farmer | null>(null);

  // Export to Excel (CSV)
  const exportToExcel = () => {
    const headers = [
      t('portfolio.farmersList.name'),
      t('portfolio.farmersList.crop'),
      t('portfolio.farmersList.area'),
      t('portfolio.farmersList.loanAmount'),
      t('portfolio.farmersList.region'),
      t('portfolio.farmersList.municipality'),
      t('portfolio.farmersList.status'),
    ];
    
    const rows = sortedFarmers.map((farmer) => [
      i18n.language === 'ka' ? `${farmer.name} ${farmer.surname}` : `${farmer.nameEn} ${farmer.surnameEn}`,
      farmer.crop,
      `${farmer.area.toFixed(1)} ha`,
      `₾${farmer.loanAmount.toLocaleString()}`,
      farmer.region,
      farmer.municipality,
      farmer.riskStatus,
    ]);

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
              <th>${t('portfolio.farmersList.name')}</th>
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
                (farmer) => `
              <tr>
                <td>${i18n.language === 'ka' ? `${farmer.name} ${farmer.surname}` : `${farmer.nameEn} ${farmer.surnameEn}`}</td>
                <td>${farmer.crop}</td>
                <td>${farmer.area.toFixed(1)} ha</td>
                <td>₾${farmer.loanAmount.toLocaleString()}</td>
                <td>${farmer.region}</td>
                <td>${farmer.municipality}</td>
                <td>${farmer.riskStatus}</td>
              </tr>
            `
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
      aValue = i18n.language === 'ka' ? a.name : a.nameEn;
      bValue = i18n.language === 'ka' ? b.name : b.nameEn;
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

  const getRiskStatusBadge = (status: string) => {
    const badges = {
      high: {
        color: 'bg-red-500',
        label: t('portfolio.highRisk'),
      },
      observation: {
        color: 'bg-yellow-400',
        label: t('portfolio.needsObservation'),
      },
      controlled: {
        color: 'bg-green-500',
        label: t('portfolio.underControl'),
      },
    };

    const badge = badges[status as keyof typeof badges];
    return (
      <div className="flex items-center justify-center" title={badge.label}>
        <span className={`w-6 h-3 ${badge.color}`}></span>
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
    <div className="bg-white border-t border-gray-200 shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="w-full px-6 py-4 flex items-center justify-between bg-white border-b border-gray-200 flex-shrink-0">
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

      {/* Content - Always visible */}
      <div className="px-6 pb-6 flex-1 overflow-auto">
          {/* Pagination - Top */}
          {totalPages > 1 && (
            <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 flex items-center justify-between shadow-sm">
              <div className="text-sm font-medium text-gray-700">
                <span className="text-orange-600 font-semibold">
                  {startIndex + 1}-{Math.min(startIndex + itemsPerPage, farmers.length)}
                </span>
                {' '}of{' '}
                <span className="text-orange-600 font-semibold">{farmers.length}</span>
                {' '}farmers
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
                    Previous
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
                    Next
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
                    onClick={() => handleSort('name')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {t('portfolio.farmersList.name')}
                      <SortIcon field="name" />
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
                    onClick={() => onFarmerSelect(farmer.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedFarmerId === farmer.id
                        ? 'bg-orange-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {i18n.language === 'ka'
                        ? `${farmer.name} ${farmer.surname}`
                        : `${farmer.nameEn} ${farmer.surnameEn}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{farmer.crop}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{farmer.area.toFixed(1)} ha</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      ₾{farmer.loanAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{translateRegion(farmer.region, i18n.language)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{translateMunicipality(farmer.municipality, i18n.language)}</td>
                    <td className="px-4 py-3 text-sm">{getRiskStatusBadge(farmer.riskStatus)}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFarmerForRequest(farmer);
                          setShowConfirmModal(true);
                        }}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors whitespace-nowrap"
                      >
                        {t('portfolio.farmersList.requestService')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {t('portfolio.farmersList.confirmRequest')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('portfolio.farmersList.confirmMessage')}
            </p>
            {selectedFarmerForRequest && (
              <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">
                    {i18n.language === 'ka' 
                      ? `${selectedFarmerForRequest.name} ${selectedFarmerForRequest.surname}`
                      : `${selectedFarmerForRequest.nameEn} ${selectedFarmerForRequest.surnameEn}`
                    }
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedFarmerForRequest.crop} • {selectedFarmerForRequest.area.toFixed(1)} ha
                </p>
              </div>
            )}
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
                  setShowSuccessModal(true);
                  // Reset after 2 seconds
                  setTimeout(() => {
                    setShowSuccessModal(false);
                    setSelectedFarmerForRequest(null);
                  }, 2000);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                {t('portfolio.farmersList.confirm')}
              </button>
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
