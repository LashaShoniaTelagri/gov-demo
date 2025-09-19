import React, { useMemo } from 'react';
import orchardsRaw from '../data/orchards.geojson?raw';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';

const AuditList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUI } = useAppStore();

  const rows = useMemo(() => {
    const orchards = JSON.parse(orchardsRaw);
    const features = (orchards as any).features as any[];
    return features
      .filter((f) => (f.properties.flags || []).length > 0)
      .map((f) => ({ id: f.properties.orchard_id, crop: f.properties.crop, flags: f.properties.flags as string[] }));
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded">
        <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-gray-500 border-b">
          <div>{t('table.orchard')}</div>
          <div>{t('table.crop')}</div>
          <div>{t('table.flags')}</div>
        </div>
        <div className="divide-y">
          {rows.map((r) => (
            <button
              key={r.id}
              className="grid grid-cols-3 gap-2 px-3 py-2 text-sm w-full text-left hover:bg-gray-50"
              onClick={() => {
                setUI({ selectedOrchardId: r.id });
                navigate('/');
              }}
            >
              <div className="font-medium">{r.id}</div>
              <div>{r.crop}</div>
              <div className="text-gray-700">{r.flags.join(', ')}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditList;


