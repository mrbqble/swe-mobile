import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 220, borderRadius: 8 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  supplier: { color: '#6b7280', marginTop: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  rowBetweenLarge: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'flex-start' },
  price: { fontSize: 18, color: '#2563eb', fontWeight: '700' },
  addBtn: { marginTop: 20, backgroundColor: '#2563eb', padding: 12, borderRadius: 8 },
  stockBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  stockBadgeText: { color: '#059669', fontSize: 12, fontWeight: '600' },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  specKey: { color: '#6b7280' },
  specVal: { fontWeight: '600' },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  qtyDisplay: { minWidth: 56, alignItems: 'center', justifyContent: 'center' },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 8,
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  }
});

