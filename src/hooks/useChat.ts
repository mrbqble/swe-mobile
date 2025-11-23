import { useEffect } from 'react'
import { chat as api } from '../api'
import { emitter } from '../helpers/events'
import { ChatMessage } from '../helpers/types'
import { useAsync } from './useAsync'

async function fetchChatMessages(threadId: string | number, role?: string): Promise<ChatMessage[]> {
	const messages = await (api as any).fetchMessages(threadId)
	// mark read for this role when opening
	if (role) {
		try {
			await (api as any).markThreadRead(threadId, role)
		} catch (e) {
			/* ignore */
		}
	}
	return messages || []
}

export function useChat(threadId?: string | null, role?: string) {
	const { data, loading, execute } = useAsync<ChatMessage[]>({
		fn: () => fetchChatMessages(threadId!, role),
		dependencies: [threadId, role],
		immediate: !!threadId,
		transform: (messages) => messages || []
	})

	// Subscribe to event emitter for real-time updates
	useEffect(() => {
		if (!threadId) return

		if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
			const unsub = emitter.on(`chatChanged:${threadId}`, () => {
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
	}, [threadId, execute])

	return {
		messages: data || [],
		loading,
		refresh: execute
	}
}
