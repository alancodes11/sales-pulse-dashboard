import React from 'react';
import {
  BarChart3,
  History,
  Calendar,
  Flame,
  ShoppingBag,
} from 'lucide-react';
import { KPIMetrics } from '../hooks/useSalesData';

interface KPICardsProps {
  metrics: KPIMetrics;
  timeRangeLabel: string;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics, timeRangeLabel }) => {
  const {
    currentOrders,
    currentRevenue,
    periodOrders,
    periodRevenue,
    prevPeriodOrders,
    prevPeriodRevenue,
    monthlyOrders,
    monthlyRevenue,
  } = metrics;

  const formatCurrency = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 1000).toFixed(2)}K`;
    }
    if (val >= 1000) {
      return `₹${(val / 1000).toFixed(1)}K`;
    }
    return `₹${val.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Today Performance - Dark Glow Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-lg flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3 z-10">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            TODAY PERFORMANCE
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
            24h LIVE
          </span>
        </div>

        <div className="z-10 my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-white font-mono">
              {currentOrders}
            </span>
            <span className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Orders
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-orange-400 font-extrabold text-lg font-mono">
            <span>₹</span>
            <span>
              {currentRevenue >= 1000
                ? `${(currentRevenue / 1000).toFixed(2)}K`
                : currentRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-normal text-slate-400 ml-1">Revenue</span>
          </div>
        </div>

        <div className="z-10 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Realtime Order Stream</span>
          <span className="text-orange-400 font-semibold">Active</span>
        </div>
      </div>

      {/* 2. Current Period / MTD Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              {timeRangeLabel.toUpperCase()} MTD
            </span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1">
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {periodOrders.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-orange-600 font-bold">{formatCurrency(periodRevenue)}</span>
              <span>Revenue</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>Selected Period Total</span>
          <span className="text-slate-600 font-medium">{timeRangeLabel}</span>
        </div>
      </div>

      {/* 3. Previous Period (Same Day) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-400" />
              PREV {timeRangeLabel.toUpperCase()}
            </span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <History className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1">
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {prevPeriodOrders.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-slate-700 font-bold">{formatCurrency(prevPeriodRevenue)}</span>
              <span>Revenue</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>Comparative Window</span>
          <span className="text-slate-600 font-medium">Equal Days</span>
        </div>
      </div>

      {/* 4. Monthly Total */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              MONTHLY CUMULATIVE
            </span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1">
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {monthlyOrders.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-slate-700 font-bold">{formatCurrency(monthlyRevenue)}</span>
              <span>Revenue</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>Calendar Month</span>
          <span className="text-slate-600 font-medium">Current Month</span>
        </div>
      </div>
    </div>
  );
};
