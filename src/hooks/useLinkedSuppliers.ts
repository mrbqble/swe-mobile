import { useEffect } from 'react'
import { linkedSuppliers } from '../api'
import { emitter } from '../helpers/events'
import { useAsync } from './useAsync'

export function useLinkedSuppliers(consumerId?: string | number) {
	const { data, loading, error, execute } = useAsync<any[]>({
		fn: () => linkedSuppliers.fetchLinkedSuppliers(consumerId),
		dependencies: [consumerId],
		transform: (res) => res || []
	})

	// Subscribe to event emitter for real-time updates
	useEffect(() => {
		if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
			const unsub = emitter.on('linkedSuppliersChanged', () => {
				execute()
			})
			return () => {
				try {
					unsub()
				} catch (e) {
					/* ignore */
				}
			}
		}
	}, [execute])

	return {
		suppliers: data || [],
		loading,
		error,
		refresh: execute
	}
}
