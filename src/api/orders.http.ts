const BASE = (typeof process !== 'undefined' && process.env.API_BASE) || 'http://YOUR_API_BASE_HERE';

export type OrderStatus = 'Created' | 'Accepted' | 'In Progress' | 'Resolved' | 'Rejected' | 'Completed';
export type OrderItem = { productId: number | string; name?: string; price?: number; qty: number };
export type Order = { id: string; orderNumber: string; supplier: string; date: string; total: number; itemsCount: number; items?: OrderItem[]; status: OrderStatus; statusHistory?: Array<{ status: OrderStatus; ts: string; by?: string }>; };

async function getJson(res: Response) {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchOrdersForConsumer(consumerId?: string | number, supplier?: string) {
  const url = new URL(`${BASE}/api/orders`);
  if (supplier) url.searchParams.set('supplier', String(supplier));
  if (consumerId) url.searchParams.set('consumerId', String(consumerId));
  const res = await fetch(url.toString(), { method: 'GET' });
  return getJson(res) as Promise<Order[]>;
}

export async function fetchOrderById(id: string) {
  const res = await fetch(`${BASE}/api/orders/${encodeURIComponent(id)}`, { method: 'GET' });
  return getJson(res) as Promise<Order | null>;
}

export async function placeOrderFromCart(items: OrderItem[], total: number, consumerId?: string | number) {
  const res = await fetch(`${BASE}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, total, consumerId }) });
  return getJson(res) as Promise<Order>;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, by?: string) {
  const res = await fetch(`${BASE}/api/orders/${encodeURIComponent(orderId)}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus, by }) });
  return getJson(res) as Promise<Order>;
}

export default { fetchOrdersForConsumer, fetchOrderById, placeOrderFromCart, updateOrderStatus };
