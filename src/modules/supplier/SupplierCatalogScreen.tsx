import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { styles } from '../../styles/supplier/SupplierCatalogScreen.styles';
import { Feather } from '@expo/vector-icons';
import { catalog } from '../../api';
import { emitter } from '../../helpers/events';
import { getTranslations, type Language } from '../../translations';
import { formatPrice } from '../../utils/formatters';

export default function SupplierCatalogScreen({ language = 'en', navigateTo, supplierName, user }: { language?: 'en' | 'ru'; navigateTo?: (s: string) => void; supplierName?: string; user?: any }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const t = getTranslations('supplier', 'catalog', language);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        // Use /products/me endpoint which now supports sales reps
        // Backend automatically filters by authenticated user's supplier
        const res = await catalog.fetchMyProducts({ search: query, page: 1, size: 100 });
        if (mounted) {
          setProducts(res.data || []);
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to fetch products:', e);
        if (mounted) {
          setProducts([]);
          setLoading(false);
        }
      }
    })();
    let unsub = () => {};
    if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
      unsub = emitter.on('catalogChanged', async () => {
        try {
          const res = await catalog.fetchMyProducts({ search: query, page: 1, size: 100 });
          if (mounted) setProducts(res.data || []);
        } catch (e) {
          console.error('Failed to refresh products:', e);
        }
      });
    }
    return () => { try { unsub(); } catch (e) {} mounted = false; };
  }, [query]);

  const filtered = products;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await catalog.fetchMyProducts({ search: query, page: 1, size: 100 });
      setProducts(res.data || []);
    } catch (e) {
      console.error('Failed to refresh products:', e);
    }
    setRefreshing(false);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // Navigate to product detail if needed
        // navigateTo && navigateTo(`supplier-product-detail-${item.id}`);
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {item.imageUrl || item.image ? (
          <Image source={{ uri: item.imageUrl || item.image }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}>
            <Feather name="image" size={24} color="#9ca3af" />
          </View>
        )}
        <View style={{ marginLeft: 12, flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 16 }}>{item.name}</Text>
              {item.description && (
                <Text style={{ color: '#6b7280', marginTop: 4, fontSize: 12 }} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              <Text style={{ color: '#6b7280', marginTop: 4, fontSize: 12 }}>{t.sku || 'SKU:'} {item.sku}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
            <Text style={{ color: '#2563eb', fontWeight: '700', fontSize: 16 }}>{formatPrice(item.price, item.currency || t.currency)}</Text>
            {item.stock > 0 ? (
              <View style={styles.inStock}><Text style={{ color: '#059669', fontSize: 12 }}>{t.inStock} ({item.stock})</Text></View>
            ) : (
              <View style={styles.outStock}><Text style={{ color: '#dc2626', fontSize: 12 }}>{t.outOfStock}</Text></View>
            )}
          </View>
          {item.minOrderQty && (
            <Text style={{ color: '#6b7280', marginTop: 4, fontSize: 11 }}>
              {t.minOrderQty || 'Min Order'}: {item.minOrderQty}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateTo && navigateTo('supplier-home')} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{t.catalog}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={{ padding: 16 }}>
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#9CA3AF" style={{ marginLeft: 8 }} />
          <TextInput placeholder={t.search} value={query} onChangeText={setQuery} style={styles.searchInput} />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#9ca3af' }}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
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
      )}
    </SafeAreaView>
  );
}

