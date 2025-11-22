import httpClient from './httpClient';

export type ChatMessage = {
  id: string | number;
  threadId: string | number;
  from: string;
  text?: string;
  attachments?: Array<{ url: string; type?: string; previewUri?: string }>;
  ts: string;
  delivered?: boolean;
  read?: boolean;
  system?: boolean;
  severity?: 'info' | 'warning' | 'success' | 'error';
};

export async function fetchMessages(sessionId: string | number, page = 1, size = 50) {
  const q = new URLSearchParams();
  q.set('page', String(page));
  q.set('size', String(size));
  const res = await httpClient.fetchJson(`/chats/sessions/${encodeURIComponent(String(sessionId))}/messages?${q.toString()}`);
  const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : res?.data || [];
  return items as ChatMessage[];
}

export async function sendMessage(sessionId: string | number, text?: string, file_url?: string) {
  const body = { text, file_url };
  const res = await httpClient.fetchJson(`/chats/sessions/${encodeURIComponent(String(sessionId))}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return res as ChatMessage;
}

// backend does not have an explicit mark-read endpoint in current API; keep a no-op
export async function markThreadRead(sessionId: string | number, reader?: string) {
  // no-op for HTTP adapter
  return true;
}

export async function uploadAttachment(uri: string) {
  // For now, the backend expects a URL for attachments. If the backend
  // supports file uploads, replace this with a multipart/form-data POST.
  // As a lightweight fallback for local/dev, return the original URI.
  return { url: uri };
}
// Compatibility wrapper: mock `sendMessage(threadId, from, text?, attachments?)`
export async function sendMessageCompat(threadId: string | number, fromOrText?: string, textOrAttachments?: any, attachmentsMaybe?: any) {
  // If called in HTTP-style: (sessionId, text?, file_url?) then forward directly
  if (typeof textOrAttachments === 'undefined' || typeof textOrAttachments === 'string') {
    // signature: (sessionId, text?, file_url?)
    return sendMessage(threadId, fromOrText as string, textOrAttachments as string | undefined);
  }
  // Otherwise assume mock-style: (threadId, from, text?, attachments?)
  const from = fromOrText as string;
  const text = typeof textOrAttachments === 'string' ? textOrAttachments as string : undefined;
  const attachments = Array.isArray(attachmentsMaybe) ? attachmentsMaybe : Array.isArray(textOrAttachments) ? textOrAttachments : [];
  const file_url = attachments.length > 0 ? attachments[0].url : undefined;
  return sendMessage(threadId, text, file_url);
}

export default { fetchMessages, sendMessage: sendMessageCompat, markThreadRead };
