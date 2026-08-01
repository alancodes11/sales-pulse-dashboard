import React from 'react';
import { DestinationPerformancePoint } from '../hooks/useSalesData';
import { BarChart2, Globe } from 'lucide-react';

interface TopDestinationsWidgetProps {
  destinations: DestinationPerformancePoint[];
}

export const TopDestinationsWidget: React.FC<TopDestinationsWidgetProps> = ({
  destinations,
}) => {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <div className="p-1.5 rounded-lg bg-slate-800 text-orange-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            TOP DESTINATIONS
          </h3>
        </div>

        {/* List of Destinations with white badge pill on right */}
        <div className="space-y-2.5">
          {destinations.slice(0, 7).map((item) => (
            <div
              key={item.destinationName}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-xs font-medium text-slate-200 truncate">
                  {item.destinationName}
                </span>
              </div>

              {/* White pill badge */}
              <span className="px-3 py-1 rounded-full bg-white text-slate-950 font-extrabold font-mono text-xs shadow-sm shrink-0">
                {item.ordersCount}
              </span>
            </div>
          ))}

          {destinations.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              No top destination records.
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Order Volume Ranked</span>
        <span className="text-orange-400 font-semibold font-mono">
          {destinations.reduce((s, d) => s + d.ordersCount, 0)} Total
        </span>
      </div>
    </div>
  );
};
