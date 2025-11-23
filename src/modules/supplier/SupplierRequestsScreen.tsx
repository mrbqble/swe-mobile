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
      const res = await linkedSuppliers.fetchLinkRequests()
      if (mounted) {
        setRequests(res || [])
      }
    })()
    let unsub = () => {}
    if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
      unsub = emitter.on('linkRequestsChanged', async () => {
        try {
          const res = await linkedSuppliers.fetchLinkRequests()
          if (mounted) {
            setRequests(res || [])
          }
        } catch (e) {
          console.log(e)
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
      setRequests(res || [])
    } catch (e) {
      console.log(e)
      // ignore
    }
    setRefreshing(false)
  }

  const handleApprove = async (item: any) => {
    await linkedSuppliers.updateLinkRequestStatus(item.id, 'approved')
    // remove processed request from the list
    setRequests((r) => r.filter((x) => x.id !== item.id))
    // show toast instead of Alert
    try {
      toastShow(t.approvedTitle, 'The consumer will see the updated status.')
    } catch (e) {
      console.log(e)
      /* ignore */
    }
  }

  const handleReject = async (item: any) => {
    await linkedSuppliers.updateLinkRequestStatus(item.id, LINK_STATUS.REJECTED)
    setRequests((r) => r.filter((x) => x.id !== item.id))
    try {
      toastShow(t.rejectedTitle, 'The consumer will see the updated status.')
    } catch (e) {
      console.log(e)
      /* ignore */
    }
  }

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.avatar}>
          <MaterialIcons name="apartment" size={18} color="#2563eb" />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontWeight: '700' }}>{item.consumer?.organization_name || item.name || item.organization || 'Consumer'}</Text>
          <Text style={{ color: '#6b7280', marginTop: 4 }}>{item.consumer?.organization_name || ''}</Text>
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

