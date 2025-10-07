import React from 'react';
import { useTranslation } from 'react-i18next';

interface RiskStatusFiltersProps {
  selectedStatuses: ('high' | 'observation' | 'controlled')[];
  onStatusToggle: (status: 'high' | 'observation' | 'controlled') => void;
  counts: {
    high: number;
    observation: number;
    controlled: number;
  };
  totalCount?: number;
}

const RiskStatusFilters: React.FC<RiskStatusFiltersProps> = ({
  selectedStatuses,
  onStatusToggle,
  counts,
  totalCount,
}) => {
  const { t } = useTranslation();
  
  const total = totalCount || (counts.high + counts.observation + counts.controlled);

  const statuses = [
    {
      id: 'high' as const,
      label: t('portfolio.highRisk'),
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      ringColor: 'ring-red-300',
      count: counts.high,
    },
    {
      id: 'observation' as const,
      label: t('portfolio.needsObservation'),
      color: 'bg-yellow-400',
      hoverColor: 'hover:bg-yellow-500',
      ringColor: 'ring-yellow-200',
      count: counts.observation,
    },
    {
      id: 'controlled' as const,
      label: t('portfolio.underControl'),
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      ringColor: 'ring-green-300',
      count: counts.controlled,
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 px-6 py-3 bg-white border-b border-gray-200">
      {statuses.map((status) => {
        const isSelected = selectedStatuses.includes(status.id);
        const percentage = total > 0 ? ((status.count / total) * 100).toFixed(1) : '0.0';
        return (
          <button
            key={status.id}
            onClick={() => onStatusToggle(status.id)}
            className={`
              relative px-4 py-2 rounded-md font-medium text-white text-sm shadow-md
              transform transition-all duration-200
              ${status.color} ${status.hoverColor}
              ${isSelected ? 'ring-2 ' + status.ringColor + ' scale-105' : 'opacity-70 hover:opacity-100'}
              hover:shadow-lg hover:-translate-y-0.5
            `}
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="flex items-center gap-1.5">
                <span className="text-xs">{status.label}</span>
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-white bg-opacity-30 rounded-full">
                  {status.count}
                </span>
              </span>
              <span className="text-[10px] font-normal opacity-90">
                {percentage}%
              </span>
            </div>
            {isSelected && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default RiskStatusFilters;
