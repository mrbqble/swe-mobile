import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useLinkedSuppliers } from '../../hooks/useLinkedSuppliers';

export default function ConsumerSuppliersScreen({ onBack, onRequestLink, language }: { onBack?: () => void; onRequestLink?: () => void; language?: 'en' | 'ru' }) {
  const { suppliers, loading } = useLinkedSuppliers();
  const t = { en: { linkedSuppliers: 'Linked Suppliers', loading: 'Loading...', products: 'products' }, ru: { linkedSuppliers: 'Связанные поставщики', loading: 'Загрузка...', products: 'товаров' } } as any;
  const L = t[language ?? 'en'];

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <View style={styles.avatarPlaceholder}><MaterialIcons name="apartment" size={18} color="#2563eb" /></View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontWeight: '700' }}>{item.name}</Text>
          <Text style={{ color: '#6b7280', marginTop: 4 }}>{item.rating ? `★ ${item.rating} · ${item.productsCount} products` : `${item.productsCount ?? 0} products`}</Text>
        </View>
        <View style={[styles.statusPill, item.status === 'Accepted' ? { backgroundColor: '#ecfdf5' } : item.status === 'Pending' ? { backgroundColor: '#fff7ed' } : { backgroundColor: '#fee2e2' }]}>
          <Text style={[styles.statusText, item.status === 'Accepted' ? { color: '#059669' } : item.status === 'Pending' ? { color: '#b45309' } : { color: '#dc2626' }]}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{L.linkedSuppliers}</Text>
        <TouchableOpacity onPress={onRequestLink} style={styles.addButton}><Feather name="plus" size={18} color="#fff" /></TouchableOpacity>
      </View>

      {loading ? <View style={{ padding: 16 }}><Text>{L.loading}</Text></View> : (
        <FlatList data={suppliers} keyExtractor={(i: any) => i.id} contentContainerStyle={{ padding: 16 }} renderItem={renderItem} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, marginBottom: 12 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontWeight: '700', fontSize: 12 }
  ,
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }
});
