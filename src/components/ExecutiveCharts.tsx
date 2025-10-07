import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../lib/store';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ExecutiveCharts: React.FC = () => {
  const { t } = useTranslation();
  const auth = useAppStore((state) => state.auth);

  // Bank Portfolio Distribution
  const bankPortfolioData = [
    { name: 'CB', value: 45000000, loans: 150 },
    { name: 'SME', value: 12000000, loans: 850 },
    { name: 'Retail', value: 200000, loans: 247 },
  ];

  // Monthly Performance
  const monthlyPerformanceData = [
    { month: 'Jan', portfolio: 48, disbursed: 3.2, collected: 2.8 },
    { month: 'Feb', portfolio: 49, disbursed: 3.5, collected: 3.1 },
    { month: 'Mar', portfolio: 51, disbursed: 4.1, collected: 3.4 },
    { month: 'Apr', portfolio: 52, disbursed: 3.8, collected: 3.6 },
    { month: 'May', portfolio: 54, disbursed: 4.5, collected: 3.9 },
    { month: 'Jun', portfolio: 57, disbursed: 5.2, collected: 4.2 },
  ];

  // Risk Distribution
  const riskDistributionData = [
    { name: 'Low Risk', value: 65, color: '#10b981' },
    { name: 'Medium Risk', value: 28, color: '#f59e0b' },
    { name: 'High Risk', value: 7, color: '#ef4444' },
  ];

  // Insurance Claims by Type
  const insuranceClaimsData = [
    { type: 'Drought', claims: 145, amount: 2.8 },
    { type: 'Frost', claims: 89, amount: 1.9 },
    { type: 'Hail', claims: 67, amount: 1.5 },
    { type: 'Flood', claims: 43, amount: 1.2 },
    { type: 'Pest', claims: 28, amount: 0.8 },
  ];

  // Government Program Effectiveness
  const programEffectivenessData = [
    { region: 'Kakheti', beneficiaries: 1245, subsidies: 4.8, compliance: 96 },
    { region: 'Imereti', beneficiaries: 892, subsidies: 3.2, compliance: 94 },
    { region: 'Kvemo Kartli', beneficiaries: 756, subsidies: 2.9, compliance: 93 },
    { region: 'Shida Kartli', beneficiaries: 623, subsidies: 2.4, compliance: 95 },
    { region: 'Samtskhe-Javakheti', beneficiaries: 489, subsidies: 1.8, compliance: 92 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const renderBankCharts = () => (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('executive.portfolioDistribution')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={bankPortfolioData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {bankPortfolioData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `₾${(value / 1000000).toFixed(1)}M`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('executive.monthlyPerformance')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="portfolio" stroke="#3b82f6" strokeWidth={2} name={t('executive.portfolio')} />
            <Line type="monotone" dataKey="disbursed" stroke="#10b981" strokeWidth={2} name={t('executive.disbursed')} />
            <Line type="monotone" dataKey="collected" stroke="#f59e0b" strokeWidth={2} name={t('executive.collected')} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('executive.riskDistribution')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={riskDistributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {riskDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );

  const renderInsuranceCharts = () => (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('executive.claimsByType')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={insuranceClaimsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="claims" fill="#10b981" name={t('executive.claimsCount')} />
            <Bar yAxisId="right" dataKey="amount" fill="#3b82f6" name={t('executive.amountM')} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('executive.monthlyPerformance')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="portfolio" stroke="#10b981" strokeWidth={2} name={t('executive.premiums')} />
            <Line type="monotone" dataKey="disbursed" stroke="#3b82f6" strokeWidth={2} name={t('executive.policies')} />
            <Line type="monotone" dataKey="collected" stroke="#ef4444" strokeWidth={2} name={t('executive.claims')} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('executive.riskDistribution')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={riskDistributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {riskDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );

  const renderGovernmentCharts = () => (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('executive.programByRegion')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={programEffectivenessData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="beneficiaries" fill="#8b5cf6" name={t('executive.beneficiaries')} />
            <Bar yAxisId="right" dataKey="subsidies" fill="#3b82f6" name={t('executive.subsidiesM')} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('executive.complianceByRegion')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={programEffectivenessData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis domain={[85, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="compliance" fill="#10b981" name={t('executive.complianceRate')} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('executive.monthlyTrends')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="portfolio" stroke="#8b5cf6" strokeWidth={2} name={t('executive.beneficiaries')} />
            <Line type="monotone" dataKey="disbursed" stroke="#3b82f6" strokeWidth={2} name={t('executive.subsidies')} />
            <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} name={t('executive.compliance')} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );

  const renderCharts = () => {
    switch (auth.portal) {
      case 'bank':
        return renderBankCharts();
      case 'insurance':
        return renderInsuranceCharts();
      case 'government':
        return renderGovernmentCharts();
      default:
        return renderBankCharts();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {renderCharts()}
    </div>
  );
};

export default ExecutiveCharts;
