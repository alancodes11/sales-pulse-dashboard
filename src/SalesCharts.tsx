import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Calendar, BarChart3 } from 'lucide-react';
import { TrendPoint } from '../hooks/useSalesData';

interface SalesChartsProps {
  trendPoints: TrendPoint[];
  timeRangeLabel: string;
}

export const SalesCharts: React.FC<SalesChartsProps> = ({
  trendPoints,
  timeRangeLabel,
}) => {
  // Calculate cumulative trend points for monthly summary
  let cumulativeSum = 0;
  const cumulativePoints = trendPoints.map((pt) => {
    cumulativeSum += pt.ordersCount;
    return {
      label: pt.label,
      fullTimeLabel: pt.fullTimeLabel,
      cumulativeOrders: cumulativeSum,
      ordersCount: pt.ordersCount,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-2xl text-xs space-y-1 text-white">
          <p className="font-bold text-slate-300 border-b border-slate-800 pb-1 font-mono">
            {data.fullTimeLabel || label}
          </p>
          <div className="flex items-center justify-between gap-4 text-orange-400 font-extrabold pt-1">
            <span>Volume:</span>
            <span>{data.ordersCount} orders</span>
          </div>
          {data.revenue !== undefined && (
            <div className="flex items-center justify-between gap-4 text-emerald-400 font-mono">
              <span>Revenue:</span>
              <span>₹{data.revenue.toLocaleString()}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. DAILY SUMMARY Line Chart */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              DAILY SUMMARY ({timeRangeLabel.toUpperCase()})
            </h3>
            <p className="text-[11px] text-slate-400">
              Orders stream timeline breakdown over selected period
            </p>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="ordersCount"
                stroke="#ea580c"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. MONTHLY SUMMARY / CUMULATIVE Line Chart */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-500" />
              MONTHLY SUMMARY / CUMULATIVE TREND
            </h3>
            <p className="text-[11px] text-slate-400">
              Cumulative trajectory of completed orders
            </p>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumulativePoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="cumulativeOrders"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
