import { Product } from '../helpers/types';
import * as Catalog from './catalog.mock';

const mockProducts: Product[] = [
  { id: 1, name: 'Industrial Motor XL-2000', price: 125500, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1535662755496-7a1b41997db2?q=80&w=400', supplier: 'TechPro Supply' },
  { id: 2, name: 'Office Paper A4 Premium', price: 3500, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1612599316791-451087c7fe15?q=80&w=400', supplier: 'Industrial Solutions' },
  { id: 3, name: 'Laptop Dell Precision 7000', price: 450000, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1737868131532-0efce8062b43?q=80&w=400', supplier: 'TechPro Supply' },
  { id: 4, name: 'Safety Helmet Professional', price: 12500, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1535662755496-7a1b41997db2?q=80&w=400', supplier: 'Industrial Solutions' }
];

export async function fetchProduct(id: number | string): Promise<Product | null> {
  const p = mockProducts.find(x => String(x.id) === String(id));
  if (p) return p;
  // fallback to catalog store (products added via catalog API)
  try {
    const fromCatalog = await (Catalog as any).fetchProduct(id);
    return fromCatalog as Product | null;
  } catch (e) {
    return null;
  }
}
