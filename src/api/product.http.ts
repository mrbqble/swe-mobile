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

export async function createProduct(data: Partial<Product>) {
  const body = {
    name: data.name,
    description: data.description,
    price_kzt: data.price,
    stock_qty: data.stock,
    supplier_id: data.supplierId || (data as any).supplier_id,
  } as any;
  return httpClient.fetchJson('/products', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }) as Promise<Product>;
}

export default { listProducts, fetchProduct };
