import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
  Globe,
  Clock,
  User,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Package,
} from 'lucide-react';
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
import { TimeRangeFilter } from '../hooks/useSalesData';

interface OrdersTableProps {
  orders: Order[];
  destinations: Destination[];
  availableStatuses: string[];
  destinationsMap: Map<string | number, string>;
  timeFilter: TimeRangeFilter;
  setTimeFilter: (range: TimeRangeFilter) => void;
  destinationFilter: string;
  setDestinationFilter: (dest: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

type SortField = 'id' | 'customer' | 'destination' | 'date' | 'amount' | 'status';
type SortOrder = 'asc' | 'desc';

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  destinations,
  availableStatuses,
  destinationsMap,
  timeFilter,
  setTimeFilter,
  destinationFilter,
  setDestinationFilter,
  statusFilter,
  setStatusFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter & Search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderId = getOrderId(order).toLowerCase();
      const customer = getCustomerName(order).toLowerCase();
      const dest = getDestinationName(order, destinationsMap).toLowerCase();
      const status = getOrderStatus(order).toLowerCase();
      const amount = getOrderAmount(order).toString();

      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      return (
        orderId.includes(query) ||
        customer.includes(query) ||
        dest.includes(query) ||
        status.includes(query) ||
        amount.includes(query)
      );
    });
  }, [orders, searchQuery, destinationsMap]);

  // Sort
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let aVal: any = '';
      let bVal: any = '';

      switch (sortField) {
        case 'id':
          aVal = getOrderId(a);
          bVal = getOrderId(b);
          break;
        case 'customer':
          aVal = getCustomerName(a).toLowerCase();
          bVal = getCustomerName(b).toLowerCase();
          break;
        case 'destination':
          aVal = getDestinationName(a, destinationsMap).toLowerCase();
          bVal = getDestinationName(b, destinationsMap).toLowerCase();
          break;
        case 'date':
          aVal = new Date(getOrderTimestamp(a)).getTime();
          bVal = new Date(getOrderTimestamp(b)).getTime();
          break;
        case 'amount':
          aVal = getOrderAmount(a);
          bVal = getOrderAmount(b);
          break;
        case 'status':
          aVal = getOrderStatus(a).toLowerCase();
          bVal = getOrderStatus(b).toLowerCase();
          break;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredOrders, sortField, sortOrder, destinationsMap]);

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedOrders.slice(start, start + itemsPerPage);
  }, [sortedOrders, currentPage]);

  // Reset to page 1 if query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, timeFilter, destinationFilter, statusFilter]);

  // Check if order is "NEW" (created in last 15 minutes)
  const isNewOrder = (order: Order) => {
    const orderTime = new Date(getOrderTimestamp(order)).getTime();
    const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
    return orderTime >= fifteenMinsAgo;
  };

  // Check if order is "HIGH VALUE" (amount >= $500 or top tier)
  const isHighValue = (order: Order) => {
    return getOrderAmount(order) >= 500;
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'paid' || s === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          {status}
        </span>
      );
    }
    if (s === 'pending' || s === 'processing' || s === 'unpaid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Clock className="w-3 h-3" />
          {status}
        </span>
      );
    }
    if (s === 'shipped' || s === 'in_transit') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
          <Package className="w-3 h-3" />
          {status}
        </span>
      );
    }
    if (s === 'cancelled' || s === 'refunded' || s === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-3 h-3" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
        {status}
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Filters & Search Toolbar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, customers, destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Time Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
            <span className="px-2 text-slate-400 font-medium text-xs">Time:</span>
            {(['24h', '7d', '14d', '30d', 'all'] as TimeRangeFilter[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeFilter(range)}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors uppercase ${
                  timeFilter === range
                    ? 'bg-orange-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Destination Dropdown */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                All Destinations
              </option>
              {destinations.map((d) => {
                const name = d.name || d.destination_name || d.code || String(d.id);
                const val = String(d.id || name);
                return (
                  <option key={val} value={name} className="bg-slate-900 text-slate-200">
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs capitalize"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                All Statuses
              </option>
              {availableStatuses.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-slate-200 capitalize">
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse text-xs text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium select-none">
              <th
                onClick={() => handleSort('id')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Order ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('customer')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Customer</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('destination')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Destination</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('date')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Order Date / Time</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('amount')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Amount</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('status')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th className="py-3 px-4 text-right">Highlights</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order, idx) => {
                const id = getOrderId(order);
                const customer = getCustomerName(order);
                const destination = getDestinationName(order, destinationsMap);
                const timestamp = getOrderTimestamp(order);
                const amount = getOrderAmount(order);
                const status = getOrderStatus(order);
                const isNew = isNewOrder(order);
                const isHigh = isHighValue(order);

                const formattedTime = new Date(timestamp).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                });

                return (
                  <tr
                    key={`${id}-${timestamp}-${idx}`}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isNew ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    {/* Order ID */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {id}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[140px]">{customer}</span>
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="font-medium text-slate-200">{destination}</span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {formattedTime}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-100">
                      ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 capitalize">
                      {getStatusBadge(status)}
                    </td>

                    {/* Highlights */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isNew && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                            <Zap className="w-2.5 h-2.5" />
                            NEW
                          </span>
                        )}
                        {isHigh && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Sparkles className="w-2.5 h-2.5" />
                            HIGH VALUE
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Search className="w-8 h-8 opacity-40 text-slate-400" />
                    <p className="text-sm font-medium">No matching orders found</p>
                    <p className="text-xs text-slate-600">
                      Try adjusting your time frame, filters, or search terms.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing{' '}
          <span className="font-medium text-slate-200 font-mono">
            {sortedOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
          </span>{' '}
          to{' '}
          <span className="font-medium text-slate-200 font-mono">
            {Math.min(currentPage * itemsPerPage, sortedOrders.length)}
          </span>{' '}
          of{' '}
          <span className="font-medium text-slate-200 font-mono">
            {sortedOrders.length}
          </span>{' '}
          filtered orders
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono text-slate-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
