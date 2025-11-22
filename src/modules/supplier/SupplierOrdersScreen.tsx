import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { orders } from '../../api';
import { emitter } from '../../helpers/events';

const translations = {
  en: { orders: 'Orders', noOrders: 'No orders yet', noOrdersDesc: 'Customer orders will appear here', order: 'Order', customer: 'Customer', currency: '₸', items: 'items' },
  ru: { orders: 'Заказы', noOrders: 'Заказов пока нет', noOrdersDesc: 'Заказы клиентов будут отображаться здесь', order: 'Заказ', customer: 'Клиент', currency: '₸', items: 'товаров' }
} as const;

const mockOrders = [
  { id: 'o1', number: 'ORD-001', date: '2024-01-15', total: 129000, itemCount: 2, status: 'created', customer: 'John Smith', organization: 'Smith Trading LLC' },
  { id: 'o2', number: 'ORD-002', date: '2024-01-14', total: 450000, itemCount: 1, status: 'accepted', customer: 'Elena Nazarbayeva', organization: 'Astana Construction' },
  { id: 'o3', number: 'ORD-003', date: '2024-01-13', total: 3500, itemCount: 1, status: 'in_progress', customer: 'Dmitry Petrov', organization: 'Almaty Tech Solutions' },
  { id: 'o4', number: 'ORD-004', date: '2024-01-12', total: 12500, itemCount: 1, status: 'resolved', customer: 'Aigerim Suleimenova', organization: 'Shymkent Industries' }
];

export default function SupplierOrdersScreen({ language = 'en', navigateTo, onOrderSelect, supplierName }: { language?: 'en' | 'ru'; navigateTo?: (s: string) => void; onOrderSelect?: (o: any) => void; supplierName?: string }) {
  const t = translations[language];
  const [ordersList, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const formatPrice = (price: number) => new Intl.NumberFormat('kk-KZ').format(price);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await orders.fetchOrdersForConsumer(undefined, supplierName);
      if (mounted) setOrders(res || []);
    })();
    let unsub = () => {};
    if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
      unsub = emitter.on('ordersChanged', async () => {
        try {
          const res = await orders.fetchOrdersForConsumer(undefined, supplierName);
          if (mounted) setOrders(res || []);
        } catch (e) {}
      });
    }
    return () => { try { unsub(); } catch (e) {} mounted = false; };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await orders.fetchOrdersForConsumer(undefined, supplierName);
      setOrders(res || []);
    } catch (e) {}
    setRefreshing(false);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => onOrderSelect && onOrderSelect(item)}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={{ fontWeight: '700' }}>{t.order} #{item.orderNumber || item.number}</Text>
          <Text style={{ color: '#6b7280' }}>{item.customer}</Text>
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>{item.organization}</Text>
        </View>
        <View style={styles.statusPill}><Text style={{ color: '#059669' }}>{item.status}</Text></View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <Text style={{ color: '#6b7280' }}>{item.date}</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: '#2563eb', fontWeight: '700' }}>{t.currency}{formatPrice(item.total)}</Text>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>{item.itemCount} {t.items}</Text>
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
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{t.orders}</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={ordersList}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={() => (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#9ca3af' }}>{t.noOrders}</Text>
            <Text style={{ color: '#9ca3af', marginTop: 8 }}>{t.noOrdersDesc}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }
});
