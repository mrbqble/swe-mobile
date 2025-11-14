import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { complaints, orders } from '../../api';
import { toastShow } from '../../helpers/toast';

export default function SupplierComplaintDetailScreen({ complaintId, onBack, onOpenChat }: { complaintId?: string | null; onBack?: () => void; onOpenChat?: (orderId?: string | null) => void }) {
  const [c, setC] = useState<any | null>(null);
  const [escalating, setEscalating] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [actionLocked, setActionLocked] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!complaintId) return;
      try {
        const found = await (complaints as any).fetchComplaintById(complaintId);
        if (!found) return;
        // fetch order details to display orderNumber and current status
        let orderData = null;
        try { orderData = await (orders as any).fetchOrderById(found.orderId); } catch (e) {}
        const payload = { ...found, _order: orderData };
        if (mounted) {
          setC(payload);
          // initialize action states from persisted complaint status so irreversible
          // actions remain locked when revisiting the detail screen
          const isEscalated = String(payload.status) === 'In Progress';
          const isResolved = String(payload.status) === 'Resolved';
          setEscalated(isEscalated);
          setResolved(isResolved);
          if (isEscalated || isResolved) setActionLocked(true);
        }
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, [complaintId]);

  if (!c) return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}><TouchableOpacity onPress={onBack}><Feather name="arrow-left" size={20} color="#111827" /></TouchableOpacity><Text style={{ fontSize: 18, fontWeight: '700' }}>Complaint Details</Text><View style={{ width: 36 }} /></View>
      <View style={{ padding: 16 }}><Text style={{ color: '#6b7280' }}>Loading...</Text></View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}><Feather name="arrow-left" size={20} color="#111827" /></TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Complaint Details</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#fee2e2', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: '#b91c1c', fontWeight: '700' }}>Complaint</Text>
          {c.reason ? <Text style={{ color: '#991b1b', marginTop: 6 }}>{c.reason}</Text> : null}
        </View>

        <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontWeight: '700' }}>Customer</Text>
              <Text style={{ color: '#374151', marginTop: 4 }}>{c.consumerName || 'Unknown'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontWeight: '700' }}>{c._order?.orderNumber || c.orderId}</Text>
              <Text style={{ color: '#6b7280', marginTop: 4 }}>{new Date(c.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: '#6b7280' }}>Status</Text>
            <Text style={{ marginTop: 6, fontWeight: '700' }}>{c._order?.status || c.status}</Text>
          </View>
        </View>

        <Text style={{ fontWeight: '700', marginBottom: 8 }}>Description</Text>
        <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, marginBottom: 20 }}>
          <Text style={{ color: '#111827' }}>{c.reason || 'No description provided'}</Text>
        </View>

        <View style={{ marginTop: 24 }}>
          {/* Resolved button: mark complaint as resolved by supplier after talking to consumer */}
          <TouchableOpacity
            onPress={async () => {
              if (!c) return;
              try {
                // immediately lock other actions to prevent concurrent irreversible updates
                setActionLocked(true);
                setResolving(true);
                await (complaints as any).updateComplaintStatus(c.id, 'Resolved');
                setResolved(true);
                // update local view
                setC((prev: any) => prev ? { ...prev, status: 'Resolved' } : prev);
                toastShow('Resolved', 'Complaint marked as resolved');
                // keep actionLocked true because this is an irreversible action
              } catch (e) {
                toastShow('Error', 'Could not mark complaint as resolved');
                // allow retry if failure
                setActionLocked(false);
              } finally { setResolving(false); }
            }}
            disabled={resolving || resolved || actionLocked}
            style={[{ backgroundColor: '#059669', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 }, (resolved || actionLocked) && { opacity: 0.6 }]}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{resolved ? 'Resolved' : resolving ? 'Resolving...' : 'Resolved the Complaint'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              if (!c) return;
              try {
                // immediately lock other actions to prevent concurrent irreversible updates
                setActionLocked(true);
                setEscalating(true);
                await (complaints as any).escalateToManager(c.id);
                setEscalated(true);
                toastShow('Escalated', 'Complaint details were sent to manager');
                // keep actionLocked true because this is an irreversible action
              } catch (e) {
                toastShow('Error', 'Could not escalate complaint');
                // allow retry if failure
                setActionLocked(false);
              } finally { setEscalating(false); }
            }}
            disabled={escalating || escalated || actionLocked}
            style={[{ backgroundColor: '#f97316', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 }, (escalated || actionLocked) && { opacity: 0.6 }]}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{escalated ? 'Escalated' : escalating ? 'Escalating...' : 'Escalate to Manager'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { if (onOpenChat) onOpenChat(c.orderId); }} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', padding: 14, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: '#111827', fontWeight: '600' }}>Open Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
