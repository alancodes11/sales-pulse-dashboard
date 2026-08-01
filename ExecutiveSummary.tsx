import React from 'react';
import { KPIMetrics, DestinationPerformancePoint } from '../hooks/useSalesData';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  Globe2,
  DollarSign,
  Package,
  Clock,
} from 'lucide-react';

interface ExecutiveSummaryProps {
  metrics: KPIMetrics;
  destinations: DestinationPerformancePoint[];
  timeRangeLabel: string;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  metrics,
  destinations,
  timeRangeLabel,
}) => {
  const {
    currentOrders,
    currentRevenue,
    periodOrders,
    periodRevenue,
    prevPeriodOrders,
    prevPeriodRevenue,
    averageOrderValue,
    topDestination,
    topDestinationRevenue,
    salesGrowthPercent,
  } = metrics;

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 1000).toFixed(1)}K`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toLocaleString()}`;
  };

  const topDest = destinations[0] || { destinationName: topDestination || 'N/A', revenue: topDestinationRevenue, ordersCount: 0 };
  const topDestPercent = periodOrders > 0 ? Math.round((topDest.ordersCount / periodOrders) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase">
              SALES PERFORMANCE EXECUTIVE SUMMARY ({timeRangeLabel.toUpperCase()})
            </h2>
            <p className="text-[11px] text-slate-500">
              Live automated insights and business health breakdown from backend
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
            Period: {timeRangeLabel}
          </span>
        </div>
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Growth Insight */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${salesGrowthPercent >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {salesGrowthPercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Period Growth Trend
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-base font-extrabold font-mono ${salesGrowthPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {salesGrowthPercent >= 0 ? `+${salesGrowthPercent.toFixed(1)}%` : `${salesGrowthPercent.toFixed(1)}%`}
              </span>
              <span className="text-[11px] text-slate-500">vs Prev Window</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              Prev Revenue: {formatCurrency(prevPeriodRevenue)} ({prevPeriodOrders} orders)
            </p>
          </div>
        </div>

        {/* 2. Average Order Value (ARPU / AOV) */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-orange-100 text-orange-700 shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Avg Order Value (AOV)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold font-mono text-slate-900">
                ₹{Math.round(averageOrderValue)}
              </span>
              <span className="text-[11px] text-slate-500">per SIM order</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {periodOrders} total orders processed
            </p>
          </div>
        </div>

        {/* 3. Top Performing Destination */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
            <Globe2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Top Destination
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-slate-900 truncate max-w-[120px]">
                {topDest.destinationName}
              </span>
              <span className="text-xs font-mono font-bold text-orange-600">
                ({topDestPercent}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {formatCurrency(topDest.revenue)} • {topDest.ordersCount} SIMs
            </p>
          </div>
        </div>

        {/* 4. Today Realtime Velocity */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Today's Velocity (24h)
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-extrabold font-mono text-slate-900">
                {currentOrders}
              </span>
              <span className="text-[11px] text-slate-500">orders today</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              Revenue today: {formatCurrency(currentRevenue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
