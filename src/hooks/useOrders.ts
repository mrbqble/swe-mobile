import { orders as ordersApi } from '../api'
import { useAsync } from './useAsync'

function extractOrdersItems(res: any): any[] {
	return Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : res?.data || []
}

async function fetchOrders(consumerId?: string | number) {
	const res = (ordersApi as any).fetchOrdersForConsumer
		? await (ordersApi as any).fetchOrdersForConsumer(consumerId)
		: await (ordersApi as any).listOrders({})
	return extractOrdersItems(res)
}

export function useOrders(consumerId?: string | number) {
	const { data, loading, error, execute } = useAsync<any[]>({
		fn: () => fetchOrders(consumerId),
		dependencies: [consumerId],
		transform: (items) => items || []
	})

	return {
		orders: data || [],
		loading,
		error,
		refresh: execute
	}
}
