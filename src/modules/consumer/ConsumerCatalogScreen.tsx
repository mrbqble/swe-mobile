import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';

import { useCatalog } from '../../hooks/useCatalog';
import { useLinkedSuppliers } from '../../hooks/useLinkedSuppliers';
import { Product } from '../../helpers/types';

interface ConsumerCatalogScreenProps {
  language: 'en' | 'ru';
  navigateTo: (screen: string) => void;
  onProductSelect: (product: Product) => void;
}

const translations = {
  en: {
    catalog: 'Catalog',
    search: 'Search products...',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    currency: '₸'
  },
  ru: {
    catalog: 'Каталог',
    search: 'Поиск товаров...',
    inStock: 'В наличии',
    outOfStock: 'Нет в наличии',
    currency: '₸'
  }
};

// useCatalog provides items, loading, error, pagination helpers

export default function ConsumerCatalogScreen({ language, navigateTo, onProductSelect }: ConsumerCatalogScreenProps) {
  const t = translations[language];
  const { items, query, setQuery, loading, error, hasMore, loadMore, refresh } = useCatalog('');
  const { suppliers, loading: suppliersLoading } = useLinkedSuppliers();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('kk-KZ').format(price);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.card} onPress={() => onProductSelect(item)}>
      <Image source={{ uri: (item.imageUrl || (item as any).image) }} style={styles.image} />
      {item.stock === 0 && (
        <View style={styles.outOfStockOverlay}>
          <Text style={styles.outOfStockText}>{t.outOfStock}</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
        <Text style={styles.supplier}>{item.supplier}</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.price}>{t.currency}{formatPrice(item.price)}</Text>
          {item.stock > 0 && <Text style={styles.inStock}>{t.inStock}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  // compute accepted supplier names for this consumer
  const acceptedSuppliers = (suppliers || []).filter(s => String(s.status).toLowerCase() === 'accepted').map(s => String(s.name).toLowerCase());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigateTo('consumer-home')} style={{ marginRight: 12 }}>
            <Feather name="arrow-left" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.catalog}</Text>
        </View>
        <TouchableOpacity onPress={() => navigateTo('cart')}>
          <Feather name="shopping-cart" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Feather name="search" size={18} color="#9CA3AF" style={{ marginLeft: 8 }} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t.search}
          style={styles.searchInput}
        />
      </View>

      {suppliersLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : acceptedSuppliers.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: '#6b7280', textAlign: 'center' }}>You don't have any accepted supplier links yet. Request a link from suppliers to view their catalog.</Text>
          <TouchableOpacity onPress={() => navigateTo('linked-suppliers')} style={{ marginTop: 12, padding: 12, backgroundColor: '#2563eb', borderRadius: 8 }}><Text style={{ color: '#fff' }}>Request Link</Text></TouchableOpacity>
        </View>
      ) : loading && items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : error ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#ef4444' }}>Error loading products</Text>
          <TouchableOpacity onPress={() => refresh()} style={{ marginTop: 8 }}>
            <Text style={{ color: '#2563eb' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items.filter(it => acceptedSuppliers.includes(String((it.supplier || '').toLowerCase())))}
          keyExtractor={(i) => String(i.id)}
          numColumns={2}
          contentContainerStyle={{ padding: 12 }}
          renderItem={renderItem}
          onEndReached={() => { if (hasMore) loadMore(); }}
          onEndReachedThreshold={0.5}
          refreshing={loading && items.length > 0}
          onRefresh={() => refresh()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
