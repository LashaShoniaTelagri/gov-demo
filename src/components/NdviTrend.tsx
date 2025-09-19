import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useTranslation } from 'react-i18next';

type Props = {
  series: { month: string; value: number }[];
  title?: string;
};

const NdviTrend: React.FC<Props> = ({ series, title }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="text-sm font-medium text-gray-900 mb-2">{title ?? t('charts.ndviTrend')}</div>
      <div className="h-56">
        <ResponsiveContainer>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" label={{ value: t('charts.month'), position: 'insideBottom', offset: -5 }} />
            <YAxis domain={[0, 1]} label={{ value: t('charts.ndvi'), angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2e7d32" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NdviTrend;


