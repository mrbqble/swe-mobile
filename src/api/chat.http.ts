import httpClient from './httpClient'
import { PAGINATION } from '../constants'
import { getMe } from './user.http'
import ordersModule from './orders.http'

export type ChatAttachment = {
	id?: number
	message_id?: number
	file_type: 'image' | 'file' | 'audio'
	file_name: string
	mime_type?: string | null
	file_data: string // Base64 encoded
	file_size?: number | null
	created_at?: string
	// Frontend-only fields for display
	previewUri?: string // Local URI for preview
	url?: string // For backward compatibility
}

export type ChatMessage = {
	id: string | number
	session_id?: number
	sessionId?: number // alias
	threadId?: string | number // alias for session_id
	sender_id?: number
	senderId?: number // alias
	from?: string // derived from sender_id vs current user
	text?: string
	file_url?: string | null
	attachments?: ChatAttachment[]
	created_at?: string
	ts?: string // alias for created_at
	delivered?: boolean
	read?: boolean
	system?: boolean
	severity?: 'info' | 'warning' | 'success' | 'error'
	senderName?: string // Sender's full name for display
}

export type ChatSession = {
	id: number
	consumer_id: number
	consumerId?: number // alias
	sales_rep_id: number
	salesRepId?: number // alias
	created_at: string
	createdAt?: string // alias
	salesRepName?: string // Sales rep full name
	consumerName?: string // Consumer name
}

/**
 * Create or get a chat session (consumer only)
 * Backend expects: { sales_rep_id?, supplier_id? }
 * According to specs: One chat thread per Consumer-Supplier pair (once link is approved).
 * The thread is reused for all conversations.
 * If session already exists for the pair, it returns the existing one.
 */
export async function createChatSession(
	sales_rep_id?: number | string | null | undefined,
	supplier_id?: number | string | null | undefined
): Promise<ChatSession> {
	const body: any = {}
	if (sales_rep_id !== null && sales_rep_id !== undefined) {
		body.sales_rep_id = Number(sales_rep_id)
	}
	if (supplier_id !== null && supplier_id !== undefined) {
		body.supplier_id = Number(supplier_id)
	}
	const res = await httpClient.fetchJson('/chats/sessions', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	})
	return normalizeSession(res)
}

/**
 * Get chat sessions (filtered by authenticated user's role)
 * Backend automatically filters: consumer sees own, supplier staff see assigned
 */
export async function listChatSessions(
	page: number = 1,
	size: number = PAGINATION.DEFAULT_PAGE_SIZE
): Promise<{ items: ChatSession[]; page: number; size: number; total: number; pages: number }> {
	const q = new URLSearchParams()
	q.set('page', String(page))
	q.set('size', String(size))
	const res = await httpClient.fetchJson(`/chats/sessions?${q.toString()}`)
	const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []
	return {
		items: items.map(normalizeSession),
		page: res?.page ?? page,
		size: res?.size ?? size,
		total: res?.total ?? items.length,
		pages: res?.pages ?? 1
	}
}

/**
 * Get chat messages for a session
 */
export async function fetchMessages(sessionId: string | number, page = 1, size = PAGINATION.CHAT_PAGE_SIZE): Promise<ChatMessage[]> {
	const q = new URLSearchParams()
	q.set('page', String(page))
	q.set('size', String(size))
	const res = await httpClient.fetchJson(`/chats/sessions/${encodeURIComponent(String(sessionId))}/messages?${q.toString()}`)
	const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : res?.data || []

	// Normalize messages and determine 'from' field
	const currentUser = await getMe().catch(() => null)
	const currentUserId = currentUser?.id

	return items.map((msg: any) => normalizeMessage(msg, currentUserId))
}

/**
 * Send a message in a chat session
 * Backend expects: { text, file_url?, attachments? }
 */
export async function sendMessage(
	sessionId: string | number,
	text: string,
	file_url?: string | null,
	attachments?: ChatAttachment[]
): Promise<ChatMessage> {
	const body: any = { text }
	if (file_url) {
		body.file_url = file_url
	}
	if (attachments && attachments.length > 0) {
		body.attachments = attachments.map((att) => ({
			file_type: att.file_type,
			file_name: att.file_name,
			mime_type: att.mime_type || null,
			file_data: att.file_data, // Base64 encoded
			file_size: att.file_size || null
		}))
	}
	const res = await httpClient.fetchJson(`/chats/sessions/${encodeURIComponent(String(sessionId))}/messages`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	})
	const currentUser = await getMe().catch(() => null)
	const currentUserId = currentUser?.id
	return normalizeMessage(res, currentUserId)
}

/**
 * Get or create a chat session for a Consumer-Supplier pair
 * According to specs: One chat thread per Consumer-Supplier pair (once link is approved).
 * This function gets the supplier_id from the order and creates/gets the session for that pair.
 * The same thread is reused for all orders between the same Consumer-Supplier pair.
 */
