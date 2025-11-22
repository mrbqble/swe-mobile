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
  return httpClient.fetchJson(`/products/${id}`) as Promise<Product>;
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
