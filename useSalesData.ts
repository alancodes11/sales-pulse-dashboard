import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabaseClient, getSupabaseConfig } from '../lib/supabase';
import {
  Order,
  Destination,
  getOrderId,
  getCustomerName,
  getDestinationName,
  getOrderAmount,
  getOrderTimestamp,
  getOrderStatus,
} from '../types/database';

export type TimeRangeFilter = '24h' | '7d' | '14d' | '30d' | 'all';

export interface TrendPoint {
  label: string; // e.g. "08:00" or "Jul 25"
  fullTimeLabel: string;
  revenue: number;
  ordersCount: number;
}

export interface DestinationPerformancePoint {
  destinationName: string;
  revenue: number;
  ordersCount: number;
  dayCount: number;
  arpu: number; // Average Revenue Per Unit/Order
  targetPercent: number;
  prevPeriodCount: number;
}

export interface KPIMetrics {
  currentOrders: number;
  currentRevenue: number;
  periodOrders: number;
  periodRevenue: number;
  prevPeriodOrders: number;
  prevPeriodRevenue: number;
  monthlyOrders: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  topDestination: string;
  topDestinationRevenue: number;
  salesGrowthPercent: number;
}

export interface UseSalesDataOptions {
  timeRange?: TimeRangeFilter;
  destinationFilter?: string;
  statusFilter?: string;
  autoRefreshSeconds?: number;
}

