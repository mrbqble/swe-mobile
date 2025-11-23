import httpClient from './httpClient';
import { PAGINATION } from '../constants';

export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
export type OrderItemCreate = { product_id: number | string; qty: number };
export type Order = any;

export async function listOrders(params: { page?: number; size?: number; status?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.size) q.set('size', String(params.size));
  if (params.status) q.set('status', String(params.status));
  const res = await httpClient.fetchJson(`/orders?${q.toString()}`);
  // Backend returns pagination object { items: [...], page, size, total, pages }
  return res;
}

export async function fetchOrdersForConsumer(consumerId?: string | number, supplier?: string) {
  // Backend exposes GET /orders which returns a paginated response for the authenticated user
  // Backend automatically filters by role (consumer sees own orders, supplier sees supplier orders)
  const res = await listOrders({ page: 1, size: PAGINATION.ORDERS_PAGE_SIZE });
  const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
  // Normalize order data for frontend
  return items.map((order: any) => normalizeOrder(order));
}

// Normalize backend order structure to frontend format
function normalizeOrder(order: any) {
  const total = typeof order.total_kzt === 'string' ? parseFloat(order.total_kzt) : Number(order.total_kzt || 0);
  const items = order.items || [];
  const itemsCount = items.length;

  // Calculate total items quantity
  const totalQty = items.reduce((sum: number, item: any) => sum + (item.qty || 0), 0);

  // Helper to format full name from first_name and last_name
  const formatFullName = (person: any) => {
    if (!person) return '';
    // Check if user object exists (nested relationship)
    const user = person.user || person;
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    return person.organization_name || person.company_name || person.name || '';
  };

  return {
    id: order.id,
    orderNumber: `#${order.id}`,
    supplier_id: order.supplier_id,
    consumer_id: order.consumer_id,
    supplier: order.supplier?.company_name || formatFullName(order.supplier) || order.supplier?.name || '',
    consumer: formatFullName(order.consumer) || order.consumer?.organization_name || order.consumer?.name || '',
    status: order.status || 'pending',
    total: total,
    total_kzt: order.total_kzt,
    date: order.created_at,
    created_at: order.created_at,
    items: items.map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      productId: item.product_id,
      qty: item.qty,
      quantity: item.qty,
      unit_price_kzt: item.unit_price_kzt,
      price: typeof item.unit_price_kzt === 'string' ? parseFloat(item.unit_price_kzt) : Number(item.unit_price_kzt || 0),
      name: item.product?.name || `Product ${item.product_id}`,
      description: item.product?.description || '',
    })),
    itemsCount: itemsCount,
    totalQty: totalQty,
  };
}

export async function getOrder(orderId: number | string) {
  const order = await httpClient.fetchJson(`/orders/${encodeURIComponent(String(orderId))}`);
  return normalizeOrder(order);
}

// Create an order. Expected payload: { supplier_id: number, items: [{ product_id, qty }] }
export async function createOrder(supplier_id: number, items: OrderItemCreate[]) {
  if (!supplier_id) {
    throw new Error('supplier_id is required to create an order');
  }
  const body = {
    supplier_id: Number(supplier_id),
    items: items.map(item => ({
      product_id: Number(item.product_id),
      qty: Number(item.qty)
    }))
  };
  const order = await httpClient.fetchJson('/orders', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });
  return normalizeOrder(order);
}

// Update order status (PATCH expected by backend)
export async function updateOrderStatus(orderId: number | string, status: string) {
  // Backend expects lowercase status values: pending, accepted, rejected, in_progress, completed
  const normalizedStatus = status.toLowerCase();
  const order = await httpClient.fetchJson(`/orders/${encodeURIComponent(String(orderId))}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: normalizedStatus }),
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizeOrder(order);
}

export async function fetchOrderById(orderId: string | number) {
  return getOrder(orderId);
}

export async function placeOrderFromCart(items: Array<any>, total: number, consumerId?: string | number) {
  // Determine supplier_id from items when possible (use first item's supplierId)
  const supplier_id = items && items.length > 0 ? items[0].supplierId || items[0].supplier_id : undefined;

  if (!supplier_id) {
    throw new Error('Supplier ID is required to place an order. All items must be from the same supplier.');
  }

  // Backend expects { supplier_id, items: [{ product_id, qty }] }
  const payload = {
    supplier_id: Number(supplier_id),
    items: items.map((it: any) => ({
      product_id: Number(it.productId || it.product_id || it.id),
      qty: Number(it.qty || it.quantity || 1)
    })),
  };

  const order = await createOrder(payload.supplier_id, payload.items as any[]);
  return normalizeOrder(order);
}

export default {
  listOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  fetchOrderById,
  fetchOrdersForConsumer,
  placeOrderFromCart
};
