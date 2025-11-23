import { suppliers as api } from '../api'
import { Supplier } from '../helpers/types'
import { useAsync } from './useAsync'

export function useSupplierSearch(query: string) {
	const { data, loading, error } = useAsync<Supplier[]>({
		fn: () => api.searchSuppliers(query),
		dependencies: [query],
		onError: () => {
			// On error, return empty array (handled by transform)
		}
	})

	return {
		results: data || [],
		loading,
		error
	}
}
