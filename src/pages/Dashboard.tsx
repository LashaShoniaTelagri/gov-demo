import React from 'react';
import Map from '../components/Map';
import LayerToggles from '../components/LayerToggles';
import Filters from '../components/Filters';
import KpiCards from '../components/KpiCards';
import OrchardDrawer from '../components/OrchardDrawer';
import { useAppStore } from '../lib/store';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { ui, setUI } = useAppStore();
  return (
    <div className="h-[calc(100vh-56px)] grid grid-cols-12 gap-4 p-4">
      <aside className={`space-y-4 transition-all duration-200 ${ui.showLeftPanel ? 'col-span-3 opacity-100' : 'col-span-1 opacity-70'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{t('filters.title')}</span>
          <button className="text-xs text-gray-600 underline" onClick={() => setUI({ showLeftPanel: !ui.showLeftPanel })}>
            {ui.showLeftPanel ? t('common.hide') : t('common.show')}
          </button>
        </div>
        {ui.showLeftPanel && (
          <>
            <Filters />
            <LayerToggles />
            <KpiCards />
          </>
        )}
      </aside>
      <section className={`${ui.showLeftPanel ? (ui.showRightPanel ? 'col-span-6' : 'col-span-9') : (ui.showRightPanel ? 'col-span-8' : 'col-span-11')} relative`}>
        <div className="h-full rounded-lg overflow-hidden border border-gray-200 relative">
          <Map />
        </div>
      </section>
      {ui.showRightPanel && (
        <aside className={`${ui.showLeftPanel ? 'col-span-3' : 'col-span-3'} transition-all duration-200`}>
          <div className="h-full">
            <OrchardDrawer embedded />
          </div>
        </aside>
      )}
    </div>
  );
};

export default Dashboard;


