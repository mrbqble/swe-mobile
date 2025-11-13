import { Product } from '../helpers/types';

const BASE = 'http://YOUR_API_BASE_HERE';

export async function fetchProduct(id: number | string): Promise<Product> {
  const res = await fetch(`${BASE}/api/products/${id}`);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}
