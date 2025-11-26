import httpClient from './httpClient';

export type User = {
	id: number;
	email: string;
	role: string;
	first_name: string;
	last_name: string;
	is_active?: boolean;
	created_at?: string;
	organization_name?: string | null; // Organization name (for consumers only)
	profile_image?: string | null; // Base64 encoded profile image (for consumers only)
	company_name?: string | null; // Company name (for supplier staff only)
};

/**
 * Get current authenticated user
 * Backend: GET /users/me
 */
export async function getMe(): Promise<User> {
	return httpClient.fetchJson('/users/me');
}

/**
 * Update current user's profile
 * Backend: PUT /users/me
 * Backend expects: { email?, first_name?, last_name?, organization_name? }
 */
export async function updateProfile(data: {
	email?: string;
	first_name?: string;
	last_name?: string;
	organization_name?: string;
	profile_image?: string;
}): Promise<User> {
	return httpClient.fetchJson('/users/me', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

/**
 * Change user password
 * Backend: PATCH /users/me/password
 * Backend expects: { current_password, new_password }
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
	return httpClient.fetchJson('/users/me/password', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			current_password: currentPassword,
			new_password: newPassword
		})
	});
}

/**
 * Deactivate user account
 * Backend: POST /users/me/deactivate
 * Only consumers can deactivate their accounts
 */
export async function deactivateAccount(): Promise<{ message: string }> {
	return httpClient.fetchJson('/users/me/deactivate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' }
	});
}

export default { getMe, updateProfile, changePassword, deactivateAccount };
