import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  searchBox: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, height: 44, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' },
  searchInput: { flex: 1, paddingHorizontal: 8, height: '100%' },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, marginBottom: 12 },
  thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#f3f4f6' },
  inStock: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  outStock: { backgroundColor: '#fff7f7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }
});

