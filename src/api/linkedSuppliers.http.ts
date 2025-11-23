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
// If backend includes supplier object, map it to this shape
export type LinkedSupplierWithSupplier = LinkedSupplier & { supplier?: { id: number | string; company_name?: string; is_active?: boolean } };
export type LinkRequest = { id: number | string; supplier_id?: number | string; consumer_id?: number | string; status?: string; created_at?: string };

export async function fetchLinkedSuppliers(consumerId?: string | number) {
  const q = new URLSearchParams();
  if (consumerId) q.set('consumer_id', String(consumerId));
  const query = q.toString() ? `?${q.toString()}` : '';
  const res = await httpClient.fetchJson(`/links${query}`);
  // Backend returns a pagination object { items: [...], page, size, total, pages }
  const raw = Array.isArray(res) ? res : res && Array.isArray(res.items) ? res.items : [];
  // Normalize items for UI: map supplier.company_name -> name and capitalize status
  const normalized = (raw || []).map((it: any) => {
    const supplier = it.supplier || it;
    const name = supplier?.company_name ?? supplier?.name ?? '';
    const statusRaw = (it.status || '').toString();
    const status = statusRaw ? statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase() : '';
    return { ...it, name, status } as LinkedSupplierWithSupplier & { name?: string };
  });
  return normalized as LinkedSupplierWithSupplier[];
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
  const raw = Array.isArray(res) ? res : res && Array.isArray(res.items) ? res.items : [];
  // Normalize consumer and supplier sub-objects and status for UI
  const normalized = (raw || []).map((it: any) => {
    const consumer = it.consumer || it.consumer || null;
    const supplier = it.supplier || it.supplier || null;
    const consumerName = consumer?.organization_name ?? consumer?.name ?? '';
    const supplierName = supplier?.company_name ?? supplier?.name ?? '';
    const statusRaw = (it.status || '').toString();
    const status = statusRaw ? statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase() : '';
    return { ...it, consumer: { ...consumer, organization_name: consumerName }, supplier: { ...supplier, company_name: supplierName }, status } as any;
  });
  return normalized as LinkRequest[];
}

export async function updateLinkRequestStatus(requestId: string | number, newStatus: string) {
  return httpClient.fetchJson(`/links/${encodeURIComponent(String(requestId))}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  });
}
