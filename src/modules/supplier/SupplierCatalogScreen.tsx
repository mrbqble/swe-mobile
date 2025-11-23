import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { catalog } from '../../api';
import { emitter } from '../../helpers/events';
import { toastShow } from '../../helpers/toast';
import StockEditModal from './StockEditModal';

const translations = {
  en: { catalog: 'Catalog', search: 'Search products...', addItem: 'Add Item', noProducts: 'No products yet', noProductsDesc: 'Start building your catalog by adding your first product', inStock: 'In Stock', outOfStock: 'Out of Stock', currency: '₸', edit: 'Edit', delete: 'Delete' },
  ru: { catalog: 'Каталог', search: 'Поиск товаров...', addItem: 'Добавить товар', noProducts: 'Товаров пока нет', noProductsDesc: 'Начните создание каталога, добавив первый товар', inStock: 'В наличии', outOfStock: 'Нет в наличии', currency: '₸', edit: 'Редактировать', delete: 'Удалить' }
} as const;

export default function SupplierCatalogScreen({ language = 'en', navigateTo, supplierName }: { language?: 'en' | 'ru'; navigateTo?: (s: string) => void; supplierName?: string }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const t = translations[language];

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await catalog.fetchCatalog({ search: query, supplier: supplierName } as any);
      if (mounted) setProducts(res.data || []);
    })();
    let unsub = () => {};
    if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
      unsub = emitter.on('catalogChanged', async () => {
        try { const res = await catalog.fetchCatalog({ search: query, supplier: supplierName } as any); if (mounted) setProducts(res.data || []); } catch (e) {}
      });
    }
    return () => { try { unsub(); } catch (e) {} mounted = false; };
  }, [query]);

  const filtered = products;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await catalog.fetchCatalog({ search: query, supplier: supplierName } as any);
      setProducts(res.data || []);
    } catch (e) {}
    setRefreshing(false);
  };

  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: item.imageUrl || item.image }} style={styles.thumb} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700' }}>{item.name}</Text>
              <Text style={{ color: '#6b7280', marginTop: 4, fontSize: 12 }}>SKU: {item.sku}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginLeft: 8 }}>
              <TouchableOpacity onPress={() => setEditingProduct(item)} style={{ padding: 8 }}>
                <Feather name="edit" size={18} color="#2563eb" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                // confirm then delete
                const doDelete = async () => {
                  try {
                    const ok = await (catalog as any).deleteProduct(item.id);
                    if (ok) {
                      toastShow('Deleted', 'Product removed from catalog');
                      // local refresh
                      const res = await catalog.fetchCatalog({ search: query, supplier: supplierName } as any);
                      setProducts(res.data || []);
                    } else {
                      toastShow('Error', 'Could not delete product');
                    }
                  } catch (e) { toastShow('Error', 'Could not delete product'); }
                };
                // small confirm using window.confirm-like UI - use JS confirm if available, else just call
                try {
                  const ok = (require('react-native').Alert).alert;
                  // show native confirm
                  (require('react-native').Alert).alert('Delete product', 'Are you sure you want to delete this product?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: doDelete }
                  ]);
                } catch (e) { doDelete(); }
              }} style={{ padding: 8 }}>
                <Feather name="trash-2" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
            <Text style={{ color: '#2563eb', fontWeight: '700' }}>{t.currency}{new Intl.NumberFormat('kk-KZ').format(item.price)}</Text>
            {item.stock > 0 ? (
              <View style={styles.inStock}><Text style={{ color: '#059669' }}>{t.inStock} ({item.stock})</Text></View>
            ) : (
              <View style={styles.outStock}><Text style={{ color: '#dc2626' }}>{t.outOfStock}</Text></View>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateTo && navigateTo('supplier-home')} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{t.catalog}</Text>
        <TouchableOpacity onPress={() => navigateTo && navigateTo('item-edit')} style={styles.addBtn}><Feather name="plus" size={18} color="#fff" /></TouchableOpacity>
      </View>

      <View style={{ padding: 16 }}>
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#9CA3AF" style={{ marginLeft: 8 }} />
          <TextInput placeholder={t.search} value={query} onChangeText={setQuery} style={styles.searchInput} />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={() => (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#9ca3af' }}>{t.noProducts}</Text>
            <Text style={{ color: '#9ca3af', marginTop: 8 }}>{t.noProductsDesc}</Text>
          </View>
        )}
      />
      <StockEditModal visible={!!editingProduct} current={editingProduct?.stock || 0} onClose={() => setEditingProduct(null)} onSubmit={async (newStock) => {
        if (!editingProduct) return;
        try {
          await (catalog as any).updateStock(editingProduct.id, newStock);
          toastShow('Saved', 'Stock updated');
          const res = await catalog.fetchCatalog({ search: query, supplier: supplierName } as any);
          setProducts(res.data || []);
        } catch (e) { toastShow('Error', 'Could not update stock'); }
      }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  searchBox: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, height: 44, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' },
  searchInput: { flex: 1, paddingHorizontal: 8, height: '100%' },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, marginBottom: 12 },
  thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#f3f4f6' },
  inStock: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  outStock: { backgroundColor: '#fff7f7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }
});