export function useSalesData(options: UseSalesDataOptions = {}) {
  const {
    timeRange = '7d',
    destinationFilter = 'all',
    statusFilter = 'all',
    autoRefreshSeconds = 60,
  } = options;

  const [rawOrders, setRawOrders] = useState<Order[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Map destination ID to name for fast lookup
  const destinationsMap = useMemo(() => {
    const map = new Map<string | number, string>();
    destinations.forEach((d) => {
      const name = d.name || d.destination_name || d.code || String(d.id);
      if (d.id !== undefined && d.id !== null) {
        map.set(d.id, name);
        map.set(String(d.id), name);
      }
    });
    return map;
  }, [destinations]);

  // Convert timeRange to days
  const rangeDays = useMemo(() => {
    switch (timeRange) {
      case '24h':
        return 1;
      case '7d':
        return 7;
      case '14d':
        return 14;
      case '30d':
        return 30;
      case 'all':
      default:
        return 365;
    }
  }, [timeRange]);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      setError('Supabase connection details missing. Please configure VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Failed to create Supabase client. Please check your credentials.');
      setLoading(false);
      return;
    }

    if (isManualRefresh) {
      setRefreshing(true);
    } else if (!rawOrders.length) {
      setLoading(true);
    }

    try {
      setError(null);

      // 1. Fetch destinations
      const { data: destData, error: destErr } = await supabase
        .from('destinations')
        .select('*');

      if (destErr) {
        if (destErr.message?.toLowerCase().includes('api key') || destErr.message?.toLowerCase().includes('jwt')) {
          throw new Error(`Supabase API Key Error: ${destErr.message}. Please check VITE_SUPABASE_ANON_KEY.`);
        }
        console.warn('Destinations query notice:', destErr.message);
      } else if (destData) {
        setDestinations(destData as Destination[]);
      }

      // 2. Fetch orders
      let fetchedOrders: Order[] = [];
      const { data: joinedOrders, error: joinErr } = await supabase
        .from('orders')
        .select('*, destinations(*)');

      if (!joinErr && joinedOrders) {
        fetchedOrders = joinedOrders as Order[];
      } else {
        if (joinErr?.message?.toLowerCase().includes('api key') || joinErr?.message?.toLowerCase().includes('jwt')) {
          throw new Error(`Supabase API Key Error: ${joinErr.message}. Please check VITE_SUPABASE_ANON_KEY.`);
        }

        const { data: plainOrders, error: plainErr } = await supabase
          .from('orders')
          .select('*');

        if (plainErr) {
          throw new Error(plainErr.message || 'Failed to query orders table.');
        }
        fetchedOrders = (plainOrders || []) as Order[];
      }

      setRawOrders(fetchedOrders);

      // Extract unique statuses
      const statuses = Array.from(
        new Set(fetchedOrders.map((o) => getOrderStatus(o)).filter(Boolean))
      );
      setAvailableStatuses(statuses);

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching sales data from Supabase:', err);
      setError(err?.message || 'An error occurred while communicating with Supabase.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [rawOrders.length]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto Refresh Interval
  useEffect(() => {
    if (!autoRefreshSeconds || autoRefreshSeconds <= 0) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, autoRefreshSeconds * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshSeconds, fetchData]);

  // Filter raw orders into current and previous time windows
  const processedData = useMemo(() => {
    const now = new Date();
    const rangeMs = rangeDays * 24 * 60 * 60 * 1000;
    const currentWindowStart = new Date(now.getTime() - rangeMs);
    const previousWindowStart = new Date(now.getTime() - rangeMs * 2);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Apply destination & status filters helper
    const matchesFilters = (order: Order) => {
      if (statusFilter !== 'all') {
        if (getOrderStatus(order).toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      if (destinationFilter !== 'all') {
        const destName = getDestinationName(order, destinationsMap).toLowerCase();
        const filterVal = destinationFilter.toLowerCase();
        const destIdStr = String(order.destination_id || '').toLowerCase();
        if (destName !== filterVal && destIdStr !== filterVal) {
          return false;
        }
      }

      return true;
    };

    // Filter all orders matching status/destination first
    const validFilteredOrders = rawOrders.filter(matchesFilters);

    // Today orders (last 24h / today)
    const todayOrders = validFilteredOrders.filter((o) => {
      const d = new Date(getOrderTimestamp(o));
      return d >= todayStart && d <= now;
    });

    // Current selected period orders
    const currentPeriodOrders = validFilteredOrders.filter((order) => {
      const orderDate = new Date(getOrderTimestamp(order));
      if (timeRange === 'all') return true;
      return orderDate >= currentWindowStart && orderDate <= now;
    });

    // Previous period orders
    const previousPeriodOrders = validFilteredOrders.filter((order) => {
      const orderDate = new Date(getOrderTimestamp(order));
      if (timeRange === 'all') return false;
      return orderDate >= previousWindowStart && orderDate < currentWindowStart;
    });

    // Monthly orders (MTD)
    const monthlyOrdersList = validFilteredOrders.filter((order) => {
      const orderDate = new Date(getOrderTimestamp(order));
      return orderDate >= monthStart && orderDate <= now;
    });

    // Sort current period orders descending
    currentPeriodOrders.sort(
      (a, b) =>
        new Date(getOrderTimestamp(b)).getTime() -
        new Date(getOrderTimestamp(a)).getTime()
    );

    // Calculations
    const currentOrders = todayOrders.length;
    const currentRevenue = todayOrders.reduce((s, o) => s + getOrderAmount(o), 0);

    const periodOrders = currentPeriodOrders.length;
    const periodRevenue = currentPeriodOrders.reduce((s, o) => s + getOrderAmount(o), 0);

    const prevPeriodOrders = previousPeriodOrders.length;
    const prevPeriodRevenue = previousPeriodOrders.reduce((s, o) => s + getOrderAmount(o), 0);

    const monthlyOrders = monthlyOrdersList.length;
    const monthlyRevenue = monthlyOrdersList.reduce((s, o) => s + getOrderAmount(o), 0);

    const averageOrderValue = periodOrders > 0 ? periodRevenue / periodOrders : 0;

    let salesGrowthPercent = 0;
    if (prevPeriodRevenue > 0) {
      salesGrowthPercent = ((periodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100;
    } else if (periodRevenue > 0) {
      salesGrowthPercent = 100;
    }

    // Leaderboard map per destination
    const destStatsMap = new Map<
      string,
      {
        revenue: number;
        ordersCount: number;
        dayCount: number;
        prevCount: number;
      }
    >();

    validFilteredOrders.forEach((o) => {
      const destName = getDestinationName(o, destinationsMap);
      const amt = getOrderAmount(o);
      const d = new Date(getOrderTimestamp(o));

      const existing = destStatsMap.get(destName) || {
        revenue: 0,
        ordersCount: 0,
        dayCount: 0,
        prevCount: 0,
      };

      const isCurrentPeriod = timeRange === 'all' || (d >= currentWindowStart && d <= now);
      const isPrevPeriod = timeRange !== 'all' && (d >= previousWindowStart && d < currentWindowStart);
      const isToday = d >= todayStart && d <= now;

      if (isCurrentPeriod) {
        existing.revenue += amt;
        existing.ordersCount += 1;
      }
      if (isToday) {
        existing.dayCount += 1;
      }
      if (isPrevPeriod) {
        existing.prevCount += 1;
      }

      destStatsMap.set(destName, existing);
    });

    let topDestination = 'N/A';
    let topDestinationRevenue = 0;

    const destinationPerformance: DestinationPerformancePoint[] = [];

    destStatsMap.forEach((val, key) => {
      if (val.revenue > topDestinationRevenue) {
        topDestinationRevenue = val.revenue;
        topDestination = key;
      }

      const arpu = val.ordersCount > 0 ? val.revenue / val.ordersCount : 0;
      // Mock target baseline e.g. 200 orders per period
      const targetPercent = Math.min(200, Math.round((val.ordersCount / 200) * 100));

      destinationPerformance.push({
        destinationName: key,
        revenue: val.revenue,
        ordersCount: val.ordersCount,
        dayCount: val.dayCount,
        arpu,
        targetPercent,
        prevPeriodCount: val.prevCount,
      });
    });

    destinationPerformance.sort((a, b) => b.revenue - a.revenue);

    const kpis: KPIMetrics = {
      currentOrders,
      currentRevenue,
      periodOrders,
      periodRevenue,
      prevPeriodOrders,
      prevPeriodRevenue,
      monthlyOrders,
      monthlyRevenue,
      averageOrderValue,
      topDestination,
      topDestinationRevenue,
      salesGrowthPercent,
    };

    // Build trend points for chart
    const trendPoints: TrendPoint[] = [];

    if (timeRange === '24h') {
      // 24 hourly points
      for (let i = 23; i >= 0; i--) {
        const bucketTime = new Date(now.getTime() - i * 60 * 60 * 1000);
        const label = bucketTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        const bucketStart = new Date(bucketTime);
        bucketStart.setMinutes(0, 0, 0);
        const bucketEnd = new Date(bucketTime);
        bucketEnd.setMinutes(59, 59, 999);

        const bucketOrders = currentPeriodOrders.filter((o) => {
          const orderDate = new Date(getOrderTimestamp(o));
          return orderDate >= bucketStart && orderDate <= bucketEnd;
        });

        const revenue = bucketOrders.reduce((sum, o) => sum + getOrderAmount(o), 0);

        trendPoints.push({
          label,
          fullTimeLabel: label,
          revenue,
          ordersCount: bucketOrders.length,
        });
      }
    } else {
      // Daily points for 7d, 14d, 30d, all
      const daysCount = timeRange === 'all' ? 30 : rangeDays;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);

        const dEnd = new Date(d);
        dEnd.setHours(23, 59, 59, 999);

        const dayStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const fullDateStr = d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        const dayOrders = currentPeriodOrders.filter((o) => {
          const orderDate = new Date(getOrderTimestamp(o));
          return orderDate >= d && orderDate <= dEnd;
        });

        const revenue = dayOrders.reduce((sum, o) => sum + getOrderAmount(o), 0);

        trendPoints.push({
          label: dayStr,
          fullTimeLabel: fullDateStr,
          revenue,
          ordersCount: dayOrders.length,
        });
      }
    }

    return {
      filteredOrders: currentPeriodOrders,
      allOrdersCount: rawOrders.length,
      kpis,
      trendPoints,
      destinationPerformance,
    };
  }, [
    rawOrders,
    rangeDays,
    timeRange,
    destinationFilter,
    statusFilter,
    destinationsMap,
  ]);

  return {
    orders: processedData.filteredOrders,
    allOrdersCount: processedData.allOrdersCount,
    destinations,
    availableStatuses,
    kpis: processedData.kpis,
    trendPoints: processedData.trendPoints,
    destinationPerformance: processedData.destinationPerformance,
    loading,
    error,
    lastUpdated,
    refreshing,
    refetch: () => fetchData(true),
    destinationsMap,
  };
}
