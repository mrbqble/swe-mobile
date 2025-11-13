import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { fetchLinkRequests, updateLinkRequestStatus } from '../../api/linkedSuppliers.mock';
import { toastShow } from '../../helpers/toast';
import { emitter } from '../../helpers/events';

const translations = {
  en: {
    linkRequests: 'Link Requests',
    noRequests: 'No pending requests',
    noRequestsDesc: 'New connection requests will appear here',
    approve: 'Approve',
    reject: 'Reject',
    approvedTitle: 'Request approved!',
    rejectedTitle: 'Request rejected!'
  },
  ru: {
    linkRequests: 'Запросы на связь',
    noRequests: 'Ожидающих запросов нет',
    noRequestsDesc: 'Новые запросы на соединение будут отображаться здесь',
    approve: 'Одобрить',
    reject: 'Отклонить',
    approvedTitle: 'Запрос одобрен!',
    rejectedTitle: 'Запрос отклонён!'
  }
} as const;

export default function SupplierRequestsScreen({ language = 'en', navigateTo, supplierName }: { language?: 'en' | 'ru'; navigateTo?: (s: string) => void; supplierName?: string }) {
  const t = translations[language];
  const [requests, setRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetchLinkRequests();
      if (mounted) setRequests(res || []);
    })();
    let unsub = () => {};
    if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
      unsub = emitter.on('linkRequestsChanged', async () => {
        try {
          const res = await fetchLinkRequests();
          if (mounted) setRequests(res || []);
        } catch (e) {}
      });
    }
    return () => { try { unsub(); } catch (e) {} mounted = false; };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetchLinkRequests();
      setRequests(res || []);
    } catch (e) {
      // ignore
    }
    setRefreshing(false);
  };

  const handleApprove = async (item: any) => {
    await updateLinkRequestStatus(item.id, 'approved');
    // remove processed request from the list
    setRequests((r) => r.filter((x) => x.id !== item.id));
    // show toast instead of Alert
  try { toastShow(t.approvedTitle, 'The consumer will see the updated status.'); } catch (e) { /* ignore */ }
  };

  const handleReject = async (item: any) => {
    await updateLinkRequestStatus(item.id, 'rejected');
    setRequests((r) => r.filter((x) => x.id !== item.id));
    try { toastShow(t.rejectedTitle, 'The consumer will see the updated status.'); } catch (e) { /* ignore */ }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.avatar}><MaterialIcons name="apartment" size={18} color="#2563eb" /></View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontWeight: '700' }}>{item.name}</Text>
          <Text style={{ color: '#6b7280', marginTop: 4 }}>{item.organization}</Text>
          <Text style={{ color: '#9ca3af', marginTop: 4, fontSize: 12 }}>{item.email}</Text>
          <Text style={{ color: '#9ca3af', marginTop: 6, fontSize: 12 }}>{item.date}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 12, gap: 12 }}>
        <TouchableOpacity onPress={() => handleReject(item)} style={[styles.buttonOutline, { flex: 1 }]}>
          <Feather name="x" size={16} color="#ef4444" />
          <Text style={{ color: '#ef4444', marginLeft: 8 }}>{t.reject}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleApprove(item)} style={[styles.buttonPrimary, { flex: 1 }]}>
          <Feather name="check" size={16} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 8 }}>{t.approve}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateTo && navigateTo('supplier-home')} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{t.linkRequests}</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={requests}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={() => (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#9ca3af' }}>{t.noRequests}</Text>
            <Text style={{ color: '#9ca3af', marginTop: 8 }}>{t.noRequestsDesc}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  buttonOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#fee2e2', backgroundColor: '#fff' },
  buttonPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, backgroundColor: '#16a34a' },
});
