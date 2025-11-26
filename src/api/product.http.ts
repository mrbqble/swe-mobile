import { Product, PaginatedResponse } from '../helpers/types';
import httpClient from './httpClient';

export type ListProductsParams = { supplier_id?: number; page?: number; size?: number; is_active?: boolean };

export async function listProducts(params: ListProductsParams = {}): Promise<PaginatedResponse<Product>> {
  const q = new URLSearchParams();
  if (params.supplier_id) q.set('supplier_id', String(params.supplier_id));
  if (params.page) q.set('page', String(params.page));
  if (params.size) q.set('size', String(params.size));
  if (typeof params.is_active === 'boolean') q.set('is_active', String(params.is_active));
  const path = `/products?${q.toString()}`;
  return httpClient.fetchJson(path) as Promise<PaginatedResponse<Product>>;
}

export async function fetchProduct(id: number | string): Promise<Product> {
  const p = await httpClient.fetchJson(`/products/${id}`);

  // Helper to format full name from first_name and last_name
  const formatFullName = (person: any) => {
    if (!person) return '';
    if (person.first_name && person.last_name) {
      return `${person.first_name} ${person.last_name}`.trim();
    }
    return person.company_name || person.organization_name || person.name || '';
  };

  // Normalize backend response to Product type
  return {
    id: p.id,
    name: p.name || '',
    description: p.description || '',
    price: typeof p.price_kzt === 'string' ? parseFloat(p.price_kzt) : Number(p.price_kzt || 0),
    currency: p.currency || '₸',
    stock: p.stock_qty ?? p.stock ?? 0,
    imageUrl: p.image_url || p.imageUrl || undefined,
    supplier: formatFullName(p.supplier) || p.supplier?.company_name || p.supplier?.name || '',
    supplierId: p.supplier_id ?? p.supplierId ?? p.supplier?.id,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  } as Product;
}

/**
 * Create a product (supplier owner/manager only)
 * NOTE: Not available to sales reps - they can only view catalog, not edit
 * Backend expects POST /products with ProductCreate schema
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createProduct(data: Partial<Product>) {
  // Backend ProductCreate requires: name, price_kzt, sku, stock_qty
  // Optional: description, currency (default: KZT), unit, min_order_qty, discount_percent,
  // delivery_available (default: true), pickup_available (default: true), lead_time_days, is_active (default: true)
  const body = {
    name: data.name,
    description: data.description || null,
    price_kzt: data.price,
    currency: data.currency || 'KZT',
    sku: data.sku || `SKU-${Date.now()}`, // SKU is required, generate if not provided
    stock_qty: data.stock || 0,
    unit: (data as any).unit || 'pcs',
    min_order_qty: (data as any).min_order_qty || 1,
    discount_percent: (data as any).discount_percent || null,
    delivery_available: (data as any).delivery_available !== false,
    pickup_available: (data as any).pickup_available !== false,
    lead_time_days: (data as any).lead_time_days || null,
    is_active: (data as any).is_active !== false,
  };
  // Note: supplier_id is determined from authenticated user's supplier, not from request body
  return httpClient.fetchJson('/products', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }) as Promise<Product>;
}

/**
 * Update a product (supplier owner/manager only)
 * NOTE: Not available to sales reps - they can only view catalog, not edit
 * Backend expects PUT /products/{id} with ProductUpdate schema (all fields optional)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateProduct(productId: number | string, data: Partial<Product>) {
  const body: any = {};
  if (data.name !== undefined) body.name = data.name;
  if (data.description !== undefined) body.description = data.description;
  if (data.price !== undefined) body.price_kzt = data.price;
  if (data.currency !== undefined) body.currency = data.currency;
  if (data.sku !== undefined) body.sku = data.sku;
  if (data.stock !== undefined) body.stock_qty = data.stock;
  if ((data as any).unit !== undefined) body.unit = (data as any).unit;
  if ((data as any).min_order_qty !== undefined) body.min_order_qty = (data as any).min_order_qty;
  if ((data as any).discount_percent !== undefined) body.discount_percent = (data as any).discount_percent;
  if ((data as any).delivery_available !== undefined) body.delivery_available = (data as any).delivery_available;
  if ((data as any).pickup_available !== undefined) body.pickup_available = (data as any).pickup_available;
  if ((data as any).lead_time_days !== undefined) body.lead_time_days = (data as any).lead_time_days;
  if ((data as any).is_active !== undefined) body.is_active = (data as any).is_active;

  return httpClient.fetchJson(`/products/${encodeURIComponent(String(productId))}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }) as Promise<Product>;
}

// Note: createProduct and updateProduct removed - sales reps can only view catalog, not edit
export default { listProducts, fetchProduct };
