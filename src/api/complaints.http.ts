// HTTP adapter for complaints API
import httpClient from './httpClient'
import { PAGINATION } from '../constants'

export type ComplaintStatus = 'open' | 'escalated' | 'resolved'

export type Complaint = {
	id: number | string
	order_id: number
	orderId?: number // alias for order_id
	consumer_id: number
	consumerId?: number // alias for consumer_id
	sales_rep_id: number
	salesRepId?: number // alias for sales_rep_id
	manager_id: number
	managerId?: number // alias for manager_id
	status: ComplaintStatus
	description: string
	reason?: string // alias for description
	resolution?: string | null
	consumer_feedback?: boolean | null // true=satisfied, false=not satisfied, null=no feedback
	created_at: string
	createdAt?: string // alias for created_at
}

/**
 * Create a complaint (consumer only)
 * Backend expects: { order_id, sales_rep_id?, manager_id?, description }
 * sales_rep_id and manager_id are optional - backend will auto-assign if not provided
 */
export async function createComplaint(
	order_id: number | string,
	sales_rep_id: number | string | null | undefined,
	manager_id: number | string | null | undefined,
	description: string
): Promise<Complaint> {
	const body: any = {
		order_id: Number(order_id),
		description: description
	}
	// Only include sales_rep_id and manager_id if they are provided (not null/undefined)
	if (sales_rep_id !== null && sales_rep_id !== undefined) {
		body.sales_rep_id = Number(sales_rep_id)
	}
	if (manager_id !== null && manager_id !== undefined) {
		body.manager_id = Number(manager_id)
	}
	const res = await httpClient.fetchJson('/complaints', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	})
	return normalizeComplaint(res)
}

/**
 * Get a single complaint by ID
 */
export async function getComplaint(complaintId: string | number): Promise<Complaint> {
	const res = await httpClient.fetchJson(`/complaints/${encodeURIComponent(String(complaintId))}`)
	return normalizeComplaint(res)
}

/**
 * Get complaints (filtered by authenticated user's role)
 * Backend automatically filters: consumer sees own, supplier staff see assigned
 * All additional filtering (status, consumer) is done on the frontend
 */
export async function listComplaints(
	page: number = 1,
	size: number = PAGINATION.DEFAULT_PAGE_SIZE
): Promise<{ items: Complaint[]; page: number; size: number; total: number; pages: number }> {
	const q = new URLSearchParams()
	q.set('page', String(page))
	q.set('size', String(size))
	const res = await httpClient.fetchJson(`/complaints?${q.toString()}`)
	const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []
	return {
		items: items.map(normalizeComplaint),
		page: res?.page ?? page,
		size: res?.size ?? size,
		total: res?.total ?? items.length,
		pages: res?.pages ?? 1
	}
}

/**
 * Fetch complaints for supplier (uses authenticated user's supplier)
 * @deprecated Use listComplaints() instead - backend filters by role automatically
 */
export async function fetchComplaintsForSupplier(supplier?: string) {
	return listComplaints()
}

/**
 * Fetch complaints for consumer (uses authenticated user's consumer)
 * @deprecated Use listComplaints() instead - backend filters by role automatically
 */
export async function fetchComplaintsForConsumer(consumerId?: string | number) {
	return listComplaints()
}

/**
 * Update complaint status (sales rep or manager only)
 * Backend expects: { status, resolution? } (resolution required when resolving)
 */
export async function updateComplaintStatus(complaintId: string | number, status: ComplaintStatus, resolution?: string | null): Promise<Complaint> {
	const body: any = { status }
	if (resolution !== undefined && resolution !== null) {
		body.resolution = resolution
	}
	console.log('body', body)
	const res = await httpClient.fetchJson(`/complaints/${encodeURIComponent(String(complaintId))}/status`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	})
	return normalizeComplaint(res)
}

/**
 * Get complaint by order ID (helper function)
 */
export async function fetchComplaintByOrderId(orderId: string | number): Promise<Complaint | null> {
	try {
		const res = await listComplaints(1, 100)
		const complaint = res.items.find((c: Complaint) => c.order_id === Number(orderId) || c.orderId === Number(orderId))
		return complaint || null
	} catch (e) {
		return null
	}
}

/**
 * Submit consumer feedback on a resolved complaint (consumer only)
 * Backend expects: { satisfied: boolean }
 */
export async function submitConsumerFeedback(complaintId: string | number, satisfied: boolean): Promise<Complaint> {
	const res = await httpClient.fetchJson(`/complaints/${encodeURIComponent(String(complaintId))}/feedback`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ satisfied })
	})
	return normalizeComplaint(res)
}

/**
 * Reopen a resolved complaint (consumer only, if not satisfied)
 */
export async function reopenComplaint(complaintId: string | number): Promise<Complaint> {
	const res = await httpClient.fetchJson(`/complaints/${encodeURIComponent(String(complaintId))}/reopen`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' }
	})
	return normalizeComplaint(res)
}

/**
 * Normalize backend complaint response to frontend format
 */
function normalizeComplaint(complaint: any): Complaint & { consumerName?: string; consumer?: any } {
	// Helper to format full name from first_name and last_name
	const formatFullName = (person: any) => {
		if (!person) return ''
		if (person.first_name && person.last_name) {
			return `${person.first_name} ${person.last_name}`.trim()
		}
		return person.organization_name || person.company_name || person.name || ''
	}

	const consumerName = formatFullName(complaint.consumer) || complaint.consumer?.organization_name || complaint.consumer?.name || ''

	return {
		id: complaint.id,
		order_id: complaint.order_id,
		orderId: complaint.order_id,
		consumer_id: complaint.consumer_id,
		consumerId: complaint.consumer_id,
		sales_rep_id: complaint.sales_rep_id,
		salesRepId: complaint.sales_rep_id,
		manager_id: complaint.manager_id,
		managerId: complaint.manager_id,
		status: complaint.status?.toLowerCase() || 'open',
		description: complaint.description || '',
		reason: complaint.description || '',
		resolution: complaint.resolution || null,
		consumer_feedback: complaint.consumer_feedback ?? null,
		created_at: complaint.created_at,
		createdAt: complaint.created_at,
		consumerName: consumerName,
		consumer: complaint.consumer
	}
}

export default {
	createComplaint,
	getComplaint,
	listComplaints,
	fetchComplaintsForSupplier,
	fetchComplaintsForConsumer,
	updateComplaintStatus,
	fetchComplaintByOrderId,
	submitConsumerFeedback,
	reopenComplaint
}
