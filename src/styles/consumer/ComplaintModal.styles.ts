import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 },
	card: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
	title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
	input: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, minHeight: 80 },
	row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
	cancel: { padding: 8, marginRight: 8 },
	submit: { padding: 8, backgroundColor: '#b91c1c', borderRadius: 8 },
});

