import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useOrders } from '../../hooks/useOrders';

export default function ConsumerOrdersScreen({ onBack, onOpenOrder, language }: { onBack?: () => void; onOpenOrder?: (id: string) => void; language?: 'en' | 'ru' }) {
  const { orders, loading } = useOrders();
  const t = {
    en: { orders: 'Orders', loading: 'Loading...', orderPrefix: 'Order #', items: 'items' },
    ru: { orders: 'Заказы', loading: 'Загрузка...', orderPrefix: 'Заказ №', items: 'товаров' }
  } as any;
  const L = t[language ?? 'en'];

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => onOpenOrder && onOpenOrder(item.id)}>
      <View style={styles.cardHeader}>
  <Text style={styles.orderTitle}>{L.orderPrefix}{item.orderNumber}</Text>
        <View style={[styles.statusPill, item.status === 'Resolved' ? { backgroundColor: '#ecfdf5' } : { backgroundColor: '#eff6ff' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.supplier}>{item.supplier}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.date}>{item.date}</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.total}>{`₸${new Intl.NumberFormat('kk-KZ').format(item.total)}`}</Text>
          <Text style={styles.itemCount}>{`${item.itemsCount} ${L.items}`}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{L.orders}</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={{ padding: 16 }}><Text>{L.loading}</Text></View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(i: any) => i.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTitle: { fontWeight: '700' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, color: '#059669', fontWeight: '600' },
  supplier: { color: '#6b7280', marginTop: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' },
  date: { color: '#6b7280' },
  total: { color: '#2563eb', fontWeight: '700' },
  itemCount: { color: '#6b7280', fontSize: 12 }
});
