import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/consumer/ConsumerOrdersScreen.styles';
import { Feather } from '@expo/vector-icons';
import { useOrders } from '../../hooks/useOrders';
import { getTranslations, type Language } from '../../translations';
import { formatPrice } from '../../utils/formatters';
import { ORDER_STATUS, COLORS } from '../../constants';

export default function ConsumerOrdersScreen({ onBack, onOpenOrder, language }: { onBack?: () => void; onOpenOrder?: (id: string) => void; language?: 'en' | 'ru' }) {
  const { orders, loading } = useOrders();
  const L = getTranslations('consumer', 'orders', language ?? 'en');

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => onOpenOrder && onOpenOrder(item.id)}>
      <View style={styles.cardHeader}>
  <Text style={styles.orderTitle}>{L.orderPrefix}{item.orderNumber}</Text>
        <View style={[styles.statusPill, item.status === ORDER_STATUS.COMPLETED ? { backgroundColor: COLORS.SUCCESS_LIGHT } : { backgroundColor: '#eff6ff' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.supplier}>{item.supplier}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.date}>{item.date}</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.total}>{formatPrice(item.total)}</Text>
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

