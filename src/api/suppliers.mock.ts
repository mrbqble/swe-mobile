export type Supplier = {
  id: string;
  name: string;
  description?: string;
  city?: string;
  rating?: number;
};

const suppliers: Supplier[] = [
  { id: 's1', name: 'Kazakhstan Steel Works', description: 'Industrial steel and metal products', city: 'Almaty, Kazakhstan', rating: 4.7 },
  { id: 's2', name: 'Silk Road Logistics', description: 'Supply chain and logistics services', city: 'Shymkent, Kazakhstan', rating: 4.9 },
  { id: 's3', name: 'TechPro Supply', description: 'Industrial equipment', city: 'Astana', rating: 4.8 },
  { id: 's4', name: 'Industrial Solutions', description: 'Office & industrial supplies', city: 'Karaganda', rating: 4.6 },
];

export async function searchSuppliers(query?: string): Promise<Supplier[]> {
  // simulate network latency
  await new Promise(r => setTimeout(r, 150));
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  return suppliers.filter(s => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q));
}
