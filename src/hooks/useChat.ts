import { useEffect } from 'react'
import { chat as api, user } from '../api'
import { emitter } from '../helpers/events'
import { ChatMessage } from '../helpers/types'
import { useAsync } from './useAsync'

async function fetchChatMessages(sessionId: string | number, role?: string): Promise<ChatMessage[]> {
	if (!sessionId) return [];

	const messages = await api.fetchMessages(sessionId);

	// Normalize messages: determine 'from' field based on current user
	try {
		const currentUser = await user.getMe();
		const currentUserId = currentUser?.id;

		// Map messages to determine if they're from current user
		return (messages || []).map((msg: any) => {
			const isFromCurrentUser = currentUserId && (msg.sender_id === Number(currentUserId) || msg.senderId === Number(currentUserId));
			return {
				...msg,
				from: isFromCurrentUser ? role || 'current' : (role === 'consumer' ? 'supplier' : 'consumer'),
				threadId: msg.session_id || msg.sessionId || sessionId,
				ts: msg.created_at || msg.ts
			};
		});
	} catch (e) {
		// If we can't get current user, return messages as-is
		return (messages || []).map((msg: any) => ({
			...msg,
			threadId: msg.session_id || msg.sessionId || sessionId,
			ts: msg.created_at || msg.ts
		}));
	}
}

export function useChat(sessionId?: string | number | null, role?: string) {
	const { data, loading, execute } = useAsync<ChatMessage[]>({
		fn: () => fetchChatMessages(sessionId!, role),
		dependencies: [sessionId, role],
		immediate: !!sessionId,
		transform: (messages) => messages || []
	})

	// Subscribe to event emitter for real-time updates
	useEffect(() => {
		if (!sessionId) return

		if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
			const unsub = emitter.on(`chatChanged:${sessionId}`, () => {
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
	}, [sessionId, execute])

	return {
		messages: data || [],
		loading,
		refresh: execute
	}
}
