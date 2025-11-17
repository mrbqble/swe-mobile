import { emitter } from '../helpers/events';
import { sendSystemMessage } from './chat.mock';

export type Complaint = {
  id: string;
  orderId: string;
  consumerId?: string | number;
  consumerName?: string;
  supplier?: string;
  reason?: string;
  status?: 'Open' | 'In Progress' | 'Resolved' | 'Rejected';
  createdAt: string;
};

const store: Complaint[] = [];
const escalations: Array<{ id: string; complaintId: string; orderId: string; supplier?: string; consumerName?: string; reason?: string; createdAt: string }> = [];

export async function createComplaint(orderId: string, consumerId?: string | number, supplier?: string, reason?: string, consumerName?: string) {
  const c: Complaint = {
    id: `cmp-${Date.now()}`,
    orderId,
    consumerId,
    consumerName,
    supplier,
    reason,
    status: 'Open',
    createdAt: new Date().toISOString(),
  };
  store.unshift(c);
  await new Promise((r) => setTimeout(r, 120));
  try { emitter.emit('complaintsChanged'); } catch (e) {}
  try { await sendSystemMessage(orderId, `${consumerName || 'A consumer'} submitted a complaint for this order`, 'warning'); } catch (e) {}
  return c;
}

export async function fetchComplaintsForSupplier(supplier?: string) {
  await new Promise((r) => setTimeout(r, 120));
  if (!supplier) return store.slice();
  return store.filter(s => String(s.supplier || '').toLowerCase() === String(supplier).toLowerCase());
}

export async function fetchComplaintsForConsumer(consumerId?: string | number) {
  await new Promise((r) => setTimeout(r, 120));
  if (!consumerId) return store.slice();
  return store.filter(s => String(s.consumerId) === String(consumerId));
}

export async function fetchComplaintById(complaintId: string) {
  await new Promise((r) => setTimeout(r, 80));
  return store.find(c => c.id === complaintId) || null;
}

export async function fetchComplaintByOrderId(orderId: string) {
  await new Promise((r) => setTimeout(r, 80));
  return store.find(c => String(c.orderId) === String(orderId)) || null;
}

export async function updateComplaintStatus(complaintId: string, status: Complaint['status']) {
  const idx = store.findIndex(c => c.id === complaintId);
  if (idx < 0) return null;
  store[idx].status = status;
  await new Promise((r) => setTimeout(r, 80));
  try { emitter.emit('complaintsChanged'); } catch (e) {}
  // notify chat thread (orderId) about status changes
  try {
    const threadId = store[idx].orderId;
    if (status === 'Resolved') {
      await sendSystemMessage(threadId, `The complaint was resolved by supplier.`, 'success');
    } else if (status === 'Open') {
      await sendSystemMessage(threadId, `The complaint was reopened by the consumer.`, 'warning');
    } else if (status === 'In Progress') {
      await sendSystemMessage(threadId, `Complaint marked in progress.`, 'info');
    }
  } catch (e) {}
  return store[idx];
}

export async function escalateToManager(complaintId: string) {
  const found = store.find(c => c.id === complaintId);
  if (!found) throw new Error('Complaint not found');
  const rec = {
    id: `escal-${Date.now()}`,
    complaintId: found.id,
    orderId: found.orderId,
    supplier: found.supplier,
    consumerName: found.consumerName,
    reason: found.reason,
    createdAt: new Date().toISOString(),
  };
  escalations.unshift(rec);
  // optionally mark complaint as In Progress when escalated
  found.status = 'In Progress';
  await new Promise((r) => setTimeout(r, 120));
  try { emitter.emit('escalationsChanged'); } catch (e) {}
  try { emitter.emit('complaintsChanged'); } catch (e) {}
  try { await sendSystemMessage(found.orderId, `Complaint has been escalated to manager.`, 'warning'); } catch (e) {}
  return rec;
}

export async function fetchEscalations() {
  await new Promise((r) => setTimeout(r, 80));
  return escalations.slice();
}
