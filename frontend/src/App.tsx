import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider, useToast } from './components/common/Toast';
import { Sidebar, PageId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { StatusBanner } from './components/layout/StatusBanner';
import { OverviewPage } from './pages/OverviewPage';
import { TrafficMonitorPage } from './pages/TrafficMonitorPage';
import { DetectionCenterPage } from './pages/DetectionCenterPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { PredictionPlaygroundPage } from './pages/PredictionPlaygroundPage';
import { SettingsPage } from './pages/SettingsPage';
import { AcademicShowcasePage } from './pages/AcademicShowcasePage';
import { CommandPalette } from './components/common/CommandPalette';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';
import { OnboardingModal } from './components/common/OnboardingModal';
import { Cyber404 } from './components/common/Cyber404';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const AppContent: React.FC = () => {
  const { refreshData } = useApp();
  const toast = useToast();

  const [activePage, setActivePage] = useState<PageId>('overview');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Persistent sidebar collapsed mode
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('netshield_sidebar_collapsed') === 'true';
  });

  const handleToggleSidebar = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem('netshield_sidebar_collapsed', String(collapsed));
  };

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(() => {
    return localStorage.getItem('netshield_onboarding_completed') !== 'true';
  });

  // Global Keyboard Shortcuts
  const pagesList: PageId[] = [
    'overview',
    'traffic',
    'detections',
    'performance',
    'playground',
    'settings',
    'academic',
  ];

  useKeyboardShortcuts({
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true),
    onOpenShortcutsModal: () => setIsShortcutsModalOpen(true),
    onRefresh: () => {
      refreshData();
      toast.info('Telemetry refreshed via hotkey (R)', 'Refreshed');
    },
    onNavigatePage: (idx: number) => {
      if (idx >= 1 && idx <= pagesList.length) {
        setActivePage(pagesList[idx - 1]);
      }
    },
    onEscape: () => {
      setIsCommandPaletteOpen(false);
      setIsShortcutsModalOpen(false);
      setIsOnboardingModalOpen(false);
    },
  });

  const isValidPage = pagesList.includes(activePage);

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col font-sans text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar (Fixed on desktop, drawer on mobile) */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleToggleSidebar}
      />

      {/* Main Content Area (Dynamic padding depending on sidebar collapsed state) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Status Alert if Backend Disconnected */}
        <StatusBanner onNavigateToSettings={() => setActivePage('settings')} />

        {/* Top Navbar */}
        <Header
          activePage={activePage}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
          onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
        />

        {/* Dynamic Page View */}
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-5 max-w-7xl w-full mx-auto">
          {activePage === 'overview' && (
            <OverviewPage
              onNavigateToPlayground={() => setActivePage('playground')}
              onNavigateToDetections={() => setActivePage('detections')}
            />
          )}

          {activePage === 'traffic' && (
            <TrafficMonitorPage
              onNavigateToPlayground={() => setActivePage('playground')}
            />
          )}

          {activePage === 'detections' && (
            <DetectionCenterPage
              onNavigateToPlayground={() => setActivePage('playground')}
            />
          )}

          {activePage === 'performance' && <ModelPerformancePage />}

          {activePage === 'playground' && <PredictionPlaygroundPage />}

          {activePage === 'settings' && <SettingsPage />}

          {activePage === 'academic' && <AcademicShowcasePage />}

          {!isValidPage && (
            <Cyber404
              onReturnToDashboard={() => setActivePage('overview')}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(p) => setActivePage(p)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
      />

      {/* Keyboard Shortcuts Modal (?) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* First-Run Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  );
};

export default App;
