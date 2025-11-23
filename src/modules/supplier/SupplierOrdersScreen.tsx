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


  // Normalize backend order structure to frontend format
  const normalizeOrder = (order: any) => {
    const total = typeof order.total_kzt === 'string' ? parseFloat(order.total_kzt) : Number(order.total_kzt || 0)
    const items = order.items || []
    const itemsCount = items.length

    // Calculate total items quantity
    const totalQty = items.reduce((sum: number, item: any) => sum + (item.qty || 0), 0)

    // Helper to format full name from first_name and last_name
    const formatFullName = (person: any) => {
      if (!person) return ''
      // Check if user object exists (nested relationship)
      const user = person.user || person
      if (user?.first_name && user?.last_name) {
        return `${user.first_name} ${user.last_name}`.trim()
      }
      return person.organization_name || person.company_name || person.name || ''
    }

    return {
      id: order.id,
      orderNumber: `#${order.id}`,
      supplier_id: order.supplier_id,
      consumer_id: order.consumer_id,
      supplier: order.supplier?.company_name || formatFullName(order.supplier) || order.supplier?.name || '',
      consumer: formatFullName(order.consumer) || order.consumer?.organization_name || order.consumer?.name || '',
      status: order.status || 'pending',
      total: total,
      total_kzt: order.total_kzt,
      date: order.created_at,
      created_at: order.created_at,
      items: items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        productId: item.product_id,
        qty: item.qty,
        quantity: item.qty,
        unit_price_kzt: item.unit_price_kzt,
        price: typeof item.unit_price_kzt === 'string' ? parseFloat(item.unit_price_kzt) : Number(item.unit_price_kzt || 0),
        name: item.product?.name || `Product ${item.product_id}`,
        description: item.product?.description || '',
      })),
      itemsCount: itemsCount,
      totalQty: totalQty,
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Backend automatically filters orders by role (supplier sees their supplier's orders)
        const res = await orders.listOrders({ page: 1, size: 50 });
        const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
        if (mounted) setOrders(items.map((order: any) => normalizeOrder(order)) || []);
      } catch (e) {
        console.error('Failed to fetch orders:', e);
        if (mounted) setOrders([]);
      }
    })();
    let unsub = () => {};
    if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
      unsub = emitter.on('ordersChanged', async () => {
        try {
          const res = await orders.listOrders({ page: 1, size: 50 });
          const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
          if (mounted) setOrders(items.map((order: any) => normalizeOrder(order)) || []);
        } catch (e) {
          console.error('Failed to refresh orders:', e);
        }
      });
    }
    return () => { try { unsub(); } catch (e) {} mounted = false; };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await orders.listOrders({ page: 1, size: 50 });
      const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
      setOrders(items.map((order: any) => normalizeOrder(order)) || []);
    } catch (e) {
      console.error('Failed to refresh orders:', e);
    }
    setRefreshing(false);
  };

  const renderItem = ({ item }: any) => {
    const status = (item.status || 'pending').toLowerCase();

    // Get translated status
    const getStatusTranslation = (statusValue: string): string => {
      switch (statusValue) {
        case 'pending':
          return t.statusPending || 'Pending';
        case 'accepted':
          return t.statusAccepted || 'Accepted';
        case 'in_progress':
          return t.statusInProgress || 'In Progress';
        case 'completed':
          return t.statusCompleted || 'Completed';
        case 'rejected':
          return t.statusRejected || 'Rejected';
        default:
          return statusValue.charAt(0).toUpperCase() + statusValue.slice(1).replace('_', ' ');
      }
    };
    const displayStatus = getStatusTranslation(status);

    // Format full name - item.consumer should already be normalized with full name from API
    const consumerName = item.consumer || item.customer || t.consumer || 'Consumer';
    const orderNumber = item.orderNumber || `#${item.id}`;
    const total = typeof item.total === 'number' ? item.total : typeof item.total_kzt === 'string' ? parseFloat(item.total_kzt) : Number(item.total_kzt || 0);
    const itemsCount = item.itemsCount || item.items?.length || 0;
    const date = item.date || item.created_at || '';

    return (
    <TouchableOpacity style={styles.card} onPress={() => onOrderSelect && onOrderSelect(item)}>
      <View style={styles.cardHeader}>
        <View>
            <Text style={{ fontWeight: '700' }}>{t.order} {orderNumber}</Text>
            <Text style={{ color: '#6b7280' }}>{consumerName}</Text>
            {item.consumer_id && (
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>ID: {item.consumer_id}</Text>
            )}
        </View>
          <View style={[styles.statusPill, { backgroundColor: status === 'completed' ? '#ecfdf5' : status === 'rejected' ? '#fee2e2' : '#eff6ff' }]}>
            <Text style={{ color: status === 'completed' ? '#059669' : status === 'rejected' ? '#dc2626' : '#2563eb' }}>
              {displayStatus}
            </Text>
          </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <Text style={{ color: '#6b7280' }}>{date ? new Date(date).toLocaleDateString() : ''}</Text>
        <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#2563eb', fontWeight: '700' }}>{formatPrice(total)}</Text>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>{itemsCount} {t.items || 'items'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  };

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

