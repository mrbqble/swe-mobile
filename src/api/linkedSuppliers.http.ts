import httpClient from './httpClient';

export type LinkStatus = 'pending' | 'accepted' | 'denied' | 'blocked';
// Match backend LinkResponse shape: id, consumer_id, supplier_id, status, created_at, updated_at
export type LinkedSupplier = {
  id: number | string;
  consumer_id?: number | string;
  supplier_id?: number | string;
  status: LinkStatus;
  created_at?: string;
  updated_at?: string;
};
export type LinkRequest = { id: number | string; supplier_id?: number | string; consumer_id?: number | string; status?: string; created_at?: string };

export async function fetchLinkedSuppliers(consumerId?: string | number) {
  const q = new URLSearchParams();
  if (consumerId) q.set('consumer_id', String(consumerId));
  const query = q.toString() ? `?${q.toString()}` : '';
  const res = await httpClient.fetchJson(`/links${query}`);
  // Backend returns a pagination object { items: [...], page, size, total, pages }
  if (Array.isArray(res)) return res as LinkedSupplier[];
  if (res && Array.isArray(res.items)) return res.items as LinkedSupplier[];
  return [];
}

export async function addLinkRequest(supplierId: string, consumerId?: string | number) {
  return httpClient.fetchJson('/links/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ supplier_id: Number(supplierId) || supplierId }),
  });
}

// Supplier-side: fetch incoming link requests
export async function fetchLinkRequests(supplierId?: string | number) {
  const q = new URLSearchParams();
  if (supplierId) q.set('supplier_id', String(supplierId));
  const query = q.toString() ? `?${q.toString()}` : '';
  const res = await httpClient.fetchJson(`/links/incoming${query}`);
  if (Array.isArray(res)) return res as LinkRequest[];
  if (res && Array.isArray(res.items)) return res.items as LinkRequest[];
  return [];
}

export async function updateLinkRequestStatus(requestId: string | number, newStatus: string) {
  return httpClient.fetchJson(`/links/${encodeURIComponent(String(requestId))}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  });
}
