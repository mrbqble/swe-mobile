import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center'
  },
  img: {
    width: 72,
    height: 72,
    borderRadius: 8
  },
  imgPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#f3f4f6'
  },
  footer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  clearBtn: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkoutBtn: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

