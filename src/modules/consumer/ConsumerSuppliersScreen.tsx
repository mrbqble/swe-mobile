import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/consumer/ConsumerSuppliersScreen.styles';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useLinkedSuppliers } from '../../hooks/useLinkedSuppliers';
import { getTranslations, type Language } from '../../translations';
import { LINK_STATUS, COLORS, getStatusColor, getStatusBgColor } from '../../constants';

export default function ConsumerSuppliersScreen({ onBack, onRequestLink, language }: { onBack?: () => void; onRequestLink?: () => void; language?: 'en' | 'ru' }) {
  const { suppliers, loading } = useLinkedSuppliers();
  const L = getTranslations('consumer', 'suppliers', language ?? 'en');

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <View style={styles.avatarPlaceholder}><MaterialIcons name="apartment" size={18} color="#2563eb" /></View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontWeight: '700' }}>{item.name}</Text>
          <Text style={{ color: '#6b7280', marginTop: 4 }}>{item.rating ? `★ ${item.rating} · ${item.productsCount} products` : `${item.productsCount ?? 0} products`}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: getStatusBgColor(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
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

