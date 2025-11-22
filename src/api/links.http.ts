import httpClient from './httpClient';

export type LinkStatus = 'pending' | 'accepted' | 'denied' | 'blocked';

export async function requestLink(supplier_id: number) {
  return httpClient.fetchJson('/links/requests', {
    method: 'POST',
    body: JSON.stringify({ supplier_id }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getMyLinks(params: { page?: number; size?: number; status?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.size) q.set('size', String(params.size));
  if (params.status) q.set('status', String(params.status));
  return httpClient.fetchJson(`/links?${q.toString()}`);
}

export async function getIncomingLinks(params: { page?: number; size?: number; status?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.size) q.set('size', String(params.size));
  if (params.status) q.set('status', String(params.status));
  return httpClient.fetchJson(`/links/incoming?${q.toString()}`);
}

export async function getLink(linkId: number | string) {
  return httpClient.fetchJson(`/links/${encodeURIComponent(String(linkId))}`);
}

export async function updateLinkStatus(linkId: number | string, status: LinkStatus) {
  return httpClient.fetchJson(`/links/${encodeURIComponent(String(linkId))}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export default { requestLink, getMyLinks, getIncomingLinks, getLink, updateLinkStatus };
