// Placeholder HTTP adapter for complaints. Implement real HTTP calls to your backend and return same shapes as the mock.
import Config from '../config'

const { API_BASE } = Config

export type Complaint = {
	id: string
	orderId: string
	consumerId?: string | number
	supplier?: string
	reason?: string
	status?: 'Open' | 'In Progress' | 'Resolved' | 'Rejected'
	createdAt: string
}

async function getJson(res: Response) {
	if (!res.ok) throw new Error(`HTTP ${res.status}`)
	return res.json()
}

export async function createComplaint(orderId: string, consumerId?: string | number, supplier?: string, reason?: string) {
	const res = await fetch(`${API_BASE}/api/complaints`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ orderId, consumerId, supplier, reason })
	})
	return getJson(res) as Promise<Complaint>
}

export async function fetchComplaintsForSupplier(supplier?: string) {
	const url = new URL(`${API_BASE}/api/complaints`)
	if (supplier) url.searchParams.set('supplier', supplier)
	const res = await fetch(url.toString())
	return getJson(res) as Promise<Complaint[]>
}

export async function fetchComplaintsForConsumer(consumerId?: string | number) {
	const url = new URL(`${API_BASE}/api/complaints`)
	if (consumerId) url.searchParams.set('consumerId', String(consumerId))
	const res = await fetch(url.toString())
	return getJson(res) as Promise<Complaint[]>
}

export async function updateComplaintStatus(complaintId: string, status: Complaint['status']) {
	const res = await fetch(`${API_BASE}/api/complaints/${encodeURIComponent(complaintId)}/status`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ status })
	})
	return getJson(res) as Promise<Complaint>
}

export async function escalateToManager(complaintId: string) {
	const res = await fetch(`${API_BASE}/api/complaints/${encodeURIComponent(complaintId)}/escalate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' }
	})
	return getJson(res)
}

export default { createComplaint, fetchComplaintsForSupplier, fetchComplaintsForConsumer, updateComplaintStatus }
