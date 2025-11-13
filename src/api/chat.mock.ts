import { emitter } from '../helpers/events';

export type ChatMessage = {
  id: string;
  threadId: string; // we'll use orderId as threadId
  from: string; // 'consumer' | 'supplier' or user id
  text?: string;
  attachments?: Array<{ url: string; type?: string; previewUri?: string }>;
  ts: string; // ISO timestamp
  delivered?: boolean;
  read?: boolean;
};

const store: Record<string, ChatMessage[]> = {};

export async function fetchMessages(threadId: string) {
  await new Promise((r) => setTimeout(r, 80));
  return (store[threadId] || []).slice();
}

export async function sendMessage(threadId: string, from: string, text?: string, attachments?: Array<{ url: string; type?: string; previewUri?: string }>) {
  const msg: ChatMessage = { id: `m-${Date.now()}`, threadId, from, text, attachments: attachments || [], ts: new Date().toISOString(), delivered: true, read: false };
  store[threadId] = store[threadId] || [];
  store[threadId].push(msg);
  // simulate async
  await new Promise((r) => setTimeout(r, 60));
  try { emitter.emit(`chatChanged:${threadId}`, threadId); emitter.emit('chatChanged', threadId); } catch (e) {}
  return msg;
}

export async function markThreadRead(threadId: string, reader: string) {
  // mark messages as read where from !== reader
  if (!store[threadId]) return;
  store[threadId] = store[threadId].map((m) => ({ ...m, read: m.from === reader ? m.read : true }));
  try { emitter.emit(`chatChanged:${threadId}`, threadId); emitter.emit('chatChanged', threadId); } catch (e) {}
}

// Mock upload: simulate uploading a local file and return a public URL
export async function uploadAttachment(localUri: string, fileName?: string) {
  // simulate network / upload time
  await new Promise((r) => setTimeout(r, 250));
  // create a mock public URL using timestamp + filename (no external network)
  const base = 'https://mock.cdn.local';
  const name = (fileName && fileName.replace(/[^a-z0-9.-]/gi, '_')) || `${Date.now()}`;
  const url = `${base}/uploads/${name}-${Date.now()}`;
  return { url, size: 0 };
}

// seed helper used in dev
export function seedThread(threadId: string, msgs: ChatMessage[]) {
  store[threadId] = msgs.slice();
}
