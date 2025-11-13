import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { complaints } from '../../api';
import { emitter } from '../../helpers/events';
import { toastShow } from '../../helpers/toast';

export default function SupplierComplaintsScreen({ supplierName, onBack, onOpenComplaint }: { supplierName?: string; onBack?: () => void; onOpenComplaint?: (complaintId: string) => void }) {
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    try {
      const res = await complaints.fetchComplaintsForSupplier(supplierName);
      setItems(Array.isArray(res) ? res : []);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    load();
    const off = emitter.on('complaintsChanged', () => { load(); });
    return () => { off(); };
  }, [supplierName]);

  const onChangeStatus = async (id: string, status: any) => {
    try {
      await complaints.updateComplaintStatus(id, status);
      toastShow('Updated', `Complaint marked ${status}`);
    } catch (e) {
      toastShow('Error', 'Could not update complaint');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: '#2563eb' }}>Back</Text></TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Complaints</Text>
        <View style={{ width: 48 }} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(i: any) => i.id}
        renderItem={({ item }: any) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={() => onOpenComplaint && onOpenComplaint(item.id)}>
                <Text style={{ fontWeight: '700', fontSize: 15 }}>{item.reason || 'No description provided'}</Text>
                <Text style={{ color: '#374151', marginTop: 4 }}>{item.consumerName || 'Unknown'}</Text>
                <Text style={{ color: '#6b7280', marginTop: 6, fontSize: 12 }}>Order {item.orderId} • {new Date(item.createdAt).toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: item.status === 'Open' ? '#b91c1c' : item.status === 'In Progress' ? '#f59e0b' : '#059669', fontWeight: '700' }}>{item.status}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => <View style={{ padding: 24 }}><Text style={{ color: '#6b7280' }}>No complaints yet</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center' },
  action: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#f3f4f6', borderRadius: 8 }
});
