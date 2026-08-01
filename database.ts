export interface Destination {
  id?: string | number;
  name?: string;
  destination_name?: string;
  code?: string;
  country?: string;
  region?: string;
  created_at?: string;
  [key: string]: any;
}

export interface Order {
  id: string | number;
  order_id?: string | number;
  customer_name?: string;
  customer?: string;
  client_name?: string;
  destination_id?: string | number;
  destination_name?: string;
  destination?: string | Destination;
  destinations?: Destination;
  created_at?: string;
  order_date?: string;
  date?: string;
  amount?: number;
  total_amount?: number;
  total?: number;
  price?: number;
  status?: string;
  items_count?: number;
  [key: string]: any;
}

// Field Extractor Helpers to accommodate variable column names gracefully
export function getOrderId(order: Order): string {
  if (order.id !== undefined && order.id !== null) return String(order.id);
  if (order.order_id !== undefined && order.order_id !== null) return String(order.order_id);
  return 'ORD-UNKNOWN';
}

export function getCustomerName(order: Order): string {
  return order.customer_name || order.customer || order.client_name || 'Guest Customer';
}

export function getDestinationName(order: Order, destinationsMap?: Map<string | number, string>): string {
  if (order.destination_name) return order.destination_name;
  if (typeof order.destination === 'string') return order.destination;
  if (typeof order.destination === 'object' && order.destination !== null) {
    return order.destination.name || order.destination.destination_name || 'Destination';
  }
  if (typeof order.destinations === 'object' && order.destinations !== null) {
    return order.destinations.name || order.destinations.destination_name || 'Destination';
  }
  if (order.destination_id !== undefined && order.destination_id !== null && destinationsMap) {
    const matched = destinationsMap.get(order.destination_id) || destinationsMap.get(String(order.destination_id));
    if (matched) return matched;
  }
  if (order.destination_id) return `Dest #${order.destination_id}`;
  return 'Main Destination';
}

export function getOrderAmount(order: Order): number {
  const val = order.amount ?? order.total_amount ?? order.total ?? order.price;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function getOrderTimestamp(order: Order): string {
  const raw = order.created_at || order.order_date || order.date;
  if (!raw) return new Date().toISOString();
  // Validate if valid date string
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export function getOrderStatus(order: Order): string {
  return (order.status || 'completed').toLowerCase();
}
