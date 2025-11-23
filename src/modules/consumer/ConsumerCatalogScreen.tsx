import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { styles } from '../../styles/consumer/ConsumerCatalogScreen.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useCatalog } from '../../hooks/useCatalog';
import { useLinkedSuppliers } from '../../hooks/useLinkedSuppliers';
import { Product } from '../../helpers/types';
import { getTranslations, type Language } from '../../translations';
import { formatPrice } from '../../utils/formatters';
import { PAGINATION } from '../../constants';

interface ConsumerCatalogScreenProps {
  language: 'en' | 'ru';
  navigateTo: (screen: string) => void;
  onProductSelect: (product: Product) => void;
}

export default function ConsumerCatalogScreen({ language, navigateTo, onProductSelect }: ConsumerCatalogScreenProps) {
  const t = getTranslations('consumer', 'catalog', language || 'en');
  const { suppliers, loading: suppliersLoading } = useLinkedSuppliers();

  // compute accepted supplier ids for this consumer
  const acceptedSupplierIds = (suppliers || [])
    .filter((s: any) => String(s.status).toLowerCase() === LINK_STATUS.ACCEPTED.toLowerCase())
    .map((s: any) => s.supplier_id || s.supplierId || s.id);

  // pass first accepted supplier id to catalog hook (mobile currently fetches per-supplier)
  const firstSupplierId = acceptedSupplierIds.length > 0 ? acceptedSupplierIds[0] : undefined;
  const { items, query, setQuery, loading, error, hasMore, loadMore, refresh } = useCatalog('', PAGINATION.CATALOG_PAGE_SIZE, firstSupplierId);


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
          <Text style={styles.price}>{formatPrice(item.price, t.currency)}</Text>
          {item.stock > 0 && <Text style={styles.inStock}>{t.inStock}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  // compute accepted supplier names for this consumer
  const acceptedSuppliers = (suppliers || []).filter(s => String(s.status).toLowerCase() === LINK_STATUS.ACCEPTED.toLowerCase());

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
          data={items}
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

