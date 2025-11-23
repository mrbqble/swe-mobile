import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/consumer/ConsumerRequestLinkScreen.styles';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useSupplierSearch } from '../../hooks/useSupplierSearch';
import { getTranslations, type Language } from '../../translations';
import { linkedSuppliers } from '../../api';
import { emitter } from '../../helpers/events';
import { toastShow } from '../../helpers/toast';

export default function ConsumerRequestLinkScreen({ onBack, onSubmit, language }: { onBack: () => void; onSubmit?: (supplierId: string) => void; language?: 'en' | 'ru' }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const { results, loading } = useSupplierSearch(query);
  const L = getTranslations('consumer', 'requestLink', language ?? 'en');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{L.requestLink}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ marginBottom: 8, color: '#6b7280' }}>{L.searchSuppliers}</Text>
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#9CA3AF" style={{ marginLeft: 8 }} />
          <TextInput placeholder={L.placeholder} value={query} onChangeText={setQuery} style={styles.searchInput} />
        </View>
      </View>

      {query.trim().length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="search" size={36} color="#cbd5e1" />
          <Text style={{ color: '#9CA3AF', marginTop: 8 }}>{L.searchSuppliers}</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(i: any) => i.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }: any) => (
            <TouchableOpacity onPress={() => setSelected(item.id)} style={[styles.card, selected === item.id ? { borderColor: '#2563eb', borderWidth: 1 } : {}]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.avatar}><MaterialIcons name="apartment" size={18} color="#2563eb" /></View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontWeight: '700' }}>{item.name}</Text>
                  <Text style={{ color: '#6b7280', marginTop: 4 }}>{item.description}</Text>
                </View>
                <Text style={{ color: '#f59e0b' }}>★ {item.rating}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity disabled={!selected} onPress={async () => {
          if (!selected) return;
          try {
            // Call backend to create link request
            await linkedSuppliers.addLinkRequest(selected);
            // optional callback
            if (onSubmit) await onSubmit(selected);
            // trigger refresh for supplier/consumer lists
            try { emitter.emit('linkRequestsChanged'); emitter.emit('linkedSuppliersChanged'); } catch (e) {}
            try { toastShow(L.submitRequest, 'The supplier will review your request.'); } catch (e) {}
          } catch (err: any) {
            try { toastShow('Error', err?.message || 'Could not submit link request'); } catch (e) {}
          }
        }} style={[styles.submitBtn, !selected ? { backgroundColor: '#e5e7eb' } : {}]}>
          <Text style={{ color: selected ? '#fff' : '#9ca3af', fontWeight: '700' }}>{L.submitRequest}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

