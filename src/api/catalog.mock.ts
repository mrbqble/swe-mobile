import { Product, PaginatedResponse } from '../helpers/types';
import { emitter } from '../helpers/events';

const mockProducts: Product[] = [
  { id: 1, name: 'Industrial Motor XL-2000', price: 125500, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1535662755496-7a1b41997db2?q=80&w=400', supplier: 'TechPro Supply' },
  { id: 2, name: 'Office Paper A4 Premium', price: 3500, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1612599316791-451087c7fe15?q=80&w=400', supplier: 'Industrial Solutions' },
  { id: 3, name: 'Laptop Dell Precision 7000', price: 450000, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1737868131532-0efce8062b43?q=80&w=400', supplier: 'TechPro Supply' },
  { id: 4, name: 'Safety Helmet Professional', price: 12500, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1535662755496-7a1b41997db2?q=80&w=400', supplier: 'Industrial Solutions' }
];

export async function fetchCatalog({ search = '', page = 1, limit = 20, supplier }:
  { search?: string; page?: number; limit?: number; supplier?: string }
): Promise<PaginatedResponse<Product>> {
  // simple filter and pagination
  const normalized = search.trim().toLowerCase();
  let filtered = mockProducts;
  if (normalized.length > 0) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(normalized) || (p.supplier || '').toLowerCase().includes(normalized));
  }
  if (supplier) {
    const s = String(supplier).toLowerCase();
    filtered = filtered.filter(p => (p.supplier || '').toLowerCase() === s);
  }
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);
  return {
    data,
    meta: { page, limit, total, pages }
  };
}

export async function fetchProduct(id: number | string): Promise<Product | null> {
  const p = mockProducts.find(x => String(x.id) === String(id)) || null;
  return p;
}

export async function addProduct({ name, price, stock = 0, sku, description, imageUrl = '', supplier }: { name: string; price: number; stock?: number; sku?: string; description?: string; imageUrl?: string; supplier?: string }) {
  const id = Date.now();
  const prod: Product & any = { id, name, price, stock, imageUrl, image: imageUrl, supplier: supplier || 'Unknown', description, sku, createdAt: new Date().toISOString() } as any;
  mockProducts.unshift(prod);
  await new Promise((r) => setTimeout(r, 120));
  try { emitter.emit('catalogChanged'); } catch (e) {}
  return prod;
}

export async function updateStock(productId: number | string, stock: number) {
  const idx = mockProducts.findIndex(p => String(p.id) === String(productId));
  if (idx < 0) return null;
  mockProducts[idx].stock = stock;
  await new Promise((r) => setTimeout(r, 100));
  try { emitter.emit('catalogChanged'); } catch (e) {}
  return mockProducts[idx];
}

export async function deleteProduct(productId: number | string) {
  const idx = mockProducts.findIndex(p => String(p.id) === String(productId));
  if (idx < 0) return false;
  mockProducts.splice(idx, 1);
  await new Promise((r) => setTimeout(r, 120));
  try { emitter.emit('catalogChanged'); } catch (e) {}
  return true;
}
