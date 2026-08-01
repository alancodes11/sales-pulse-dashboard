import React, { useState, useEffect } from 'react';
import {
  Download,
  Flame,
  LogOut,
  RefreshCw,
  SlidersHorizontal,
  Calendar,
} from 'lucide-react';

interface HeaderProps {
  lastUpdated: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
  autoRefreshSeconds: number;
  setAutoRefreshSeconds: (sec: number) => void;
  isConnected: boolean;
  onExportCSV?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  refreshing,
  onRefresh,
  autoRefreshSeconds,
  setAutoRefreshSeconds,
  isConnected,
  onOpenSettings,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-30 shadow-xs flex flex-wrap items-center justify-between gap-4">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/30">
            <Flame className="w-5 h-5 fill-white text-orange-600" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Travel SIM Sales Dashboard
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-600 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Date badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Right User & Refresh Section */}
      <div className="flex items-center gap-3">
        {/* Supabase Connection Settings Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isConnected ? 'Supabase Connected' : 'Setup Supabase'}</span>
          </button>
        )}

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
          <div className="text-right">
            <div className="font-bold text-slate-800">Admin</div>
            <div className="text-[10px] text-slate-400">Live System</div>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            title="Account Settings"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
