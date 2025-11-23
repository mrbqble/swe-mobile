import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { styles } from '../../styles/supplier/SupplierCatalogScreen.styles';
import { Feather } from '@expo/vector-icons';
import { catalog } from '../../api';
import { emitter } from '../../helpers/events';
import { getTranslations, type Language } from '../../translations';
import { formatPrice } from '../../utils/formatters';

export default function SupplierCatalogScreen({ language = 'en', navigateTo, supplierName }: { language?: 'en' | 'ru'; navigateTo?: (s: string) => void; supplierName?: string }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const t = getTranslations('supplier', 'catalog', language);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await catalog.fetchMyProducts({ search: query });
        if (mounted) setProducts(res.data || []);
      } catch (e) {
        console.error('Failed to fetch products:', e);
        if (mounted) setProducts([]);
      }
    })();
    let unsub = () => {};
    if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
      unsub = emitter.on('catalogChanged', async () => {
        try {
          const res = await catalog.fetchMyProducts({ search: query });
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
      const res = await catalog.fetchMyProducts({ search: query });
      setProducts(res.data || []);
    } catch (e) {
      console.error('Failed to refresh products:', e);
    }
    setRefreshing(false);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: item.imageUrl || item.image }} style={styles.thumb} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700' }}>{item.name}</Text>
              <Text style={{ color: '#6b7280', marginTop: 4, fontSize: 12 }}>{t.sku || 'SKU:'} {item.sku}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
            <Text style={{ color: '#2563eb', fontWeight: '700' }}>{formatPrice(item.price, t.currency)}</Text>
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
        <View style={{ width: 36 }} />
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
    </SafeAreaView>
  );
}

