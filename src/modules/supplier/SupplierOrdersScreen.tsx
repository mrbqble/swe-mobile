import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/supplier/SupplierOrdersScreen.styles';
import { Feather } from '@expo/vector-icons';
import { orders } from '../../api';
import { emitter } from '../../helpers/events';
import { getTranslations, type Language } from '../../translations';
import { formatPrice } from '../../utils/formatters';

export default function SupplierOrdersScreen({ language = 'en', navigateTo, onOrderSelect, supplierName }: { language?: 'en' | 'ru'; navigateTo?: (s: string) => void; onOrderSelect?: (o: any) => void; supplierName?: string }) {
  const t = getTranslations('supplier', 'orders', language);
  const [ordersList, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);


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
          <Text style={{ color: '#2563eb', fontWeight: '700' }}>{formatPrice(item.total, t.currency)}</Text>
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

