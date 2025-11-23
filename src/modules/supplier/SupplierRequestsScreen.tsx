import { Feather, MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { linkedSuppliers } from '../../api'
import { emitter } from '../../helpers/events'
import { toastShow } from '../../helpers/toast'
import { styles } from '../../styles/supplier/SupplierRequestsScreen.styles'
import { formatDate } from '../../utils/formatters'
import { getTranslations } from '../../translations'
import { LINK_STATUS } from '../../constants'


export default function SupplierRequestsScreen({
  language = 'en',
  navigateTo
}: // supplierName
{
  language?: 'en' | 'ru'
  navigateTo?: (s: string) => void
  supplierName?: string
}) {
  const t = getTranslations('supplier', 'requests', language)
  const [requests, setRequests] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await linkedSuppliers.fetchLinkRequests()
        if (mounted) {
          // Filter to only show pending requests
          const pending = (res || []).filter((r: any) => {
            const status = (r.statusOriginal || String(r.status || '').toLowerCase())
            return status === LINK_STATUS.PENDING.toLowerCase()
          })
          setRequests(pending)
        }
      } catch (e) {
        console.error('Failed to fetch link requests:', e)
        if (mounted) {
          setRequests([])
        }
      }
    })()
    let unsub = () => {}
    if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
      unsub = emitter.on('linkRequestsChanged', async () => {
        try {
          const res = await linkedSuppliers.fetchLinkRequests()
          if (mounted) {
            // Filter to only show pending requests
            const pending = (res || []).filter((r: any) => {
              const status = (r.statusOriginal || String(r.status || '').toLowerCase())
              return status === LINK_STATUS.PENDING.toLowerCase()
            })
            setRequests(pending)
          }
        } catch (e) {
          console.error('Failed to refresh link requests:', e)
        }
      })
    }
    return () => {
      try {
        unsub()
      } catch (e) {
        console.log(e)
      }
      mounted = false
    }
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await linkedSuppliers.fetchLinkRequests()
      // Filter to only show pending requests
      const pending = (res || []).filter((r: any) => {
        const status = (r.statusOriginal || String(r.status || '').toLowerCase())
        return status === LINK_STATUS.PENDING.toLowerCase()
      })
      setRequests(pending)
    } catch (e) {
      console.error('Failed to refresh link requests:', e)
      // ignore
    }
    setRefreshing(false)
  }

  const handleApprove = async (item: any) => {
    const commonT = getTranslations('shared', 'common', language)
    try {
      console.log('Approving link request:', item.id, 'with status:', LINK_STATUS.ACCEPTED)
      // Update status on backend
      const result = await linkedSuppliers.updateLinkRequestStatus(item.id, LINK_STATUS.ACCEPTED)
      console.log('Link request update result:', result)
      // Refresh the list from server to get updated data
      const res = await linkedSuppliers.fetchLinkRequests()
      console.log('Refreshed link requests:', res?.length)
      setRequests(res || [])
      // trigger refresh event
      emitter.emit('linkRequestsChanged')
      emitter.emit('linkedSuppliersChanged')
      // show toast instead of Alert
      toastShow(t.approvedTitle || 'Approved', t.statusUpdatedMessage || 'The consumer will see the updated status.')
    } catch (err: any) {
      console.error('Failed to approve link request:', err)
      console.error('Error details:', JSON.stringify(err, null, 2))
      toastShow(commonT.error || 'Error', err?.message || t.approveFailed || 'Failed to approve link request')
    }
  }

  const handleReject = async (item: any) => {
    const commonT = getTranslations('shared', 'common', language)
    try {
      // Update status on backend
      await linkedSuppliers.updateLinkRequestStatus(item.id, LINK_STATUS.DENIED)
      // Refresh the list from server to get updated data
      const res = await linkedSuppliers.fetchLinkRequests()
      setRequests(res || [])
      // trigger refresh event
      emitter.emit('linkRequestsChanged')
      emitter.emit('linkedSuppliersChanged')
      toastShow(t.rejectedTitle || 'Rejected', t.statusUpdatedMessage || 'The consumer will see the updated status.')
    } catch (err: any) {
      console.error('Failed to reject link request:', err)
      toastShow(commonT.error || 'Error', err?.message || t.rejectFailed || 'Failed to reject link request')
    }
  }

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.avatar}>
          <MaterialIcons name="apartment" size={18} color="#2563eb" />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          {(() => {
            // Format full name from first_name and last_name
            const formatFullName = (person: any) => {
              if (!person) return '';
              if (person.first_name && person.last_name) {
                return `${person.first_name} ${person.last_name}`.trim();
              }
              return person.organization_name || person.company_name || person.name || '';
            };
            const consumerFullName = formatFullName(item.consumer) || item.consumer?.organization_name || item.name || item.organization || getTranslations('supplier', 'orders', language).consumer || 'Consumer';
            return (
              <>
                <Text style={{ fontWeight: '700' }}>{consumerFullName}</Text>
                {item.consumer?.organization_name && consumerFullName !== item.consumer.organization_name && (
                  <Text style={{ color: '#6b7280', marginTop: 4 }}>{item.consumer.organization_name}</Text>
                )}
              </>
            );
          })()}
          <Text style={{ color: '#9ca3af', marginTop: 4, fontSize: 12 }}>{/* email not exposed by default */ ''}</Text>
          <Text style={{ color: '#9ca3af', marginTop: 6, fontSize: 12 }}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 12, gap: 12 }}>
        <TouchableOpacity
          onPress={() => handleReject(item)}
          style={[styles.buttonOutline, { flex: 1 }]}
        >
          <Feather name="x" size={16} color="#ef4444" />
          <Text style={{ color: '#ef4444', marginLeft: 8 }}>{t.reject}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleApprove(item)}
          style={[styles.buttonPrimary, { flex: 1 }]}
        >
          <Feather name="check" size={16} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 8 }}>{t.approve}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigateTo && navigateTo('supplier-home')}
          style={{ padding: 8 }}
        >
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>
          {t.linkRequests}
        </Text>
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
            <Text style={{ color: '#9ca3af', marginTop: 8 }}>
              {t.noRequestsDesc}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

