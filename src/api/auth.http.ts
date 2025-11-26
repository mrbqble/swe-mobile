import httpClient from './httpClient'
import { setTokens } from './token'

export type SignupPayload = {
	email: string
	password: string
	first_name: string
	last_name: string
	role: 'consumer' | 'supplier_owner'
	organization_name?: string
}

/**
 * Register a new consumer (mobile app only supports consumer registration)
 * Backend will automatically restrict mobile signups to consumers only
 */
export async function registerConsumer(payload: SignupPayload) {
	// Backend expects POST /api/v1/auth/signup
	// Mobile app: role must be 'consumer' (enforced by backend)
	const sendPayload = {
		email: payload.email,
		password: payload.password,
		first_name: payload.first_name,
		last_name: payload.last_name,
		role: 'consumer' as const, // Mobile app only supports consumer signup
		organization_name: payload.organization_name
	}
	const body = await httpClient.fetchJson('/auth/signup', {
		method: 'POST',
		body: JSON.stringify(sendPayload),
		headers: { 'Content-Type': 'application/json' }
	})
	// Backend returns TokenResponse with access_token, refresh_token, and token_type
	if (body?.access_token) {
		await setTokens(body.access_token, body.refresh_token ?? null)
	}
	return body
}

/**
 * Login with email and password
 * Backend will return user role and restrict access based on client type
 */
export async function login(email: string, password: string) {
	const payload = { email, password }
	const body = await httpClient.fetchJson('/auth/login', {
		method: 'POST',
		body: JSON.stringify(payload),
		headers: { 'Content-Type': 'application/json' }
	})
	// Backend returns TokenResponse with access_token, refresh_token, and token_type
	if (body?.access_token) {
		await setTokens(body.access_token, body.refresh_token ?? null)
	}
	return body
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(refreshToken: string) {
	const body = await httpClient.fetchJson('/auth/refresh', {
		method: 'POST',
		body: JSON.stringify({ refresh_token: refreshToken }),
		headers: { 'Content-Type': 'application/json' }
	})
	if (body?.access_token) {
		await setTokens(body.access_token, body.refresh_token ?? null)
	}
	return body
}

/**
 * Reset password by email
 * Backend: POST /auth/reset-password
 */
export async function resetPassword(email: string, newPassword: string) {
	const body = await httpClient.fetchJson('/auth/reset-password', {
		method: 'POST',
		body: JSON.stringify({ email, new_password: newPassword }),
		headers: { 'Content-Type': 'application/json' }
	})
	return body
}

export async function logout() {
	await setTokens(null, null)
}
