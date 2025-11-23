import { Product, PaginatedResponse } from '../helpers/types';
import httpClient from './httpClient';
import { PAGINATION } from '../constants';

// Normalize backend pagination/field names to the mobile app's expected shape
export async function fetchCatalog({ supplier_id, page = 1, size = PAGINATION.CATALOG_PAGE_SIZE }:
  { supplier_id: number | string; page?: number; size?: number }
): Promise<PaginatedResponse<Product>> {
  // Backend requires supplier_id as a mandatory query parameter
  if (!supplier_id) {
    throw new Error('supplier_id is required to fetch catalog');
  }
  const q = new URLSearchParams();
  q.set('supplier_id', String(supplier_id));
  q.set('page', String(page));
  q.set('size', String(size));
  const res = await httpClient.fetchJson(`/catalog?${q.toString()}`);

  // backend returns { items: [...], page, size, total, pages }
  const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
  const meta = {
    page: res?.page ?? page,
    limit: res?.size ?? size,
    total: res?.total ?? (Array.isArray(items) ? items.length : 0),
    pages: res?.pages ?? 1,
  };

  // Map backend ProductResponse to mobile Product shape
  const data: Product[] = (items || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    // backend uses price_kzt as string/decimal
    price: typeof p.price_kzt === 'string' ? parseFloat(p.price_kzt) : Number(p.price_kzt || 0),
    currency: p.currency,
    stock: p.stock_qty ?? p.stock ?? 0,
    imageUrl: p.image_url || p.imageUrl || undefined,
    supplier: '', // supplier name not provided by product response
    supplierId: p.supplier_id ?? p.supplierId,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));

  return { data, meta } as PaginatedResponse<Product>;
}

export async function fetchProduct(id: number | string): Promise<Product> {
  const p = await httpClient.fetchJson(`/products/${id}`);
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: typeof p.price_kzt === 'string' ? parseFloat(p.price_kzt) : Number(p.price_kzt || 0),
    currency: p.currency,
    stock: p.stock_qty ?? p.stock ?? 0,
    imageUrl: p.image_url || p.imageUrl || undefined,
    supplier: '',
    supplierId: p.supplier_id,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  } as Product;
}

export async function updateStock(productId: number | string, stock: number) {
  return httpClient.fetchJson(`/products/${encodeURIComponent(String(productId))}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock }) });
}

export async function deleteProduct(productId: number | string) {
  await httpClient.fetchJson(`/products/${encodeURIComponent(String(productId))}`, { method: 'DELETE' });
  return true;
}

// List suppliers from catalog endpoint (public, no auth required for search)
export async function listSuppliers({ q, page = 1, size = 20 }: { q?: string; page?: number; size?: number } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('page', String(page));
  params.set('size', String(size));
  const res = await httpClient.fetchJson(`/catalog/suppliers?${params.toString()}`);
  const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
  return {
    items,
    page: res?.page ?? page,
    size: res?.size ?? size,
    total: res?.total ?? items.length,
    pages: res?.pages ?? 1
  };
}

// Fetch products for the authenticated supplier (supplier owner/manager only)
export async function fetchMyProducts({ page = 1, size = PAGINATION.CATALOG_PAGE_SIZE, search }: { page?: number; size?: number; search?: string } = {}): Promise<PaginatedResponse<Product>> {
  // Use /products/me endpoint - backend filters by authenticated user's supplier
  const q = new URLSearchParams();
  q.set('page', String(page));
  q.set('size', String(size));
  const res = await httpClient.fetchJson(`/products/me?${q.toString()}`);

  // backend returns { items: [...], page, size, total, pages }
  const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];

  // Filter by search query on client side if provided
  let filteredItems = items;
  if (search && search.trim()) {
    const searchLower = search.toLowerCase();
    filteredItems = items.filter((p: any) =>
      p.name?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.sku?.toLowerCase().includes(searchLower)
    );
  }

  const meta = {
    page: res?.page ?? page,
    limit: res?.size ?? size,
    total: filteredItems.length,
    pages: Math.ceil(filteredItems.length / size),
  };

  // Map backend ProductResponse to mobile Product shape
  const data: Product[] = (filteredItems || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    description: p.description,
    // backend uses price_kzt as string/decimal
    price: typeof p.price_kzt === 'string' ? parseFloat(p.price_kzt) : Number(p.price_kzt || 0),
    currency: p.currency || 'KZT',
    stock: p.stock_qty ?? p.stock ?? 0,
    imageUrl: p.image_url || p.imageUrl || undefined,
    supplier: '', // supplier name not provided by product response
    supplierId: p.supplier_id ?? p.supplierId,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));

  return { data, meta } as PaginatedResponse<Product>;
}

export default {
  fetchCatalog,
  fetchProduct,
  updateStock,
  deleteProduct,
  listSuppliers,
  fetchMyProducts
};
