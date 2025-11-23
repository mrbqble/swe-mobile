import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/supplier/SupplierComplaintsScreen.styles';
import { complaints } from '../../api';
import { emitter } from '../../helpers/events';
import { toastShow } from '../../helpers/toast';
import { formatDateOnly } from '../../utils/formatters';
import { COMPLAINT_STATUS, COLORS, getStatusColor } from '../../constants';
import { getTranslations, type Language } from '../../translations';

export default function SupplierComplaintsScreen({ supplierName, onBack, onOpenComplaint, language = 'en' }: { supplierName?: string; onBack?: () => void; onOpenComplaint?: (complaintId: string) => void; language?: Language }) {
  const t = getTranslations('supplier', 'complaints', language);
  const [items, setItems] = useState<any[]>([]);

  // Helper to translate complaint status
  const getStatusTranslation = (status: string): string => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'open':
        return t.statusOpen || 'Open';
      case 'escalated':
        return t.statusEscalated || 'Escalated';
      case 'resolved':
        return t.statusResolved || 'Resolved';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const load = async () => {
    try {
      const res = await complaints.listComplaints(1, 100);
      setItems(res.items || []);
    } catch (e: any) {
      console.error('Failed to load complaints:', e);
      setItems([]);
    }
  };

  useEffect(() => {
    load();
    const off = emitter.on('complaintsChanged', () => { load(); });
    return () => { off(); };
  }, [supplierName]);

  const onChangeStatus = async (id: string, status: any) => {
    try {
      await complaints.updateComplaintStatus(id, status.toLowerCase(), null);
      toastShow('Updated', `Complaint marked ${status}`);
      emitter.emit('complaintsChanged');
      load();
    } catch (e: any) {
      console.error('Failed to update complaint status:', e);
      toastShow('Error', e?.message || 'Could not update complaint');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: '#2563eb' }}>Back</Text></TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{t.complaints}</Text>
        <View style={{ width: 48 }} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(i: any) => i.id}
        renderItem={({ item }: any) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={() => onOpenComplaint && onOpenComplaint(item.id)}>
                <Text style={{ fontWeight: '700', fontSize: 15 }}>{item.description || item.reason || t.noDescription}</Text>
                <Text style={{ color: '#374151', marginTop: 4 }}>Order #{item.order_id || item.orderId}</Text>
                <Text style={{ color: '#6b7280', marginTop: 6, fontSize: 12 }}>{formatDateOnly(item.created_at || item.createdAt)}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: getStatusColor(item.status), fontWeight: '700' }}>{getStatusTranslation(item.status)}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => <View style={{ padding: 24 }}><Text style={{ color: '#6b7280' }}>{t.noComplaints}</Text></View>}
      />
    </SafeAreaView>
  );
}

