import { Product } from '../helpers/types';
import { emitter } from '../helpers/events';
import { fetchProduct } from './catalog.mock';

export type OrderStatus = 'Created' | 'Accepted' | 'In Progress' | 'Resolved' | 'Rejected' | 'Completed';

export type OrderItem = { productId: number | string; name?: string; price?: number; qty: number };

export type Order = {
  id: string;
  orderNumber: string;
  supplier: string;
  date: string; // ISO or simple date (created date)
  total: number; // in local currency units
  itemsCount: number;
  items?: OrderItem[];
  status: OrderStatus;
  // history of status changes to support backend integration
  statusHistory?: Array<{ status: OrderStatus; ts: string; by?: string }>;
};

const mockOrders: Order[] = [
  { id: 'ord-1', orderNumber: 'ORD-001', supplier: 'TechPro Supply', date: '2024-01-15', total: 129000, itemsCount: 2, status: 'In Progress', statusHistory: [{ status: 'Created', ts: '2024-01-15T10:30:00Z' }, { status: 'Accepted', ts: '2024-01-15T11:15:00Z' }, { status: 'In Progress', ts: '2024-01-15T14:00:00Z' }] },
  { id: 'ord-2', orderNumber: 'ORD-002', supplier: 'Industrial Solutions', date: '2024-01-10', total: 3500, itemsCount: 1, status: 'Resolved', statusHistory: [{ status: 'Created', ts: '2024-01-10T09:00:00Z' }, { status: 'Resolved', ts: '2024-01-10T12:00:00Z' }] },
  { id: 'ord-3', orderNumber: 'ORD-003', supplier: 'TechPro Supply', date: '2024-01-08', total: 450000, itemsCount: 1, status: 'Accepted', statusHistory: [{ status: 'Created', ts: '2024-01-08T08:00:00Z' }, { status: 'Accepted', ts: '2024-01-08T09:30:00Z' }] },
];

export async function fetchOrdersForConsumer(consumerId?: string | number, supplier?: string) {
  // ignore consumerId for mock — return all or filter by supplier when provided
  await new Promise((r) => setTimeout(r, 200));
  if (supplier) {
    const s = String(supplier).toLowerCase();
    return mockOrders.filter(o => String(o.supplier || '').toLowerCase() === s);
  }
  return mockOrders;
}

export async function fetchOrderById(id: string) {
  await new Promise((r) => setTimeout(r, 120));
  return mockOrders.find(o => o.id === id) || null;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, by?: string) {
  await new Promise((r) => setTimeout(r, 120));
  const o = mockOrders.find(x => x.id === orderId);
  if (!o) return null;
  o.status = newStatus;
  o.statusHistory = o.statusHistory || [];
  o.statusHistory.push({ status: newStatus, ts: new Date().toISOString(), by });
  try { emitter.emit('ordersChanged'); } catch (e) {}
  return o;
}

export async function placeOrderFromCart(items: Array<OrderItem>, total: number, consumerId?: string | number) {
  // determine supplier from items when possible
  let supplierName = 'Various';
  try {
    const supplierSet = new Set<string>();
    const proms = items.map(async (it) => {
      // if item includes supplier info use it
      if ((it as any).supplier) {
        supplierSet.add(String((it as any).supplier));
        return null;
      }
      try {
        const p = await fetchProduct(it.productId as any);
        if (p && (p as any).supplier) supplierSet.add(String((p as any).supplier));
      } catch (e) { /* ignore */ }
      return null;
    });
    await Promise.all(proms);
    if (supplierSet.size === 1) supplierName = Array.from(supplierSet.values())[0];
  } catch (e) {
    // fallback to Various
  }

  // generate an order number
  const nextIndex = mockOrders.length + 1;
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: `ORD-${String(nextIndex).padStart(3, '0')}`,
    supplier: supplierName,
    date: new Date().toISOString().split('T')[0],
    total: total,
    itemsCount: items.reduce((s, it) => s + it.qty, 0),
    items: items,
    status: 'Created',
    statusHistory: [{ status: 'Created', ts: new Date().toISOString() }],
  };
  mockOrders.unshift(newOrder);
  // simulate async
  await new Promise((r) => setTimeout(r, 200));
  try { emitter.emit('ordersChanged'); } catch (e) {}
  return newOrder;
}
