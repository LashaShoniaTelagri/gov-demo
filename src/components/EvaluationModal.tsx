import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  scoreBucket,
  type FieldFeature,
  type ScoreBucket,
} from '../lib/fieldsData';
import { EVALUATION_TEMPLATES } from '../lib/evaluationTemplates';
import { translateRegion, translateMunicipality } from '../lib/regionTranslations';

interface EvaluationModalProps {
  field: FieldFeature;
  onClose: () => void;
}

const BUCKET_COLOR: Record<ScoreBucket, string> = {
  low: '#dc2626',
  mid: '#d97706',
  high: '#16a34a',
};

const EvaluationModal: React.FC<EvaluationModalProps> = ({ field, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const openCashFlow = () => {
    onClose();
    navigate('/monitoring/orchard-cash-flow');
  };
  const p = field.properties;
  const bucket = scoreBucket(p.score);
  const tmpl = EVALUATION_TEMPLATES[bucket];
  const color = BUCKET_COLOR[bucket];
  // Tab id `monitoringTab` (rather than `monitoring`) avoids an i18n
  // key collision — the namespace root is also `monitoring`, so a leaf
  // segment with the same name resolved to the parent object in some
  // i18next paths and rendered empty.
  const [tab, setTab] = useState<'bankView' | 'monitoringTab'>('bankView');

  const cropLabel = p.crop
    ? t(`placeOrder.cropNames.${p.crop.toLowerCase()}`)
    : '—';

  const breakdownData = [
    { key: 'climate', label: t('monitoring.evaluation.categories.climate'), value: tmpl.breakdown.climate },
    { key: 'irrigation', label: t('monitoring.evaluation.categories.irrigation'), value: tmpl.breakdown.irrigation },
    { key: 'management', label: t('monitoring.evaluation.categories.management'), value: tmpl.breakdown.management },
    { key: 'pests', label: t('monitoring.evaluation.categories.pests'), value: tmpl.breakdown.pests },
  ];

  const trendData = [
    { key: 'm3', label: t('monitoring.evaluation.trendLabels.m3'), value: tmpl.trend.m3 },
    { key: 'm2', label: t('monitoring.evaluation.trendLabels.m2'), value: tmpl.trend.m2 },
    { key: 'm1', label: t('monitoring.evaluation.trendLabels.m1'), value: tmpl.trend.m1 },
  ];

  const tabText = t(`monitoring.evaluation.${bucket}.${tab}`);

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 gap-3">
          <h2 className="text-lg font-semibold text-gray-800">
            #{p.field_id}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={openCashFlow}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 whitespace-nowrap"
            >
              {t('monitoring.evaluation.cashFlowButton')}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
              aria-label="close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <ul className="space-y-1.5 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-500">{t('monitoring.tooltip.crop')}</span>
              <span className="font-medium text-gray-800">{cropLabel}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">{t('monitoring.tooltip.score')}</span>
              <span className="font-medium text-gray-800">{p.score.toFixed(1)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">{t('monitoring.evaluation.plantedArea')}</span>
              <span className="font-medium text-gray-800">
                {p.area_ha.toLocaleString()} ha
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">{t('monitoring.tooltip.region')}</span>
              <span className="font-medium text-gray-800">
                {translateRegion(p.region, i18n.language)}
              </span>
            </li>
            {p.municipality && (
              <li className="flex justify-between">
                <span className="text-gray-500">
                  {t('monitoring.tooltip.municipality')}
                </span>
                <span className="font-medium text-gray-800">
                  {translateMunicipality(p.municipality, i18n.language)}
                </span>
              </li>
            )}
            {/* Static cadastral identity — identical for every demo plot, to
                communicate that the system maps land by cadastral code. */}
            <li className="flex justify-between">
              <span className="text-gray-500">
                {t('monitoring.evaluation.cadastralCode')}
              </span>
              <span className="font-medium text-gray-800">52.49.31.019</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">
                {t('monitoring.evaluation.cadastralArea')}
              </span>
              <span className="font-medium text-gray-800">40 Ha</span>
            </li>
          </ul>

          <hr className="border-gray-200" />

          <section className="space-y-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t('monitoring.evaluation.sectionTitle')}
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              {t(`monitoring.evaluation.${bucket}.title`)}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {t('monitoring.evaluation.overallScore')}
                </div>
                <div className="text-xl font-bold mt-0.5" style={{ color }}>
                  {p.score.toFixed(1)}
                  <span className="text-sm text-gray-400 font-normal">/10</span>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {t('monitoring.evaluation.regionalAverage')}
                </div>
                <div className="text-xl font-bold text-gray-900 mt-0.5">
                  {tmpl.regionalAverage.toFixed(1)}
                  <span className="text-sm text-gray-400 font-normal">/10</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {t(`monitoring.evaluation.${bucket}.narrative`)}
            </p>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {t('monitoring.evaluation.categoryBreakdown')}
            </h4>
            <div className="h-44">
              <ResponsiveContainer>
                <BarChart
                  data={breakdownData}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                >
                  <XAxis type="number" domain={[0, 10]} hide />
                  <YAxis
                    dataKey="label"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v}/10`, '']}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#374151', fontSize: 12, formatter: (v: number) => `${v}/10` }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {t('monitoring.evaluation.trend')}
            </h4>
            <div className="h-44">
              <ResponsiveContainer>
                <LineChart
                  data={trendData}
                  margin={{ top: 24, right: 24, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(v: number) => v.toFixed(1)} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: color }}
                    activeDot={{ r: 6 }}
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      offset={10}
                      formatter={(v: number) => v.toFixed(1)}
                      style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="border-t border-gray-200">
          <div className="flex">
            {(['bankView', 'monitoringTab'] as const).map((id) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === id
                    ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {t(`monitoring.evaluation.tabs.${id}`)}
              </button>
            ))}
          </div>
          {/* i18n strings can ship as HTML (with <strong>, <ul>, <li>, <p>,
              <br>) or plain text with newlines. Strings that start with `<`
              are treated as HTML; all values are static, author-controlled
              demo copy so dangerouslySetInnerHTML is safe here. */}
          {tabText.trimStart().startsWith('<') ? (
            <div
              className="px-6 py-5 text-sm text-gray-700 leading-relaxed [&_strong]:font-semibold [&_strong]:text-gray-900 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-2 [&_ul]:mt-1"
              dangerouslySetInnerHTML={{ __html: tabText }}
            />
          ) : (
            <div className="px-6 py-5 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {tabText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationModal;
