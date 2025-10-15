import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ThresholdAlert {
  riskType: 'high' | 'observation' | 'controlled';
  percentage: number;
  enabled: boolean;
}

interface RiskTrendChartProps {
  filteredFarmers?: any[];
  data?: Array<{
    month: string;
    high: number;
    observation: number;
    controlled: number;
  }>;
}

const ALERT_STORAGE_KEY = 'riskTrendAlerts';

const RiskTrendChart: React.FC<RiskTrendChartProps> = ({ data, filteredFarmers = [] }) => {
  const { t } = useTranslation();
  
  // Default alert settings
  const defaultAlerts: ThresholdAlert[] = [
    { riskType: 'high', percentage: 30, enabled: false },
    { riskType: 'observation', percentage: 50, enabled: false },
    { riskType: 'controlled', percentage: 20, enabled: false },
  ];

  // Load alerts from localStorage or use defaults
  const loadAlerts = (): ThresholdAlert[] => {
    try {
      const stored = localStorage.getItem(ALERT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load alert settings:', error);
    }
    return defaultAlerts;
  };

  // Alert thresholds state
  const [alerts, setAlerts] = useState<ThresholdAlert[]>(loadAlerts);
  
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<ThresholdAlert | null>(null);

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(alerts));
    } catch (error) {
      console.error('Failed to save alert settings:', error);
    }
  }, [alerts]);

  // Generate historical data based on filtered farmers
  const chartData = useMemo(() => {
    if (data) return data;
    
    // Get current date
    const currentDate = new Date();
    const months = [];
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleString('en-US', { month: 'short' }));
    }
    
    // Calculate EXACT percentages from filtered data (current/latest month)
    const total = filteredFarmers.length;
    
    // If no farmers, show zeros
    if (total === 0) {
      return months.map((month) => ({
        month,
        high: 0,
        observation: 0,
        controlled: 0,
      }));
    }
    
    const highCount = filteredFarmers.filter(f => f.riskStatus === 'high').length;
    const obsCount = filteredFarmers.filter(f => f.riskStatus === 'observation').length;
    const controlledCount = filteredFarmers.filter(f => f.riskStatus === 'controlled').length;
    
    const highPct = (highCount / total) * 100;
    const obsPct = (obsCount / total) * 100;
    const controlledPct = (controlledCount / total) * 100;
    
    // Generate historical trend data
    // Last month (index 5) will have EXACT current data
    // Previous months will have slight variations to show trend
    return months.map((month, index) => {
      // Last month = exact current data (no variation)
      if (index === 5) {
        return {
          month,
          high: parseFloat(highPct.toFixed(1)),
          observation: parseFloat(obsPct.toFixed(1)),
          controlled: parseFloat(controlledPct.toFixed(1)),
        };
      }
      
      // Historical months: simulate trend leading to current values
      const progress = index / 5; // 0 to 1
      const historicalVariation = (0.8 - progress) * 8; // Larger variation in past, converges to current
      
      return {
        month,
        high: Math.max(0, Math.min(100, parseFloat((highPct - historicalVariation + (Math.random() - 0.5) * 4).toFixed(1)))),
        observation: Math.max(0, Math.min(100, parseFloat((obsPct + historicalVariation * 0.3 + (Math.random() - 0.5) * 4).toFixed(1)))),
        controlled: Math.max(0, Math.min(100, parseFloat((controlledPct - historicalVariation * 0.3 + (Math.random() - 0.5) * 4).toFixed(1)))),
      };
    });
  }, [data, filteredFarmers]);

  // Check if any alerts are triggered
  const triggeredAlerts = useMemo(() => {
    const latestData = chartData[chartData.length - 1];
    if (!latestData) return [];
    
    return alerts.filter(alert => {
      if (!alert.enabled) return false;
      const currentValue = latestData[alert.riskType];
      return currentValue >= alert.percentage;
    });
  }, [chartData, alerts]);

  const handleEditAlert = (alert: ThresholdAlert) => {
    setEditingAlert(alert);
    setShowAlertModal(true);
  };

  const handleSaveAlert = () => {
    if (!editingAlert) return;
    
    setAlerts(prev => 
      prev.map(a => 
        a.riskType === editingAlert.riskType ? editingAlert : a
      )
    );
    setShowAlertModal(false);
    setEditingAlert(null);
  };

  const getRiskColor = (riskType: string) => {
    switch (riskType) {
      case 'high': return '#ef4444';
      case 'observation': return '#fbbf24';
      case 'controlled': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskLabel = (riskType: string) => {
    switch (riskType) {
      case 'high': return t('portfolio.highRisk');
      case 'observation': return t('portfolio.needsObservation');
      case 'controlled': return t('portfolio.underControl');
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{t('riskTrend.title')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('riskTrend.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAlertModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {t('riskTrend.manageAlerts')}
        </button>
      </div>

      {/* Active Alerts Banner */}
      {triggeredAlerts.length > 0 && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-bold text-red-800">{t('riskTrend.alertsTriggered')}</h4>
              <div className="mt-2 space-y-1">
                {triggeredAlerts.map((alert) => (
                  <p key={alert.riskType} className="text-sm text-red-700">
                    <span className="font-semibold">{getRiskLabel(alert.riskType)}</span> {t('riskTrend.exceeds')} {alert.percentage}%
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: t('riskTrend.percentage'), angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => `${value.toFixed(1)}%`}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => getRiskLabel(value)}
            />
            
            {/* Alert threshold lines - Visible when enabled and saved */}
            {alerts.map((alert) => 
              alert.enabled ? (
                <ReferenceLine
                  key={alert.riskType}
                  y={alert.percentage}
                  stroke={getRiskColor(alert.riskType)}
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  opacity={0.8}
                  label={{
                    value: `${alert.percentage}%`,
                    position: 'right',
                    fill: getRiskColor(alert.riskType),
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}
                />
              ) : null
            )}
            
            {/* Data lines */}
            <Line 
              type="monotone" 
              dataKey="high" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', r: 4 }}
              activeDot={{ r: 6 }}
              name="high"
            />
            <Line 
              type="monotone" 
              dataKey="observation" 
              stroke="#fbbf24" 
              strokeWidth={3}
              dot={{ fill: '#fbbf24', r: 4 }}
              activeDot={{ r: 6 }}
              name="observation"
            />
            <Line 
              type="monotone" 
              dataKey="controlled" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="controlled"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alert Configuration Modal - Split Screen */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{t('riskTrend.alertSettings')}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t('riskTrend.alertDescription')}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAlertModal(false);
                  setEditingAlert(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Split Content: Chart Left + Controls Right */}
            <div className="flex-1 flex overflow-hidden">
              {/* LEFT: Live Chart Preview */}
              <div className="flex-1 p-6 bg-gray-50 border-r overflow-auto">
                <div className="h-full flex flex-col">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Live Preview - Threshold Lines
                  </h4>
                  
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                          domain={[0, 100]}
                          label={{ value: '%', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: number) => `${value.toFixed(1)}%`}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '12px' }}
                          formatter={(value) => getRiskLabel(value)}
                        />
                        
                        {/* Alert threshold lines */}
                        {alerts.map((alert) => 
                          alert.enabled ? (
                            <ReferenceLine
                              key={alert.riskType}
                              y={alert.percentage}
                              stroke={getRiskColor(alert.riskType)}
                              strokeDasharray="5 5"
                              strokeWidth={2}
                              opacity={0.8}
                              label={{
                                value: `${alert.percentage}%`,
                                position: 'right',
                                fill: getRiskColor(alert.riskType),
                                fontSize: 12,
                                fontWeight: 'bold'
                              }}
                            />
                          ) : null
                        )}
                        
                        {/* Data lines */}
                        <Line 
                          type="monotone" 
                          dataKey="high" 
                          stroke="#ef4444" 
                          strokeWidth={3}
                          dot={{ fill: '#ef4444', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="high"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="observation" 
                          stroke="#fbbf24" 
                          strokeWidth={3}
                          dot={{ fill: '#fbbf24', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="observation"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="controlled" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="controlled"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* RIGHT: Alert Controls */}
              <div className="w-96 p-6 flex flex-col overflow-auto">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Configure Thresholds
                </h4>

                {/* Alert Configuration List */}
                <div className="space-y-4 flex-1">
                  {alerts.map((alert) => (
                    <div
                      key={alert.riskType}
                      className="border-2 rounded-lg p-4 transition-all"
                      style={{ 
                        borderColor: alert.enabled ? getRiskColor(alert.riskType) : '#e5e7eb',
                        backgroundColor: alert.enabled ? `${getRiskColor(alert.riskType)}10` : 'white'
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getRiskColor(alert.riskType) }}
                          />
                          <span className="text-sm font-semibold text-gray-900">
                            {getRiskLabel(alert.riskType)}
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={alert.enabled}
                            onChange={(e) => {
                              setAlerts(prev =>
                                prev.map(a =>
                                  a.riskType === alert.riskType
                                    ? { ...a, enabled: e.target.checked }
                                    : a
                                )
                              );
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>

                      {alert.enabled && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-gray-600">
                              Threshold
                            </label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={alert.percentage}
                                onChange={(e) => {
                                  const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                  setAlerts(prev =>
                                    prev.map(a =>
                                      a.riskType === alert.riskType
                                        ? { ...a, percentage: value }
                                        : a
                                    )
                                  );
                                }}
                                className="w-14 px-2 py-1 text-sm border-2 border-gray-300 rounded text-center font-bold"
                                style={{ borderColor: getRiskColor(alert.riskType) }}
                              />
                              <span className="text-sm font-medium text-gray-600">%</span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={alert.percentage}
                            onChange={(e) => {
                              setAlerts(prev =>
                                prev.map(a =>
                                  a.riskType === alert.riskType
                                    ? { ...a, percentage: parseInt(e.target.value) }
                                    : a
                                )
                              );
                            }}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, ${getRiskColor(alert.riskType)} 0%, ${getRiskColor(alert.riskType)} ${alert.percentage}%, #e5e7eb ${alert.percentage}%, #e5e7eb 100%)`
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 mt-6 pt-6 border-t">
                  <button
                    onClick={() => setShowAlertModal(false)}
                    className="w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                  >
                    {t('riskTrend.saveSettings')}
                  </button>
                  <button
                    onClick={() => {
                      setShowAlertModal(false);
                      setEditingAlert(null);
                    }}
                    className="w-full px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    {t('portfolio.farmersList.cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskTrendChart;

