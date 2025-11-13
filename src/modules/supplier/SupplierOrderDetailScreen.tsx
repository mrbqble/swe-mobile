import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fetchOrderById, Order } from '../../api/orders.mock';
import { toastShow } from '../../helpers/toast';

export default function SupplierOrderDetailScreen({ orderId, onBack, onOpenChat, language }: { orderId: string | null; onBack: () => void; onOpenChat?: () => void; language?: 'en' | 'ru' }) {
  const [order, setOrder] = useState<Order | null>(null);
  const t = {
    en: { orderDetail: 'Order Details', loading: 'Loading...', order: 'Order', supplier: 'Supplier', date: 'Date', status: 'Status', timeline: 'Timeline', orderCreated: 'Order Created', total: 'Total', qty: 'Qty', openChat: 'Open Chat' },
    ru: { orderDetail: 'Детали заказа', loading: 'Загрузка...', order: 'Заказ', supplier: 'Поставщик', date: 'Дата', status: 'Статус', timeline: 'Хронология', orderCreated: 'Заказ создан', total: 'Итого', qty: 'Кол-во', openChat: 'Открыть чат' }
  } as any;
  const L = t[language ?? 'en'];
  const [loading, setLoading] = useState(false);

  const Timeline = () => {
    const steps = [
      { key: 'Created' as const, label: L.orderCreated, icon: 'calendar' },
      { key: 'Accepted' as const, label: 'Order Accepted', icon: 'check-circle' },
      { key: 'In Progress' as const, label: 'In Progress', icon: 'clock' },
      { key: 'Completed' as const, label: 'Completed', icon: 'check' }
    ];

    const findTs = (statusKey: string) => {
      const hist = order?.statusHistory || [];
      const h = hist.find((x: any) => String(x.status) === String(statusKey));
      return h?.ts || null;
    };

    return (
      <View>
        {steps.map((s) => {
          const ts = findTs(s.key as string);
          const done = !!ts;
          return (
            <View key={s.key} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
              <View style={{ width: 36, alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: done ? '#def7ec' : '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={s.icon as any} size={16} color={done ? '#059669' : '#9ca3af'} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: done ? '700' as any : '600' as any }}>{s.label}</Text>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>{done ? (new Date(ts as any).toLocaleString() || '') : ''}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const o = await fetchOrderById(orderId);
        if (mounted) setOrder(o);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [orderId]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{L.orderDetail}</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? <View style={{ padding: 16 }}><Text>{L.loading}</Text></View> : (
        <FlatList
          ListHeaderComponent={() => (
            <View style={styles.card}>
              <View style={styles.rowBetween}><Text style={{ color: '#6b7280' }}>{L.order}</Text><Text style={{ fontWeight: '700' }}>#{order?.orderNumber}</Text></View>
              <View style={styles.rowBetween}><Text style={{ color: '#6b7280' }}>{L.supplier}</Text><Text>{order?.supplier}</Text></View>
              <View style={styles.rowBetween}><Text style={{ color: '#6b7280' }}>{L.date}</Text><Text>{order?.date}</Text></View>
              <View style={styles.rowBetween}><Text style={{ color: '#6b7280' }}>{L.status}</Text><View style={styles.statusPill}><Text style={{ color: '#059669' }}>{order?.status}</Text></View></View>
            </View>
          )}
          data={order?.items || []}
          keyExtractor={(i: any, idx) => String(i.productId) + '-' + idx}
          renderItem={({ item }: any) => (
            <View style={styles.itemRow}>
              <Text style={{ fontWeight: '600' }}>{item.name}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>{L.qty}: {item.qty}</Text>
                <Text style={{ color: '#2563eb', fontWeight: '700' }}>{`₸${new Intl.NumberFormat('kk-KZ').format(Number(item.price || 0))}`}</Text>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280' }}>{L.total}</Text>
                    <Text style={{ color: '#2563eb', fontWeight: '700' }}>{`₸${new Intl.NumberFormat('kk-KZ').format(order?.total || 0)}`}</Text>
              </View>

                  <View style={{ paddingTop: 16 }}>
                    <Text style={{ fontWeight: '700', marginBottom: 8 }}>{L.timeline}</Text>
                    <Timeline />
                  </View>

              <TouchableOpacity onPress={() => { try { if (onOpenChat) onOpenChat(); } catch (e) {} }} style={{ marginTop: 16, padding: 12, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' }}>
                <Text>{L.openChat}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, margin: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  statusPill: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  itemRow: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
