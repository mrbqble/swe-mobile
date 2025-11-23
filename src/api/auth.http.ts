import httpClient from './httpClient'
import { setTokens } from './token'

export type SignupPayload = { firstName?: string; lastName?: string; email: string; password: string; role?: string }

export async function registerConsumer(payload: SignupPayload) {
	// Backend expects POST /auth/signup under /api/v1
	const body = await httpClient.fetchJson('/auth/signup', { method: 'POST', body: JSON.stringify(payload) })
	// backend returns access_token and refresh_token in response model; persist them for later use
	if (body?.access_token) {
		await setTokens(body.access_token, body.refresh_token ?? null)
	}
	return body
}

export async function login(email: string, password: string) {
	const payload = { email, password }
	const body = await httpClient.fetchJson('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
	if (body?.access_token) {
		await setTokens(body.access_token, body.refresh_token ?? null)
	}
	return body
}

export async function logout() {
	await setTokens(null, null)
}
