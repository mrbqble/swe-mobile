import { useEffect, useState } from 'react';
import { chat as api } from '../api';
import { emitter } from '../helpers/events';
import { ChatMessage } from '../helpers/types';

export function useChat(threadId?: string | null, role?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!threadId) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const m = await (api as any).fetchMessages(threadId);
        if (mounted) setMessages(m || []);
        // mark read for this role when opening
        if (role) {
          try { await (api as any).markThreadRead(threadId, role); } catch (e) {}
        }
      } finally { if (mounted) setLoading(false); }
    })();

    let unsub = () => {};
    if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
      unsub = emitter.on(`chatChanged:${threadId}`, async () => {
        try {
          const m = await (api as any).fetchMessages(threadId);
          if (mounted) setMessages(m || []);
        } catch (e) {}
      });
    }

    return () => { try { unsub(); } catch (e) {} mounted = false; };
  }, [threadId, role]);

  return { messages, loading, refresh: async () => { if (!threadId) return; const m = await api.fetchMessages(threadId); setMessages(m || []); } };
}
