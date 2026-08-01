import React from 'react';
import {
  Activity,
  BarChart3,
  Globe2,
  PackageCheck,
  Settings,
  RefreshCw,
  Database,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  isConnected: boolean;
  totalOrdersCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  isConnected,
  totalOrdersCount,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Sales Pulse',
      icon: Activity,
      badge: '24h Live',
    },
    {
      id: 'analytics',
      label: 'Performance',
      icon: BarChart3,
    },
    {
      id: 'orders',
      label: 'Live Orders',
      icon: PackageCheck,
      count: totalOrdersCount,
    },
    {
      id: 'destinations',
      label: 'Destinations',
      icon: Globe2,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 z-30 select-none">
      {/* Brand & App Title */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <h1 className="font-semibold text-slate-100 text-base tracking-tight leading-snug">
              Sales Pulse
            </h1>
            <p className="text-xs text-slate-400 font-mono">24-Hour Monitor</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-medium tracking-wider text-slate-500 uppercase">
          Core Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}

              {item.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-mono ${
                    isActive
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-6 px-3 py-2 text-[11px] font-medium tracking-wider text-slate-500 uppercase">
          Database & System
        </div>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all duration-150"
        >
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-slate-400" />
            <span>Supabase Connection</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </nav>

      {/* Database Status Card Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              {isConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              )}
            </span>
            <div>
              <p className="text-xs font-medium text-slate-200">
                {isConnected ? 'Supabase Live' : 'Setup Required'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {isConnected ? 'orders & destinations' : 'Click to connect'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            title="Database Settings"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
