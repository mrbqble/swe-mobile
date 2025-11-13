export type LinkStatus = 'Accepted' | 'Pending' | 'Denied' | 'In Progress';

export type LinkedSupplier = {
  id: string;
  name: string;
  status: LinkStatus;
  productsCount?: number;
  rating?: number;
};

const mockLinked: LinkedSupplier[] = [
  { id: 'sup-1', name: 'TechPro Supply', status: 'Accepted', productsCount: 156, rating: 4.8 },
  { id: 'sup-2', name: 'Industrial Solutions', status: 'Accepted', productsCount: 89, rating: 4.6 },
];

import { emitter } from '../helpers/events';

export async function fetchLinkedSuppliers(consumerId?: string | number) {
  await new Promise((r) => setTimeout(r, 150));
  return mockLinked;
}

export async function addLinkRequest(supplierId: string, consumerId?: string | number) {
  // mock: push In Progress (supplier-side review will accept/reject later)
  const linkedId = `sup-${Date.now()}`;
  mockLinked.unshift({ id: linkedId, name: `Requested Supplier ${supplierId}`, status: 'In Progress' });
  // also create a simple request record for supplier to review (kept in same module for the mock)
  mockRequests.unshift({ id: `req-${Date.now()}`, name: `Requested Supplier ${supplierId}`, organization: '', email: '', date: new Date().toISOString().split('T')[0], status: 'pending', linkedId });
  await new Promise((r) => setTimeout(r, 120));
  try { emitter.emit('linkRequestsChanged'); emitter.emit('linkedSuppliersChanged'); } catch (e) {}
  return { success: true };
}

// --- Link requests mock & helpers (supplier-side)
export type LinkRequestStatus = 'pending' | 'approved' | 'rejected';
export type LinkRequest = { id: string; name: string; organization?: string; email?: string; date?: string; status: LinkRequestStatus; linkedId?: string };

const mockRequests: LinkRequest[] = [
  { id: 'req-1', name: 'John Smith', organization: 'Smith Trading LLC', email: 'john.smith@example.com', date: '2024-01-15', status: 'pending' },
  { id: 'req-2', name: 'Elena Nazarbayeva', organization: 'Astana Construction', email: 'elena@astana-const.kz', date: '2024-01-14', status: 'pending' },
  { id: 'req-3', name: 'Dmitry Petrov', organization: 'Almaty Tech Solutions', email: 'dmitry@almaty-tech.kz', date: '2024-01-13', status: 'pending' }
];

export async function fetchLinkRequests(supplierId?: string | number) {
  await new Promise((r) => setTimeout(r, 120));
  return mockRequests;
}

export async function updateLinkRequestStatus(requestId: string, newStatus: LinkRequestStatus) {
  // update request
  const req = mockRequests.find((r) => r.id === requestId);
  if (!req) return { success: false, message: 'not found' };
  req.status = newStatus;

  // reflect change in linked suppliers list: if approved, ensure there's an Accepted linked entry; if rejected, mark linked entry as Denied if exists
  if (newStatus === 'approved') {
    if (req.linkedId) {
      const linked = mockLinked.find((l) => l.id === req.linkedId);
      if (linked) linked.status = 'Accepted';
      else mockLinked.unshift({ id: req.linkedId, name: req.name, status: 'Accepted' as any });
    } else {
      // create new linked entry
      const id = `sup-${Date.now()}`;
      mockLinked.unshift({ id, name: req.name, status: 'Accepted' as any });
      req.linkedId = id;
    }
  } else if (newStatus === 'rejected') {
    if (req.linkedId) {
      const linked = mockLinked.find((l) => l.id === req.linkedId);
      if (linked) linked.status = 'Denied';
    }
    // otherwise do nothing for rejected requests (could create a Denied entry if desired)
  }

  await new Promise((r) => setTimeout(r, 80));
  try { emitter.emit('linkRequestsChanged'); emitter.emit('linkedSuppliersChanged'); } catch (e) {}
  return { success: true };
}
