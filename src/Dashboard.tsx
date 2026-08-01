import { Header } from './Header';
import { KPICards } from './KPICard';
import { ExecutiveSummary } from './ExecutiveSummary';
import { DailyLeaderboard } from './DailyLeaderboard';
import { TopDestinationsWidget } from './TopDestinationsWidget';
import { SalesCharts } from './SalesCharts';
import { OrdersTable } from './OrdersTable';
import { SupabaseConnectModal } from './SupabaseConnectModal';
import { useSalesData, TimeRangeFilter } from './useSalesData';
import { getSupabaseConfig } from './supabase';

export const Dashboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<TimeRangeFilter>('7d');
  const [destinationFilter, setDestinationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState<number>(60);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const {
    orders,
    allOrdersCount,
    destinations,
    availableStatuses,
    kpis,
    trendPoints,
    destinationPerformance,
    loading,
    error,
    lastUpdated,
    refreshing,
    refetch,
    destinationsMap,
  } = useSalesData({
    timeRange: timeFilter,
    destinationFilter,
    statusFilter,
    autoRefreshSeconds,
  });

  const config = getSupabaseConfig();
  const isConnected = config.isConfigured && !error;

  const getTimeLabel = (filter: TimeRangeFilter) => {
    switch (filter) {
      case '24h':
        return '24 Hours';
      case '7d':
        return '7 Days';
      case '14d':
        return '14 Days';
      case '30d':
        return '30 Days';
      case 'all':
      default:
        return 'All Time';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Header Bar */}
      <Header
        lastUpdated={lastUpdated}
        refreshing={refreshing}
        onRefresh={refetch}
        autoRefreshSeconds={autoRefreshSeconds}
        setAutoRefreshSeconds={setAutoRefreshSeconds}
        isConnected={isConnected}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="p-6 space-y-6 max-w-[1600px] w-full mx-auto flex-1">
        {/* Unconfigured or Error Alert Banner */}
        {!config.isConfigured ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-sm text-amber-950">Supabase Connection Required</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  To view live sales from your backend, click below to paste your Supabase API URL and Key.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-colors shrink-0"
            >
              Connect Supabase
            </button>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Database Error</p>
                <p className="text-xs text-rose-700 font-mono mt-0.5">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refetch}
                className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-xs font-semibold text-rose-900 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white transition-colors"
              >
                Update Key
              </button>
            </div>
          </div>
        ) : null}

        {/* Loading state skeleton */}
        {loading ? (
          <div className="space-y-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-36 bg-white border border-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 h-80 bg-white border border-slate-200 rounded-2xl animate-pulse" />
              <div className="h-80 bg-slate-900 rounded-2xl animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            {/* Top Row: 4 KPI Cards */}
            <KPICards metrics={kpis} timeRangeLabel={getTimeLabel(timeFilter)} />

            {/* Executive Sales Performance Summary */}
            <ExecutiveSummary
              metrics={kpis}
              destinations={destinationPerformance}
              timeRangeLabel={getTimeLabel(timeFilter)}
            />

            {/* Middle Row: Leaderboard (Left 2 cols) & Top Destinations (Right 1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <DailyLeaderboard
                  destinations={destinationPerformance}
                  timeRangeLabel={getTimeLabel(timeFilter)}
                />
              </div>

              <div>
                <TopDestinationsWidget destinations={destinationPerformance} />
              </div>
            </div>

            {/* Bottom Row: Daily Summary & Monthly Summary Charts */}
            <SalesCharts
              trendPoints={trendPoints}
              timeRangeLabel={getTimeLabel(timeFilter)}
            />

            {/* Live Orders Stream Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-orange-600" />
                    LIVE ORDERS STREAM
                  </h2>
                  <p className="text-xs text-slate-500">
                    Showing records for {getTimeLabel(timeFilter)} from Supabase backend
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                  <Zap className="w-3.5 h-3.5 text-orange-600" />
                  <span>{orders.length} Records</span>
                </div>
              </div>

              <OrdersTable
                orders={orders}
                destinations={destinations}
                availableStatuses={availableStatuses}
                destinationsMap={destinationsMap}
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
                destinationFilter={destinationFilter}
                setDestinationFilter={setDestinationFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            </div>
          </>
        )}
      </main>

      {/* Supabase Connection Modal */}
      <SupabaseConnectModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onCredentialsChanged={refetch}
        isConnected={isConnected}
        errorMessage={error}
      />
    </div>
  );
};
