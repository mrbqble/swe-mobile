import httpClient from './httpClient';

export async function searchSuppliers(query?: string) {
  try {
    // Call backend catalog suppliers endpoint if available. If API does not support search, backend may return 404.
    const q = new URLSearchParams();
    if (query) q.set('q', String(query));
    const res = await httpClient.fetchJson(`/catalog/suppliers?${q.toString()}`);
    // backend may return pagination: { items: [...] }
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.items)) return res.items;
    return [];
  } catch (e) {
    // If backend doesn't expose suppliers listing, gracefully return empty list
    return [];
  }
}
