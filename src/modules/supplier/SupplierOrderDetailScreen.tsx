import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/supplier/SupplierOrderDetailScreen.styles';
import { Feather } from '@expo/vector-icons';
import { orders } from '../../api';
import { toastShow } from '../../helpers/toast';
import { formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_STATUS } from '../../constants';
import { getTranslations, type Language } from '../../translations';

export default function SupplierOrderDetailScreen({ orderId, onBack, onOpenChat, language }: { orderId: string | null; onBack: () => void; onOpenChat?: () => void; language?: 'en' | 'ru' }) {
  const [order, setOrder] = useState<any | null>(null);
  const L = getTranslations('supplier', 'orderDetail', language ?? 'en');
  const [loading, setLoading] = useState(false);

  const Timeline = () => {
    const steps = [
      { key: 'Created' as const, label: L.orderCreated, icon: 'calendar' },
      { key: ORDER_STATUS.ACCEPTED as const, label: 'Order Accepted', icon: 'check-circle' },
      { key: ORDER_STATUS.IN_PROGRESS as const, label: 'In Progress', icon: 'clock' },
      { key: ORDER_STATUS.COMPLETED as const, label: 'Completed', icon: 'check' }
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
                <Text style={{ color: '#6b7280', fontSize: 12 }}>{done ? formatDate(ts) : ''}</Text>
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
        const o = await orders.fetchOrderById(orderId);
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
                <Text style={{ color: '#2563eb', fontWeight: '700' }}>{formatPrice(item.price || 0)}</Text>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280' }}>{L.total}</Text>
                    <Text style={{ color: '#2563eb', fontWeight: '700' }}>{formatPrice(order?.total || 0)}</Text>
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

