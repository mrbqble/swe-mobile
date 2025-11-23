import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600'
  },
  searchWrap: {
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingRight: 8,
    backgroundColor: '#fff'
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    height: '100%'
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover'
  },
  outOfStockOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  outOfStockText: {
    color: '#fff',
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12
  },
  cardBody: {
    padding: 10
  },
  productName: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
    fontWeight: '600'
  },
  supplier: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    color: '#2563eb',
    fontWeight: '700'
  },
  inStock: {
    fontSize: 12,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6
  }
});