export async function getOrCreateChatSessionForOrder(
	orderId: string | number,
	sales_rep_id?: number | string | null | undefined
): Promise<ChatSession> {
	// Get supplier_id from the order first
	const order = await ordersModule.fetchOrderById(orderId)
	const supplier_id = order.supplier_id

	// Backend will find or create the session based on consumer-supplier pair
	return createChatSession(sales_rep_id, supplier_id)
}

/**
 * Get or create a chat session for a Consumer-Supplier pair by supplier_id
 * According to specs: One chat thread per Consumer-Supplier pair (once link is approved).
 */
export async function getOrCreateChatSessionForSupplier(
	supplierId: string | number,
	sales_rep_id?: number | string | null | undefined
): Promise<ChatSession> {
	// Backend will find or create the session based on consumer-supplier pair
	return createChatSession(sales_rep_id, supplierId, undefined)
}

// backend does not have an explicit mark-read endpoint in current API; keep a no-op
export async function markThreadRead(sessionId: string | number, reader?: string) {
	// no-op for HTTP adapter
	return true
}

export async function uploadAttachment(uri: string) {
	// For now, the backend expects a URL for attachments. If the backend
	// supports file uploads, replace this with a multipart/form-data POST.
	// As a lightweight fallback for local/dev, return the original URI.
	return { url: uri }
}

// Compatibility wrapper for different call signatures
export async function sendMessageCompat(threadId: string | number, fromOrText?: string, textOrAttachments?: any, attachmentsMaybe?: any) {
	// If called in HTTP-style: (sessionId, text?, file_url?) then forward directly
	if (typeof textOrAttachments === 'undefined' || typeof textOrAttachments === 'string') {
		// signature: (sessionId, text?, file_url?)
		return sendMessage(threadId, (fromOrText as string) || '', textOrAttachments as string | undefined)
	}
	// Otherwise assume alternative signature: (threadId, from, text?, attachments?)
	const text = typeof textOrAttachments === 'string' ? (textOrAttachments as string) : ''
	const attachments = Array.isArray(attachmentsMaybe) ? attachmentsMaybe : Array.isArray(textOrAttachments) ? textOrAttachments : []
	const file_url = attachments.length > 0 ? attachments[0].url : undefined
	return sendMessage(threadId, text, file_url)
}

/**
 * Normalize backend session response to frontend format
 */
function normalizeSession(session: any): ChatSession {
	// Extract sales rep name from backend response
	const salesRep = session.sales_rep || null
	const salesRepName = salesRep ? `${salesRep.first_name || ''} ${salesRep.last_name || ''}`.trim() || salesRep.email || 'Sales Rep' : 'Sales Rep'

	// Extract consumer name from backend response
	const consumer = session.consumer || null
	const consumerName = consumer
		? consumer.user
			? `${consumer.user.first_name || ''} ${consumer.user.last_name || ''}`.trim() || consumer.organization_name || 'Consumer'
			: consumer.organization_name || 'Consumer'
		: 'Consumer'

	return {
		id: session.id,
		consumer_id: session.consumer_id,
		consumerId: session.consumer_id,
		sales_rep_id: session.sales_rep_id,
		salesRepId: session.sales_rep_id,
		created_at: session.created_at,
		createdAt: session.created_at,
		salesRepName: salesRepName,
		consumerName: consumerName
	}
}

/**
 * Normalize backend message response to frontend format
 */
function normalizeMessage(msg: any, currentUserId?: number | string | null): ChatMessage {
	const isFromCurrentUser = currentUserId && (msg.sender_id === Number(currentUserId) || msg.senderId === Number(currentUserId))
	const from = isFromCurrentUser ? 'current' : 'other' // Will be determined by role in UI

	// Extract sender name from backend response
	const sender = msg.sender || null
	const senderName = sender ? `${sender.first_name || ''} ${sender.last_name || ''}`.trim() || sender.email || 'User' : 'User'

	// Normalize attachments from backend
	let attachments: ChatAttachment[] | undefined = undefined
	if (msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0) {
		attachments = msg.attachments.map((att: any) => ({
			id: att.id,
			message_id: att.message_id,
			file_type: att.file_type as 'image' | 'file' | 'audio',
			file_name: att.file_name,
			mime_type: att.mime_type || null,
			file_data: att.file_data, // Base64 encoded
			file_size: att.file_size || null,
			created_at: att.created_at,
			// Create data URI for preview
			previewUri: att.file_data ? `data:${att.mime_type || 'application/octet-stream'};base64,${att.file_data}` : undefined,
			url: att.file_data ? `data:${att.mime_type || 'application/octet-stream'};base64,${att.file_data}` : undefined
		}))
	} else if (msg.file_url) {
		// Backward compatibility: convert file_url to attachment
		attachments = [{ file_type: 'file', file_name: 'Attachment', file_data: '', url: msg.file_url }]
	}

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
		severity: undefined,
		senderName: senderName // Add sender name for display
	}
}

export default {
	createChatSession,
	listChatSessions,
	fetchMessages,
	sendMessage: sendMessageCompat,
	markThreadRead,
	uploadAttachment,
	getOrCreateChatSessionForOrder,
	getOrCreateChatSessionForSupplier
}
