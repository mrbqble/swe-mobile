import httpClient from './httpClient'

export type LinkStatus = 'pending' | 'accepted' | 'denied' | 'blocked'
// Match backend LinkResponse shape: id, consumer_id, supplier_id, status, created_at, updated_at
export type LinkedSupplier = {
	id: number | string
	consumer_id?: number | string
	supplier_id?: number | string
	status: LinkStatus
	created_at?: string
	updated_at?: string
}
// If backend includes supplier object, map it to this shape
export type LinkedSupplierWithSupplier = LinkedSupplier & { supplier?: { id: number | string; company_name?: string; is_active?: boolean } }
export type LinkRequest = { id: number | string; supplier_id?: number | string; consumer_id?: number | string; status?: string; created_at?: string }

export async function fetchLinkedSuppliers(consumerId?: string | number) {
	const q = new URLSearchParams()
	// Backend endpoint doesn't need consumer_id param - it uses authenticated user
	const query = q.toString() ? `?${q.toString()}` : ''
	const res = await httpClient.fetchJson(`/links${query}`)
	// Backend returns a pagination object { items: [...], page, size, total, pages }
	const raw = Array.isArray(res) ? res : res && Array.isArray(res.items) ? res.items : []
	// Normalize items for UI: map supplier.company_name -> name and capitalize status
	const normalized = (raw || []).map((it: any) => {
		const supplier = it.supplier || it
		// Format full name from first_name and last_name
		const formatFullName = (person: any) => {
			if (!person) return ''
			if (person.first_name && person.last_name) {
				return `${person.first_name} ${person.last_name}`.trim()
			}
			return person.company_name || person.organization_name || person.name || ''
		}
		const name = formatFullName(supplier) || (supplier?.company_name ?? supplier?.name ?? '')
		const statusRaw = (it.status || '').toString()
		// Capitalize first letter for display
		const status = statusRaw ? statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase() : ''
		return { ...it, name, status, supplier } as LinkedSupplierWithSupplier & { name?: string }
	})
	return normalized as LinkedSupplierWithSupplier[]
}

export async function addLinkRequest(supplierId: string, consumerId?: string | number) {
	return httpClient.fetchJson('/links/requests', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ supplier_id: Number(supplierId) || supplierId })
	})
}

// Supplier-side: fetch incoming link requests
export async function fetchLinkRequests(supplierId?: string | number) {
	// Backend endpoint doesn't need supplier_id param - it uses authenticated user's supplier
	const res = await httpClient.fetchJson(`/links/incoming`)
	const raw = Array.isArray(res) ? res : res && Array.isArray(res.items) ? res.items : []
	// Normalize consumer and supplier sub-objects and status for UI
	const normalized = (raw || []).map((it: any) => {
		const consumer = it.consumer || null
		const supplier = it.supplier || null
		// Format full name from first_name and last_name
		const formatFullName = (person: any) => {
			if (!person) return ''
			if (person.first_name && person.last_name) {
				return `${person.first_name} ${person.last_name}`.trim()
			}
			return person.organization_name || person.company_name || person.name || ''
		}
		const consumerName = formatFullName(consumer) || consumer?.organization_name || consumer?.name || ''
		const supplierName = formatFullName(supplier) || (supplier?.company_name ?? supplier?.name ?? '')
		const statusRaw = (it.status || '').toString()
		// Capitalize first letter for display
		const status = statusRaw ? statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase() : ''
		return {
			...it,
			consumer: consumer ? { ...consumer, organization_name: consumerName } : null,
			supplier: supplier ? { ...supplier, company_name: supplierName } : null,
			status,
			name: consumerName // For backward compatibility
		} as any
	})
	return normalized as LinkRequest[]
}

export async function updateLinkRequestStatus(requestId: string | number, newStatus: string) {
	// Backend expects lowercase status values: pending, accepted, denied, blocked
	const normalizedStatus = newStatus.toLowerCase()
	return httpClient.fetchJson(`/links/${encodeURIComponent(String(requestId))}/status`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ status: normalizedStatus })
	})
}

export async function getLink(linkId: string | number) {
	return httpClient.fetchJson(`/links/${encodeURIComponent(String(linkId))}`)
}

export default {
	fetchLinkedSuppliers,
	addLinkRequest,
	fetchLinkRequests,
	updateLinkRequestStatus,
	getLink
}
