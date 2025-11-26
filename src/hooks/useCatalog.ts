import { useState, useCallback, useRef } from 'react'
import { Product, PaginatedResponse } from '../helpers/types'
import { catalog } from '../api'
import { useAsync } from './useAsync'
import { useDebounce } from './useDebounce'
import { PAGINATION, TIMING } from '../constants'

export function useCatalog(initialQuery = '', pageSize = PAGINATION.CATALOG_PAGE_SIZE, supplierId?: number | string) {
	const [query, setQuery] = useState(initialQuery)
	const [items, setItems] = useState<Product[]>([])
	const [page, setPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const debouncedQuery = useDebounce(query, TIMING.DEBOUNCE_DELAY)
	const pageRef = useRef(1)

	// Fetch function for useAsync
	const fetchCatalogPage = useCallback(
		async (nextPage: number, searchQuery: string): Promise<PaginatedResponse<Product>> => {
			if (!supplierId) {
				// Return empty result if no supplier selected
				return { data: [], meta: { page: nextPage, limit: pageSize, total: 0, pages: 0 } }
			}
			return (catalog as any).fetchCatalog({
				supplier_id: supplierId,
				page: nextPage,
				size: pageSize,
				q: searchQuery.trim() || undefined // Backend now supports search query
			})
		},
		[supplierId, pageSize]
	)

	// Main data fetching hook - resets when query or supplierId changes
	const {
		loading,
		error,
		execute: executeFetch
	} = useAsync<PaginatedResponse<Product>>({
		fn: () => fetchCatalogPage(1, debouncedQuery),
		dependencies: [debouncedQuery, supplierId],
		onSuccess: (resp) => {
			setItems(resp.data || [])
			setPage(1)
			pageRef.current = 1
			setHasMore(1 < (resp.meta?.pages ?? 1))
		}
	})

	// Load more function for pagination
	const loadMore = useCallback(async () => {
		if (loading || loadingMore || !hasMore) return

		const nextPage = pageRef.current + 1
		setLoadingMore(true)
		try {
			const resp = await fetchCatalogPage(nextPage, debouncedQuery)
			setItems((prev) => [...prev, ...(resp.data || [])])
			setPage(nextPage)
			pageRef.current = nextPage
			setHasMore(nextPage < (resp.meta?.pages ?? 1))
		} catch (err) {
			// Error handling is done by the component if needed
			console.error('Failed to load more:', err)
		} finally {
			setLoadingMore(false)
		}
	}, [loading, loadingMore, hasMore, fetchCatalogPage, debouncedQuery])

	// Refresh function - resets to page 1
	const refresh = useCallback(async () => {
		pageRef.current = 1
		await executeFetch()
	}, [executeFetch])

	return { items, query, setQuery, loading: loading || loadingMore, error, hasMore, loadMore, refresh }
}
