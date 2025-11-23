import { Product } from '../helpers/types'
import { product } from '../api'
import { useAsync } from './useAsync'

export function useProduct(id?: number | string) {
	const { data, loading, error } = useAsync<Product>({
		fn: () => (product as any).fetchProduct(id),
		dependencies: [id],
		immediate: id != null
	})

	return {
		item: data || null,
		loading,
		error
	}
}
