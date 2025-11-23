import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center' },
  composer: { flexDirection: 'row', alignItems: 'center', padding: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6', backgroundColor: '#fff' },
  input: { flex: 1, borderRadius: 24, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, height: 44, marginRight: 8 },
  sendBtn: { backgroundColor: '#2563eb', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  msgRow: { marginVertical: 6, flexDirection: 'row' },
  msgRowLeft: { justifyContent: 'flex-start' },
  msgRowRight: { justifyContent: 'flex-end' },
  msgBubble: { maxWidth: '80%', padding: 10, borderRadius: 12 },
  msgBubbleLeft: { backgroundColor: '#f3f4f6', borderTopLeftRadius: 4 },
  msgBubbleRight: { backgroundColor: '#2563eb', borderTopRightRadius: 4 },
  msgTextLeft: { color: '#111827' },
  msgTextRight: { color: '#fff' },
  msgTs: { fontSize: 10, color: '#6b7280', marginTop: 6, textAlign: 'right' },
  /* system message styles */
  systemBlock: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, maxWidth: '92%' },
  systemText: { color: '#111827', textAlign: 'center', fontWeight: '600' },
  systemError: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca' },
  systemWarning: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa' },
  systemSuccess: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#bbf7d0' },
  systemInfo: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  /* sender header */
  senderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarYou: { backgroundColor: '#2563eb' },
  avatarOther: { backgroundColor: '#e5e7eb' },
  avatarText: { fontSize: 12, fontWeight: '700' },
  avatarTextYou: { color: '#fff' },
  avatarTextOther: { color: '#111827' },
  senderLabel: { fontSize: 12, color: '#6b7280' },
  senderLabelYou: { color: '#2563eb', fontWeight: '700' },
  senderLabelOther: { color: '#6b7280' }
});

