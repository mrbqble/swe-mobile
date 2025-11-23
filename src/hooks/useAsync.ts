import { useEffect, useRef, useState, useCallback } from 'react'

export interface UseAsyncOptions<T> {
	/**
	 * The async function to execute
	 */
	fn: () => Promise<T>
	/**
	 * Dependencies array - when these change, the async function will re-run
	 */
	dependencies?: any[]
	/**
	 * Whether to execute immediately on mount (default: true)
	 */
	immediate?: boolean
	/**
	 * Transform function to apply to the result before setting state
	 */
	transform?: (data: T) => T
	/**
	 * Callback when data is successfully fetched
	 */
	onSuccess?: (data: T) => void
	/**
	 * Callback when an error occurs
	 */
	onError?: (error: Error) => void
}

export interface UseAsyncResult<T> {
	/**
	 * The data returned from the async function
	 */
	data: T | null
	/**
	 * Loading state
	 */
	loading: boolean
	/**
	 * Error state
	 */
	error: Error | null
	/**
	 * Manually trigger the async function
	 */
	execute: () => Promise<void>
	/**
	 * Reset the state (clear data, error, loading)
	 */
	reset: () => void
}

/**
 * Generic hook for handling async operations with loading, error, and data states.
 * Handles cleanup automatically to prevent state updates on unmounted components.
 *
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useAsync({
 *   fn: () => fetchUser(userId),
 *   dependencies: [userId],
 *   transform: (user) => ({ ...user, displayName: `${user.firstName} ${user.lastName}` })
 * })
 * ```
 */
export function useAsync<T>(options: UseAsyncOptions<T>): UseAsyncResult<T> {
	const { fn, dependencies = [], immediate = true, transform, onSuccess, onError } = options

	const [data, setData] = useState<T | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)
	const mountedRef = useRef(true)

	// Cleanup on unmount
	useEffect(() => {
		mountedRef.current = true
		return () => {
			mountedRef.current = false
		}
	}, [])

	const execute = useCallback(async () => {
		if (!mountedRef.current) return

		setLoading(true)
		setError(null)

		try {
			const result = await fn()
			if (!mountedRef.current) return

			const transformedResult = transform ? transform(result) : result
			setData(transformedResult)
			onSuccess?.(transformedResult)
		} catch (err) {
			if (!mountedRef.current) return

			const error = err instanceof Error ? err : new Error(String(err))
			setError(error)
			onError?.(error)
		} finally {
			if (mountedRef.current) {
				setLoading(false)
			}
		}
	}, [fn, transform, onSuccess, onError])

	// Execute when dependencies change
	useEffect(() => {
		if (immediate) {
			execute()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [...dependencies, immediate])

	const reset = useCallback(() => {
		setData(null)
		setError(null)
		setLoading(false)
	}, [])

	return { data, loading, error, execute, reset }
}

