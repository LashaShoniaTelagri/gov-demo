import React, { useState, useMemo } from 'react';
import RiskStatusFilters from '../components/RiskStatusFilters';
import PortfolioFilters, { PortfolioFiltersState } from '../components/PortfolioFilters';
import PortfolioMap, { Farmer } from '../components/PortfolioMap';
import FarmersList from '../components/FarmersList';
import { useAppStore } from '../lib/store';
import farmersData from '../data/farmers-v2.json';

interface PortfolioDashboardProps {
  portfolioFilter?: 'cb' | 'sme' | 'all';
}

const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({ portfolioFilter }) => {
  const auth = useAppStore((state) => state.auth);
  
  // State - empty array means show all
  const [selectedRiskStatuses, setSelectedRiskStatuses] = useState<('high' | 'observation' | 'controlled')[]>([]);
  const [filters, setFilters] = useState<PortfolioFiltersState>({
    areaRange: [0, 350],
    loanRange: [0, 5500000],
  });
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | undefined>();
  const [isFarmersListOpen, setIsFarmersListOpen] = useState(false); // false = 30%, true = 80%
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter farmers by portfolio
  const portfolioFarmers = useMemo(() => {
    const targetPortfolio = portfolioFilter || auth.portfolio;
    if (targetPortfolio === 'all') {
      return farmersData as Farmer[];
    }
    return (farmersData as Farmer[]).filter(
      (farmer) => farmer.portfolio.toLowerCase() === targetPortfolio?.toLowerCase()
    );
  }, [auth.portfolio, portfolioFilter]);

  // Apply filters
  const filteredFarmers = useMemo(() => {
    return portfolioFarmers.filter((farmer) => {
      // Risk status filter from buttons - if array is empty, show all
      if (selectedRiskStatuses.length > 0 && !selectedRiskStatuses.includes(farmer.riskStatus)) {
        return false;
      }

      // Risk status filter from dropdown
      if (filters.riskStatus && farmer.riskStatus !== filters.riskStatus) {
        return false;
      }

      // Checkup Status filter
      if (filters.checkupStatus && farmer.checkupStatus !== filters.checkupStatus) {
        return false;
      }

      // Crop filter
      if (filters.crop && farmer.crop !== filters.crop) {
        return false;
      }

      // Area filter
      if (farmer.area < filters.areaRange[0] || farmer.area > filters.areaRange[1]) {
        return false;
      }

      // Loan filter
      if (
        farmer.loanAmount < filters.loanRange[0] ||
        farmer.loanAmount > filters.loanRange[1]
      ) {
        return false;
      }

      // Region filter
      if (filters.region && farmer.region !== filters.region) {
        return false;
      }

      // Municipality filter
      if (filters.municipality && farmer.municipality !== filters.municipality) {
        return false;
      }

      return true;
    });
  }, [portfolioFarmers, selectedRiskStatuses, filters]);

  // Get available filter options
  const filterOptions = useMemo(() => {
    const crops = Array.from(new Set(portfolioFarmers.map((f) => f.crop))).sort();
    const regions = Array.from(new Set(portfolioFarmers.map((f) => f.region))).sort();
    const municipalities = filters.region
      ? Array.from(
          new Set(
            portfolioFarmers
              .filter((f) => f.region === filters.region)
              .map((f) => f.municipality)
          )
        ).sort()
      : Array.from(new Set(portfolioFarmers.map((f) => f.municipality))).sort();

    return { crops, regions, municipalities };
  }, [portfolioFarmers, filters.region]);

  // Count farmers by risk status - always from portfolio (not filtered)
  const riskCounts = useMemo(() => {
    return {
      high: portfolioFarmers.filter((f) => f.riskStatus === 'high').length,
      observation: portfolioFarmers.filter((f) => f.riskStatus === 'observation').length,
      controlled: portfolioFarmers.filter((f) => f.riskStatus === 'controlled').length,
    };
  }, [portfolioFarmers]);

  const handleRiskStatusToggle = (status: 'high' | 'observation' | 'controlled') => {
    setSelectedRiskStatuses((prev) => {
      // If clicking the same status that's already selected, deselect it (show all)
      if (prev.length === 1 && prev[0] === status) {
        return [];
      }
      // Otherwise, select only this status
      return [status];
    });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Risk Status Filters - Hidden when farmers list is expanded (80%) */}
      {!isFarmersListOpen && (
        <RiskStatusFilters
          selectedStatuses={selectedRiskStatuses}
          onStatusToggle={handleRiskStatusToggle}
          counts={riskCounts}
          totalCount={portfolioFarmers.length}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Filter Panel Toggle Button - Always at same position */}
        <button
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          className="absolute top-1/2 transform -translate-y-1/2 z-[999] bg-orange-500 hover:bg-orange-600 text-white p-2 shadow-lg transition-all duration-300"
          style={{
            left: isFilterPanelOpen ? '248px' : '0px', // 248px = 256px (w-64) - 8px (right-2)
            borderRadius: isFilterPanelOpen ? '0.375rem' : '0 0.375rem 0.375rem 0'
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isFilterPanelOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            )}
          </svg>
        </button>

        {/* Left Sidebar - Filters */}
        <div className={`transition-all duration-300 bg-gray-50 border-r border-gray-200 overflow-hidden ${isFilterPanelOpen ? 'w-64' : 'w-0'}`}>
          <div className="w-64 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <PortfolioFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableOptions={filterOptions}
              />
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`relative transition-all duration-300 ${isFarmersListOpen ? 'h-[20%]' : 'h-[70%]'}`}>
            <PortfolioMap
              farmers={filteredFarmers}
              selectedFarmerId={selectedFarmerId}
              onFarmerSelect={setSelectedFarmerId}
            />
            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-4 right-4 z-[500] bg-white hover:bg-gray-100 text-gray-700 p-2 rounded shadow-lg transition-colors border border-gray-300"
              title="Fullscreen Map"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          {/* Farmers List */}
          <div className={`transition-all duration-300 ${isFarmersListOpen ? 'h-[80%] overflow-y-auto' : 'h-[30%] overflow-y-auto'}`}>
            <FarmersList
              farmers={filteredFarmers}
              selectedFarmerId={selectedFarmerId}
              onFarmerSelect={setSelectedFarmerId}
              isOpen={isFarmersListOpen}
              onToggle={() => setIsFarmersListOpen(!isFarmersListOpen)}
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Map Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          {/* Fullscreen Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Map View</h3>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Exit Fullscreen"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Fullscreen Map */}
          <div className={`flex-1 relative transition-all duration-300 ${isFarmersListOpen ? 'h-[20%]' : 'h-[70%]'}`}>
            <PortfolioMap
              farmers={filteredFarmers}
              selectedFarmerId={selectedFarmerId}
              onFarmerSelect={setSelectedFarmerId}
              mapId="portfolio-map-fullscreen"
            />
          </div>

          {/* Fullscreen Farmers List */}
          <div className={`transition-all duration-300 ${isFarmersListOpen ? 'h-[80%] overflow-y-auto' : 'h-[30%] overflow-y-auto'}`}>
            <FarmersList
              farmers={filteredFarmers}
              selectedFarmerId={selectedFarmerId}
              onFarmerSelect={setSelectedFarmerId}
              isOpen={isFarmersListOpen}
              onToggle={() => setIsFarmersListOpen(!isFarmersListOpen)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDashboard;
