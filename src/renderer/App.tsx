import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ModulePlaceholderView } from '@/components/modules/ModulePlaceholderView';
import { useAppStore } from '@/stores/useAppStore';

export const App: React.FC = () => {
  const activeModule = useAppStore((state) => state.activeModule);

  return (
    <AppShell>
      {activeModule === 'dashboard' ? (
        <DashboardView />
      ) : (
        <ModulePlaceholderView moduleId={activeModule} />
      )}
    </AppShell>
  );
};

export default App;
