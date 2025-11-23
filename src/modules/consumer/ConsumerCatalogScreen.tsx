import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { styles } from '../../styles/consumer/ConsumerCatalogScreen.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useCatalog } from '../../hooks/useCatalog';
import { useLinkedSuppliers } from '../../hooks/useLinkedSuppliers';
import { Product } from '../../helpers/types';
import { getTranslations, type Language } from '../../translations';
import { formatPrice } from '../../utils/formatters';
import { PAGINATION, LINK_STATUS } from '../../constants';

interface ConsumerCatalogScreenProps {
  language: 'en' | 'ru';
  navigateTo: (screen: string) => void;
  onProductSelect: (product: Product) => void;
}

export default function ConsumerCatalogScreen({ language, navigateTo, onProductSelect }: ConsumerCatalogScreenProps) {
  const t = getTranslations('consumer', 'catalog', language || 'en');
  const { suppliers, loading: suppliersLoading } = useLinkedSuppliers();

  // compute accepted suppliers for this consumer
  const acceptedSuppliers = (suppliers || [])
    .filter((s: any) => String(s.status).toLowerCase() === LINK_STATUS.ACCEPTED.toLowerCase());

  const acceptedSupplierIds = acceptedSuppliers.map((s: any) => s.supplier_id || s.supplierId || s.id);

  // State for selected supplier
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | string | undefined>(
    acceptedSupplierIds.length > 0 ? acceptedSupplierIds[0] : undefined
  );

  // Update selected supplier when suppliers load
  useEffect(() => {
    if (acceptedSupplierIds.length > 0 && !selectedSupplierId) {
      setSelectedSupplierId(acceptedSupplierIds[0]);
    }
  }, [acceptedSupplierIds.length, selectedSupplierId]);

  const { items, query, setQuery, loading, error, hasMore, loadMore, refresh } = useCatalog('', PAGINATION.CATALOG_PAGE_SIZE, selectedSupplierId);

  // Client-side search filtering
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const searchLower = query.toLowerCase();
    return items.filter((item: Product) =>
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  }, [items, query]);


  // Get supplier name for a product
  const getSupplierName = (product: Product) => {
    if (product.supplier) return product.supplier;
    const supplier = acceptedSuppliers.find((s: any) => {
      const supplierId = s.supplier_id || s.supplierId || s.id;
      return supplierId === product.supplierId;
    });
    return supplier?.supplier?.company_name || supplier?.name || '';
  };

  const renderItem = ({ item }: { item: Product }) => {
    const supplierName = getSupplierName(item);
    return (
    <TouchableOpacity style={styles.card} onPress={() => onProductSelect(item)}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}>
            <MaterialIcons name="image-not-supported" size={32} color="#9ca3af" />
          </View>
        )}
      {item.stock === 0 && (
        <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>{t.outOfStock || 'Out of Stock'}</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
          {supplierName && <Text style={styles.supplier}>{supplierName}</Text>}
        <View style={styles.rowBetween}>
            <Text style={styles.price}>{formatPrice(item.price, item.currency || 'KZT')}</Text>
            {item.stock > 0 && <Text style={styles.inStock}>{t.inStock || 'In Stock'}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
  };


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

      {/* Supplier selector */}
      {acceptedSuppliers.length > 1 && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f9fafb' }}>
          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{t.supplier || 'Supplier:'}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {acceptedSuppliers.map((supplier: any) => {
              const supplierId = supplier.supplier_id || supplier.supplierId || supplier.id;
              const isSelected = selectedSupplierId === supplierId;
              const supplierName = supplier.supplier?.company_name || supplier.name || 'Supplier';
              return (
                <TouchableOpacity
                  key={supplierId}
                  onPress={() => setSelectedSupplierId(supplierId)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: isSelected ? '#2563eb' : '#fff',
                    borderWidth: 1,
                    borderColor: isSelected ? '#2563eb' : '#e5e7eb',
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    color: isSelected ? '#fff' : '#374151',
                    fontWeight: isSelected ? '600' : '400'
                  }}>
                    {supplierName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.searchWrap}>
        <Feather name="search" size={18} color="#9CA3AF" style={{ marginLeft: 8 }} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t.search || 'Search products...'}
          style={styles.searchInput}
        />
      </View>

      {suppliersLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : acceptedSuppliers.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: '#6b7280', textAlign: 'center' }}>{t.noAcceptedLinks || "You don't have any accepted supplier links yet. Request a link from suppliers to view their catalog."}</Text>
          <TouchableOpacity onPress={() => navigateTo('linked-suppliers')} style={{ marginTop: 12, padding: 12, backgroundColor: '#2563eb', borderRadius: 8 }}><Text style={{ color: '#fff' }}>{t.requestLink || 'Request Link'}</Text></TouchableOpacity>
        </View>
      ) : loading && items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : error ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#ef4444' }}>{t.errorLoadingProducts || 'Error loading products'}</Text>
          <TouchableOpacity onPress={() => refresh()} style={{ marginTop: 8 }}>
            <Text style={{ color: '#2563eb' }}>{t.retry || 'Retry'}</Text>
          </TouchableOpacity>
        </View>
      ) : filteredItems.length === 0 && query.trim() ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Feather name="search" size={48} color="#cbd5e1" />
          <Text style={{ color: '#6b7280', marginTop: 12, fontSize: 16, fontWeight: '600' }}>
            {t.noProductsFound || 'No products found'}
          </Text>
          <Text style={{ color: '#9ca3af', marginTop: 4, textAlign: 'center' }}>
            {t.tryDifferentSearch || 'Try a different search term'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(i) => String(i.id)}
          numColumns={2}
          contentContainerStyle={{ padding: 12 }}
          renderItem={renderItem}
          onEndReached={() => { if (hasMore && !query.trim()) loadMore(); }}
          onEndReachedThreshold={0.5}
          refreshing={loading && items.length > 0}
          onRefresh={() => refresh()}
          ListEmptyComponent={
            !loading ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: '#6b7280' }}>{t.noProductsAvailable || 'No products available'}</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

