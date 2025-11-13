import { Product, PaginatedResponse } from '../helpers/types';

const BASE = 'http://YOUR_API_BASE_HERE';

export async function fetchCatalog({ search = '', page = 1, limit = 20 }:
  { search?: string; page?: number; limit?: number }
): Promise<PaginatedResponse<Product>> {
  const q = new URLSearchParams({ search, page: String(page), limit: String(limit) });
  const res = await fetch(`${BASE}/api/catalog?${q.toString()}`);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function fetchProduct(id: number | string): Promise<Product> {
  const res = await fetch(`${BASE}/api/products/${id}`);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function updateStock(productId: number | string, stock: number) {
  const res = await fetch(`${BASE}/api/products/${encodeURIComponent(String(productId))}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock }) });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function deleteProduct(productId: number | string) {
  const res = await fetch(`${BASE}/api/products/${encodeURIComponent(String(productId))}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Network error');
  return res.ok;
}
