import httpClient from './httpClient';
import { PAGINATION } from '../constants';
import { getMe } from './user.http';

export type ChatMessage = {
  id: string | number;
  session_id?: number;
  sessionId?: number; // alias
  threadId?: string | number; // alias for session_id
  sender_id?: number;
  senderId?: number; // alias
  from?: string; // derived from sender_id vs current user
  text?: string;
  file_url?: string | null;
  attachments?: Array<{ url: string; type?: string; previewUri?: string }>;
  created_at?: string;
  ts?: string; // alias for created_at
  delivered?: boolean;
  read?: boolean;
  system?: boolean;
  severity?: 'info' | 'warning' | 'success' | 'error';
};

export type ChatSession = {
  id: number;
  consumer_id: number;
  consumerId?: number; // alias
  sales_rep_id: number;
  salesRepId?: number; // alias
  order_id?: number | null;
  orderId?: number | null; // alias
  created_at: string;
  createdAt?: string; // alias
};

/**
 * Create a chat session (consumer only)
 * Backend expects: { sales_rep_id?, order_id? }
 * If sales_rep_id is null/undefined, backend will auto-assign based on order's supplier
 */
export async function createChatSession(
	sales_rep_id: number | string | null | undefined,
	order_id?: number | string | null
): Promise<ChatSession> {
	const body: any = {};
	if (sales_rep_id !== null && sales_rep_id !== undefined) {
		body.sales_rep_id = Number(sales_rep_id);
	}
	if (order_id) {
		body.order_id = Number(order_id);
	}
	const res = await httpClient.fetchJson('/chats/sessions', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	return normalizeSession(res);
}

/**
 * Get chat sessions (filtered by authenticated user's role)
 * Backend automatically filters: consumer sees own, supplier staff see assigned
 */
export async function listChatSessions(
	page: number = 1,
	size: number = PAGINATION.DEFAULT_PAGE_SIZE
): Promise<{ items: ChatSession[]; page: number; size: number; total: number; pages: number }> {
	const q = new URLSearchParams();
	q.set('page', String(page));
	q.set('size', String(size));
	const res = await httpClient.fetchJson(`/chats/sessions?${q.toString()}`);
	const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
	return {
		items: items.map(normalizeSession),
		page: res?.page ?? page,
		size: res?.size ?? size,
		total: res?.total ?? items.length,
		pages: res?.pages ?? 1
	};
}

/**
 * Get chat messages for a session
 */
export async function fetchMessages(sessionId: string | number, page = 1, size = PAGINATION.CHAT_PAGE_SIZE): Promise<ChatMessage[]> {
	const q = new URLSearchParams();
	q.set('page', String(page));
	q.set('size', String(size));
	const res = await httpClient.fetchJson(`/chats/sessions/${encodeURIComponent(String(sessionId))}/messages?${q.toString()}`);
	const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : res?.data || [];

	// Normalize messages and determine 'from' field
	const currentUser = await getMe().catch(() => null);
	const currentUserId = currentUser?.id;

	return items.map((msg: any) => normalizeMessage(msg, currentUserId));
}

/**
 * Send a message in a chat session
 * Backend expects: { text, file_url? }
 */
export async function sendMessage(sessionId: string | number, text: string, file_url?: string | null): Promise<ChatMessage> {
	const body: any = { text };
	if (file_url) {
		body.file_url = file_url;
	}
	const res = await httpClient.fetchJson(`/chats/sessions/${encodeURIComponent(String(sessionId))}/messages`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	const currentUser = await getMe().catch(() => null);
	const currentUserId = currentUser?.id;
	return normalizeMessage(res, currentUserId);
}

/**
 * Get or create a chat session for an order
 * Helper function to find existing session or create new one
 * If sales_rep_id is null/undefined, backend will auto-assign based on order's supplier
 */
export async function getOrCreateChatSessionForOrder(
	orderId: string | number,
	sales_rep_id: number | string | null | undefined
): Promise<ChatSession> {
	try {
		// Try to find existing session for this order
		const sessions = await listChatSessions(1, 100);
		const existing = sessions.items.find((s: ChatSession) => s.order_id === Number(orderId) || s.orderId === Number(orderId));
		if (existing) {
			return existing;
		}
	} catch (e) {
		// If listing fails, just create new session
	}

	// Create new session (backend will auto-assign sales rep if sales_rep_id is null)
	return createChatSession(sales_rep_id, orderId);
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

// Compatibility wrapper for different call signatures
export async function sendMessageCompat(threadId: string | number, fromOrText?: string, textOrAttachments?: any, attachmentsMaybe?: any) {
	// If called in HTTP-style: (sessionId, text?, file_url?) then forward directly
	if (typeof textOrAttachments === 'undefined' || typeof textOrAttachments === 'string') {
		// signature: (sessionId, text?, file_url?)
		return sendMessage(threadId, fromOrText as string || '', textOrAttachments as string | undefined);
	}
	// Otherwise assume alternative signature: (threadId, from, text?, attachments?)
	const text = typeof textOrAttachments === 'string' ? textOrAttachments as string : '';
	const attachments = Array.isArray(attachmentsMaybe) ? attachmentsMaybe : Array.isArray(textOrAttachments) ? textOrAttachments : [];
	const file_url = attachments.length > 0 ? attachments[0].url : undefined;
	return sendMessage(threadId, text, file_url);
}

/**
 * Normalize backend session response to frontend format
 */
function normalizeSession(session: any): ChatSession {
	return {
		id: session.id,
		consumer_id: session.consumer_id,
		consumerId: session.consumer_id,
		sales_rep_id: session.sales_rep_id,
		salesRepId: session.sales_rep_id,
		order_id: session.order_id ?? null,
		orderId: session.order_id ?? null,
		created_at: session.created_at,
		createdAt: session.created_at
	};
}

/**
 * Normalize backend message response to frontend format
 */
function normalizeMessage(msg: any, currentUserId?: number | string | null): ChatMessage {
	const isFromCurrentUser = currentUserId && (msg.sender_id === Number(currentUserId) || msg.senderId === Number(currentUserId));
	const from = isFromCurrentUser ? 'current' : 'other'; // Will be determined by role in UI

	// Convert file_url to attachments array if present
	const attachments = msg.file_url ? [{ url: msg.file_url, type: undefined }] : undefined;

	return {
		id: msg.id,
		session_id: msg.session_id,
		sessionId: msg.session_id,
		threadId: msg.session_id,
		sender_id: msg.sender_id,
		senderId: msg.sender_id,
		from: from,
		text: msg.text || undefined,
		file_url: msg.file_url || undefined,
		attachments: attachments,
		created_at: msg.created_at,
		ts: msg.created_at,
		delivered: true, // Assume delivered if message exists
		read: false, // Backend doesn't track read status yet
		system: false,
		severity: undefined
	};
}

export default {
	createChatSession,
	listChatSessions,
	fetchMessages,
	sendMessage: sendMessageCompat,
	markThreadRead,
	uploadAttachment,
	getOrCreateChatSessionForOrder
};
