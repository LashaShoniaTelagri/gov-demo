import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

type Props = {
  values: { key: string; label: string; value: number }[];
  title?: string;
};

const ScoreRadar: React.FC<Props> = ({ values, title }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="text-sm font-medium text-gray-900 mb-2">{title ?? t('charts.scoreBreakdown')}</div>
      <div className="h-64">
        <ResponsiveContainer>
          <RadarChart data={values}>
            <PolarGrid />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Tooltip />
            <Radar dataKey="value" stroke="#2e7d32" fill="#2e7d32" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreRadar;


