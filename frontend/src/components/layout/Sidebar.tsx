import React from 'react';
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  BarChart3,
  Sliders,
  Settings,
  Shield,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type PageId =
  | 'overview'
  | 'traffic'
  | 'detections'
  | 'performance'
  | 'playground'
  | 'settings'
  | 'academic';

interface SidebarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { statistics, predictionHistory, selectedModel, connectionStatus } = useApp();

  const attackCount =
    statistics?.attack_predictions ||
    predictionHistory.filter((p) => p.prediction === 1).length;

  const navItems: {
    id: PageId;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'traffic', label: 'Traffic Monitor', icon: Activity },
    {
      id: 'detections',
      label: 'Detection Center',
      icon: ShieldAlert,
      badge: attackCount > 0 ? attackCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    { id: 'performance', label: 'Model Performance', icon: BarChart3 },
    { id: 'playground', label: 'Prediction Playground', icon: Sliders },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'academic', label: 'Academic Showcase', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 h-screen z-50 bg-navy-950 border-r border-navy-800 flex flex-col justify-between transition-all duration-200 ease-in-out ${
          isCollapsed ? 'lg:w-20 p-3' : 'lg:w-64 p-4'
        } w-64 p-4 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Section: Brand + Nav Links */}
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          {/* Brand Header */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-bold text-slate-100 tracking-wide text-sm truncate leading-tight">
                    NETSHIELD
                  </h1>
                  <p className="text-[10px] font-mono text-slate-400 leading-tight">
                    AI NIDS
                  </p>
                </div>
              </div>
              {/* Collapse Arrow Button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1 hover:bg-navy-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="p-1 hover:bg-navy-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="space-y-1 flex-1 overflow-y-auto pr-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMobileOpen(false);
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                  } py-2.5 rounded-lg text-xs font-medium border transition-colors duration-150 group relative focus:outline-none select-none ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 font-semibold border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/60 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                        item.badgeColor || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Collapsed static badge dot without blinking */}
                  {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-navy-950" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pinned Bottom System Telemetry Card */}
        <div className="pt-3 border-t border-navy-800/80 shrink-0">
          {!isCollapsed ? (
            <div className="bg-navy-900/60 rounded-lg p-2.5 border border-navy-800/60 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      connectionStatus === 'connected'
                        ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                        : 'bg-rose-400 animate-pulse'
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-slate-200 truncate">
                    {connectionStatus === 'connected' ? 'Telemetry Active' : 'Offline Mode'}
                  </span>
                </div>
                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0">
                  v1.0.0
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="truncate text-cyan-400 font-medium">
                  {selectedModel ? selectedModel.toUpperCase() : 'XGBOOST'}
                </span>
                <span className="text-slate-500 shrink-0">42 Features</span>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center py-1 gap-1"
              title={`${connectionStatus === 'connected' ? 'Telemetry Active' : 'Offline'} • ${selectedModel.toUpperCase()}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-rose-400'
                }`}
              />
              <span className="text-[9px] font-mono font-bold text-cyan-400">SOC</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
