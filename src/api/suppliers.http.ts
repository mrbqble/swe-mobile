import httpClient from './httpClient';

export async function searchSuppliers(query?: string) {
  try {
    // Call backend catalog suppliers endpoint if available. If API does not support search, backend may return 404.
    const q = new URLSearchParams();
    if (query) q.set('q', String(query));
    const res = await httpClient.fetchJson(`/catalog/suppliers?${q.toString()}`);
    // backend returns pagination: { items: [...] }
    const suppliersRaw = Array.isArray(res) ? res : res && Array.isArray(res.items) ? res.items : [];
    // Map backend SupplierResponse to frontend Supplier shape
    return (suppliersRaw || []).map((s: any) => ({
      id: s.id,
      name: s.company_name || s.name || String(s.id),
      description: s.description || '',
      city: s.city || undefined,
      rating: s.rating || 0,
    }));
  } catch (e) {
    // If backend doesn't expose suppliers listing, gracefully return empty list
    return [];
  }
}
