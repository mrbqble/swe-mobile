import httpClient from './httpClient';

export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
export type OrderItemCreate = { product_id: number | string; qty: number };
export type Order = any;

export async function listOrders(params: { page?: number; size?: number; status?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.size) q.set('size', String(params.size));
  if (params.status) q.set('status', String(params.status));
  return httpClient.fetchJson(`/orders?${q.toString()}`) as Promise<any>;
}

export async function fetchOrdersForConsumer(consumerId?: string | number, supplier?: string) {
  // Backend exposes GET /orders which returns a paginated response for the authenticated user
  // We'll call that and extract items.
  const res = await listOrders({ page: 1, size: PAGINATION.ORDERS_PAGE_SIZE });
  const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : res?.data || [];
  return items as Promise<any[]>;
}

export async function getOrder(orderId: number | string) {
  return httpClient.fetchJson(`/orders/${encodeURIComponent(String(orderId))}`) as Promise<Order>;
}

// Create an order. Expected payload: { supplier_id: number, items: [{ product_id, qty }] }
export async function createOrder(supplier_id: number | undefined, items: OrderItemCreate[]) {
  const body: any = { items };
  if (typeof supplier_id !== 'undefined') body.supplier_id = supplier_id;
  return httpClient.fetchJson('/orders', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }) as Promise<Order>;
}

// Update order status (PATCH expected by backend)
export async function updateOrderStatus(orderId: number | string, status: string) {
  return httpClient.fetchJson(`/orders/${encodeURIComponent(String(orderId))}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    headers: { 'Content-Type': 'application/json' },
  }) as Promise<Order>;
}

export async function fetchOrderById(orderId: string | number) {
  return getOrder(orderId);
}

export async function placeOrderFromCart(items: Array<any>, total: number, consumerId?: string | number) {
  // Determine supplier_id from items when possible (use first item's supplierId)
  const supplier_id = items && items.length > 0 ? items[0].supplierId || items[0].supplier_id : undefined;
  // Backend expects { supplier_id, items: [{ product_id, qty }] }
  const payload = {
    supplier_id: supplier_id ? Number(supplier_id) : undefined,
    items: items.map((it: any) => ({ product_id: it.productId || it.product_id || it.id, qty: it.qty || it.quantity || 1 })),
  };
  return createOrder(payload.supplier_id, payload.items as any[]);
}

export default { listOrders, getOrder, createOrder, updateOrderStatus };
