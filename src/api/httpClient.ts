import Config from '../config'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './token'

const { API_BASE, DEFAULT_HEADERS } = Config

async function augmentHeaders(inputHeaders?: Record<string, string>) {
	const headers: Record<string, string> = { ...(inputHeaders || {}), ...DEFAULT_HEADERS }
	const token = await getAccessToken()
	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}
	return headers
}

async function fetchJson(path: string, opts: RequestInit = {}) {
	const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
	const headers = await augmentHeaders(opts.headers as Record<string, string> | undefined)
	let res = await fetch(url, { ...opts, headers })
	let text = await res.text()
	let body = null
	try {
		body = text ? JSON.parse(text) : null
	} catch (e) {
		// If JSON parsing fails, create error with response text
		const err: any = new Error(`Invalid JSON response: ${text?.substring(0, 100)}`)
		err.status = res.status
		err.body = { detail: text }
		throw err
	}

	// If unauthorized, attempt refresh and retry once
	if (res.status === 401) {
		const refreshToken = await getRefreshToken()
		if (refreshToken) {
			try {
				// Use consistent URL construction pattern
				const refreshPath = '/auth/refresh'
				const refreshUrl = refreshPath.startsWith('http') ? refreshPath : `${API_BASE}${refreshPath.startsWith('/') ? '' : '/'}${refreshPath}`
				const refreshRes = await fetch(refreshUrl, {
					method: 'POST',
					headers: { ...DEFAULT_HEADERS },
					body: JSON.stringify({ refresh_token: refreshToken })
				})
				const refreshText = await refreshRes.text()
				const refreshBody = refreshText ? JSON.parse(refreshText) : null
				if (refreshRes.ok && refreshBody?.access_token) {
					// Persist new tokens
					await setTokens(refreshBody.access_token, refreshBody.refresh_token ?? null)

					// Retry original request with new access token
					const retryHeaders = await augmentHeaders(opts.headers as Record<string, string> | undefined)
					res = await fetch(url, { ...opts, headers: retryHeaders })
					const retryText = await res.text()
					body = retryText ? JSON.parse(retryText) : null
				} else {
					// Refresh failed: clear tokens and propagate original error
					await clearTokens()
				}
			} catch (e) {
				// Refresh attempt failed unexpectedly - clear tokens and continue to throw
				await clearTokens()
			}
		}
	}

	if (!res.ok) {
		const err: any = new Error(body?.detail || body?.error || `HTTP ${res.status}`)
		err.status = res.status
		err.body = body
		throw err
	}

	return body
}

export default { fetchJson }
