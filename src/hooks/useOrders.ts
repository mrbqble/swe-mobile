import { orders as ordersApi } from '../api'
import { useAsync } from './useAsync'
import { emitter } from '../helpers/events'
import { useEffect } from 'react'

function extractOrdersItems(res: any): any[] {
	return Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : res?.data || []
}

// Normalize backend order structure to frontend format
function normalizeOrder(order: any) {
	const total = typeof order.total_kzt === 'string' ? parseFloat(order.total_kzt) : Number(order.total_kzt || 0)
	const items = order.items || []
	const itemsCount = items.length

	// Calculate total items quantity
	const totalQty = items.reduce((sum: number, item: any) => sum + (item.qty || 0), 0)

	// Helper to format full name from first_name and last_name
	const formatFullName = (person: any) => {
		if (!person) return ''
		// Check if user object exists (nested relationship)
		const user = person.user || person
		if (user?.first_name && user?.last_name) {
			return `${user.first_name} ${user.last_name}`.trim()
		}
		return person.organization_name || person.company_name || person.name || ''
	}

	return {
		id: order.id,
		orderNumber: `#${order.id}`,
		supplier_id: order.supplier_id,
		consumer_id: order.consumer_id,
		supplier: order.supplier?.company_name || formatFullName(order.supplier) || order.supplier?.name || '',
		consumer: formatFullName(order.consumer) || order.consumer?.organization_name || order.consumer?.name || '',
		status: order.status || 'pending',
		total: total,
		total_kzt: order.total_kzt,
		date: order.created_at,
		created_at: order.created_at,
		items: items.map((item: any) => ({
			id: item.id,
			product_id: item.product_id,
			productId: item.product_id,
			qty: item.qty,
			quantity: item.qty,
			unit_price_kzt: item.unit_price_kzt,
			price: typeof item.unit_price_kzt === 'string' ? parseFloat(item.unit_price_kzt) : Number(item.unit_price_kzt || 0),
			name: item.product?.name || `Product ${item.product_id}`,
			description: item.product?.description || '',
		})),
		itemsCount: itemsCount,
		totalQty: totalQty,
	}
}

async function fetchOrders(consumerId?: string | number) {
	// Backend automatically filters by role - consumer sees own orders
	const res = await (ordersApi as any).listOrders({ page: 1, size: 50 })
	const items = extractOrdersItems(res)
	// Normalize order data for frontend
	return items.map((order: any) => normalizeOrder(order))
}

export function useOrders(consumerId?: string | number) {
	const { data, loading, error, execute } = useAsync<any[]>({
		fn: () => fetchOrders(consumerId),
		dependencies: [consumerId],
		transform: (items) => items || []
	})

	// Subscribe to order changes
	useEffect(() => {
		if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
			const unsub = emitter.on('ordersChanged', () => {
				execute()
			})
			return () => {
				try {
					unsub()
				} catch (e) {
					// ignore
				}
			}
		}
	}, [execute])

	return {
		orders: data || [],
		loading,
		error,
		refresh: execute
	}
}
