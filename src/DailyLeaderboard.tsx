import React from 'react';
import { DestinationPerformancePoint } from '../hooks/useSalesData';
import { Award, Target, Flame } from 'lucide-react';

interface DailyLeaderboardProps {
  destinations: DestinationPerformancePoint[];
  timeRangeLabel: string;
}

export const DailyLeaderboard: React.FC<DailyLeaderboardProps> = ({
  destinations,
  timeRangeLabel,
}) => {
  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 1000).toFixed(1)}K`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${Math.round(val)}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" />
              DAILY LEADERBOARD ({timeRangeLabel.toUpperCase()})
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Performance breakdown across top sales destinations & representatives
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-2">
                <th className="py-2.5 px-2 text-center w-8">#</th>
                <th className="py-2.5 px-3">SALES_R / DESTINATION</th>
                <th className="py-2.5 px-3 text-center">
                  <div className="flex flex-col items-center">
                    <span>#DAY</span>
                    <span className="text-[9px] text-slate-400 font-normal">24h</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center font-bold text-orange-600">
                  #{timeRangeLabel.toUpperCase()}
                </th>
                <th className="py-2.5 px-3 text-right">REV</th>
                <th className="py-2.5 px-3 text-right">ARPU</th>
                <th className="py-2.5 px-3 text-center w-36">TARGET</th>
                <th className="py-2.5 px-3 text-center">#PV_MONTH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {destinations.slice(0, 8).map((item, index) => {
                const rank = index + 1;
                const isTop3 = rank <= 3;

                return (
                  <tr key={item.destinationName} className="hover:bg-slate-50 transition-colors">
                    {/* Rank */}
                    <td className="py-3 px-2 text-center font-extrabold font-mono text-slate-700">
                      {isTop3 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs">
                          {rank}
                        </span>
                      ) : (
                        rank
                      )}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-3 font-semibold text-slate-800 truncate max-w-[180px]">
                      {item.destinationName}
                    </td>

                    {/* Day Count */}
                    <td className="py-3 px-3 text-center font-mono">
                      <span className="font-bold text-slate-900">{item.dayCount}</span>
                      <div className="text-[10px] text-slate-400 font-sans">
                        ₹{(item.arpu * item.dayCount / 1000).toFixed(1)}k
                      </div>
                    </td>

                    {/* MTD / Period Count */}
                    <td className="py-3 px-3 text-center font-extrabold font-mono text-orange-600 text-sm">
                      {item.ordersCount}
                    </td>

                    {/* Revenue */}
                    <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(item.revenue)}
                    </td>

                    {/* ARPU */}
                    <td className="py-3 px-3 text-right text-slate-600 font-mono">
                      ₹{Math.round(item.arpu)}
                    </td>

                    {/* Target Progress Bar */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-700 font-mono w-8 text-right">
                          {item.targetPercent}%
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                            style={{ width: `${Math.min(100, item.targetPercent)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">200</span>
                      </div>
                    </td>

                    {/* Prev Month */}
                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      {item.prevPeriodCount}
                    </td>
                  </tr>
                );
              })}

              {destinations.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No destination sales records found in current view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
