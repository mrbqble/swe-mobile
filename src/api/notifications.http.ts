import httpClient from './httpClient'
import { PAGINATION } from '../constants'

export type Notification = {
	id: number | string
	recipient_id: number
	message: string
	type?: string
	entity_id?: number | null
	entity_type?: string | null
	metadata?: { message_id?: number | string; order_id?: number | string } | null
	is_read: boolean
	created_at: string
	createdAt?: string // alias
}

/**
 * Get notifications for the current user (paginated)
 * Backend: GET /notifications?page=1&size=20&is_read=true|false
 */
export async function listNotifications(
	page: number = 1,
	size: number = PAGINATION.DEFAULT_PAGE_SIZE,
	is_read?: boolean
): Promise<{ items: Notification[]; page: number; size: number; total: number; pages: number }> {
	const q = new URLSearchParams()
	q.set('page', String(page))
	q.set('size', String(size))
	if (is_read !== undefined) {
		q.set('is_read', String(is_read))
	}
	const res = await httpClient.fetchJson(`/notifications?${q.toString()}`)
	const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []
	return {
		items: items.map(normalizeNotification),
		page: res?.page ?? page,
		size: res?.size ?? size,
		total: res?.total ?? items.length,
		pages: res?.pages ?? 1
	}
}

/**
 * Mark a notification as read
 * Backend: PATCH /notifications/{id}/read
 */
export async function markNotificationRead(notificationId: number | string): Promise<Notification> {
	const res = await httpClient.fetchJson(`/notifications/${encodeURIComponent(String(notificationId))}/read`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' }
	})
	return normalizeNotification(res)
}

/**
 * Mark all notifications as read
 * Backend: PATCH /notifications/read-all
 */
export async function markAllNotificationsRead(): Promise<{ message: string; count: number }> {
	const res = await httpClient.fetchJson('/notifications/read-all', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' }
	})
	return res
}

/**
 * Normalize backend notification response to frontend format
 */
function normalizeNotification(notification: any): Notification {
	return {
		id: notification.id,
		recipient_id: notification.recipient_id,
		message: notification.message || '',
		type: notification.type || undefined,
		entity_id: notification.entity_id ?? null,
		entity_type: notification.entity_type ?? null,
		metadata: notification.metadata ?? null, // Include metadata (message_id, order_id, etc.)
		is_read: notification.is_read || false,
		created_at: notification.created_at,
		createdAt: notification.created_at
	}
}

export default {
	listNotifications,
	markNotificationRead,
	markAllNotificationsRead
}
