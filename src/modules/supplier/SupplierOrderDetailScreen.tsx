import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { styles } from '../../styles/supplier/SupplierOrderDetailScreen.styles'
import { Feather } from '@expo/vector-icons'
import { orders } from '../../api'
import { emitter } from '../../helpers/events'
import { toastShow } from '../../helpers/toast'
import { formatPrice, formatDate } from '../../utils/formatters'
import { ORDER_STATUS } from '../../constants'
import { getTranslations, type Language } from '../../translations'

export default function SupplierOrderDetailScreen({
	orderId,
	onBack,
	onOpenChat,
	language
}: {
	orderId: string | null
	onBack: () => void
	onOpenChat?: () => void
	language?: 'en' | 'ru'
}) {
	const [order, setOrder] = useState<any | null>(null)
	const L = getTranslations('supplier', 'orderDetail', language ?? 'en')
	const [loading, setLoading] = useState(false)

	const getNextStatus = (currentStatus: string): string | null => {
		const status = currentStatus.toLowerCase()
		if (status === 'pending') return 'accepted'
		if (status === 'accepted') return 'in_progress'
		if (status === 'in_progress') return 'completed'
		return null
	}

	const canUpdateStatus = (currentStatus: string): boolean => {
		const status = currentStatus.toLowerCase()
		return status === 'pending' || status === 'accepted' || status === 'in_progress'
	}

	const handleStatusUpdate = async (newStatus: string) => {
		if (!orderId) return
		try {
			setLoading(true)
			const updated = await orders.updateOrderStatus(orderId, newStatus)
			setOrder(updated)
			emitter.emit('ordersChanged')
			const commonT = getTranslations('shared', 'common', language || 'en')
			const statusMessage = (L.orderStatusUpdated || 'Order status updated to {status}').replace('{status}', newStatus)
			toastShow(commonT.save || 'Success', statusMessage)
		} catch (err: any) {
			console.error('Failed to update order status:', err)
			const commonT = getTranslations('shared', 'common', language || 'en')
			const errorMsg = err?.body?.detail || err?.message || L.failedToUpdateStatus || 'Failed to update order status'
			toastShow(commonT.error || 'Error', errorMsg)
		} finally {
			setLoading(false)
		}
	}

  const Timeline = () => {
    const steps = [
			{ key: 'pending', label: L.orderCreated || 'Order Created', icon: 'calendar' },
			{ key: 'accepted', label: L.orderAccepted || 'Order Accepted', icon: 'check-circle' },
			{ key: 'in_progress', label: L.inProgress || 'In Progress', icon: 'clock' },
			{ key: 'completed', label: L.completed || 'Completed', icon: 'check' }
		]

		const currentStatus = order?.status?.toLowerCase() || 'pending'

    return (
      <View>
        {steps.map((s) => {
					const isActive = s.key === currentStatus
					const isPast = steps.findIndex((step) => step.key === currentStatus) > steps.findIndex((step) => step.key === s.key)
					const done = isActive || isPast

          return (
						<View
							key={s.key}
							style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
						>
              <View style={{ width: 36, alignItems: 'center' }}>
								<View
									style={{
										width: 28,
										height: 28,
										borderRadius: 14,
										backgroundColor: done ? '#def7ec' : '#f3f4f6',
										alignItems: 'center',
										justifyContent: 'center'
									}}
								>
									<Feather
										name={s.icon as any}
										size={16}
										color={done ? '#059669' : '#9ca3af'}
									/>
                </View>
              </View>
              <View style={{ flex: 1 }}>
								<Text style={{ fontWeight: done ? ('700' as any) : ('600' as any) }}>{s.label}</Text>
								{isActive && order?.created_at && <Text style={{ color: '#6b7280', fontSize: 12 }}>{formatDate(order.created_at)}</Text>}
              </View>
            </View>
					)
        })}
      </View>
		)
	}

  useEffect(() => {
		let mounted = true
		;(async () => {
			if (!orderId) return
			setLoading(true)
      try {
				const o = await orders.fetchOrderById(orderId)
				if (mounted) setOrder(o)
			} catch (err: any) {
				console.error('Failed to fetch order:', err)
				const commonT = getTranslations('shared', 'common', language || 'en')
				toastShow(commonT.error || 'Error', err?.message || L.failedToLoadOrder || 'Failed to load order')
			} finally {
				if (mounted) setLoading(false)
			}
		})()

		// Subscribe to order updates
		const unsub = emitter.on('ordersChanged', async () => {
			if (!orderId) return
			try {
				const o = await orders.fetchOrderById(orderId)
				if (mounted) setOrder(o)
			} catch (e) {
				console.error('Failed to refresh order:', e)
			}
		})

		return () => {
			mounted = false
			try {
				unsub()
			} catch (e) {}
		}
	}, [orderId])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
				<TouchableOpacity
					onPress={onBack}
					style={{ padding: 8 }}
				>
					<Feather
						name="arrow-left"
						size={20}
						color="#111827"
					/>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{L.orderDetail}</Text>
        <View style={{ width: 36 }} />
      </View>

			{loading ? (
				<View style={{ padding: 16 }}>
					<Text>{L.loading}</Text>
				</View>
			) : (
        <FlatList
          ListHeaderComponent={() => (
            <View style={styles.card}>
							<View style={styles.rowBetween}>
								<Text style={{ color: '#6b7280' }}>{L.order}</Text>
								<Text style={{ fontWeight: '700' }}>{order?.orderNumber || `#${order?.id}`}</Text>
							</View>
							<View style={styles.rowBetween}>
								<Text style={{ color: '#6b7280' }}>{L.customer}</Text>
								<Text>{order?.consumer || L.customer || L.consumer || 'Consumer'}</Text>
							</View>
							<View style={styles.rowBetween}>
								<Text style={{ color: '#6b7280' }}>{L.date}</Text>
								<Text>{order?.created_at ? formatDate(order.created_at) : order?.date || ''}</Text>
							</View>
							<View style={styles.rowBetween}>
								<Text style={{ color: '#6b7280' }}>{L.status}</Text>
								<View
									style={[
										styles.statusPill,
										{
											backgroundColor: order?.status === 'completed' ? '#ecfdf5' : order?.status === 'rejected' ? '#fee2e2' : '#eff6ff'
										}
									]}
								>
									<Text
										style={{
											color: order?.status === 'completed' ? '#059669' : order?.status === 'rejected' ? '#dc2626' : '#2563eb'
										}}
									>
										{(() => {
											const status = (order?.status || 'pending').toLowerCase();
											const getStatusTranslation = (statusValue: string): string => {
												switch (statusValue) {
													case 'pending':
														return L.statusPending || 'Pending';
													case 'accepted':
														return L.statusAccepted || 'Accepted';
													case 'in_progress':
														return L.statusInProgress || 'In Progress';
													case 'completed':
														return L.statusCompleted || 'Completed';
													case 'rejected':
														return L.statusRejected || 'Rejected';
													default:
														return statusValue.charAt(0).toUpperCase() + statusValue.slice(1).replace('_', ' ');
												}
											};
											return getStatusTranslation(status);
										})()}
									</Text>
								</View>
							</View>
            </View>
          )}
          data={order?.items || []}
          keyExtractor={(i: any, idx) => String(i.productId) + '-' + idx}
          renderItem={({ item }: any) => (
            <View style={styles.itemRow}>
              <Text style={{ fontWeight: '600' }}>{item.name}</Text>
              <View style={{ alignItems: 'flex-end' }}>
								<Text style={{ color: '#6b7280', fontSize: 12 }}>
									{L.qty}: {item.qty}
								</Text>
                <Text style={{ color: '#2563eb', fontWeight: '700' }}>{formatPrice(item.price || 0)}</Text>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280' }}>{L.total}</Text>
                    <Text style={{ color: '#2563eb', fontWeight: '700' }}>{formatPrice(order?.total || 0)}</Text>
              </View>

                  <View style={{ paddingTop: 16 }}>
                    <Text style={{ fontWeight: '700', marginBottom: 8 }}>{L.timeline}</Text>
                    <Timeline />
                  </View>

							{/* Status update buttons */}
							{canUpdateStatus(order?.status || '') && (
								<View style={{ marginTop: 16 }}>
									<Text style={{ fontWeight: '700', marginBottom: 8 }}>{L.updateStatus}</Text>
									{getNextStatus(order?.status || '') && (
										<TouchableOpacity
											onPress={() => handleStatusUpdate(getNextStatus(order?.status || '')!)}
											disabled={loading}
											style={{
												padding: 12,
												borderRadius: 8,
												backgroundColor: '#2563eb',
												alignItems: 'center',
												opacity: loading ? 0.6 : 1
											}}
										>
											{loading ? (
												<ActivityIndicator color="#fff" />
											) : (
												<Text style={{ color: '#fff', fontWeight: '700' }}>
													{L.markAs}{' '}
													{getNextStatus(order?.status || '')
														?.replace('_', ' ')
														.toUpperCase()}
												</Text>
											)}
										</TouchableOpacity>
									)}
									{order?.status?.toLowerCase() === 'pending' && (
										<TouchableOpacity
											onPress={() => handleStatusUpdate('rejected')}
											disabled={loading}
											style={{
												marginTop: 8,
												padding: 12,
												borderRadius: 8,
												backgroundColor: '#fee2e2',
												borderWidth: 1,
												borderColor: '#fecaca',
												alignItems: 'center',
												opacity: loading ? 0.6 : 1
											}}
										>
											<Text style={{ color: '#dc2626', fontWeight: '700' }}>{L.rejectOrder}</Text>
										</TouchableOpacity>
									)}
								</View>
							)}

							<TouchableOpacity
								onPress={() => {
									try {
										if (onOpenChat) onOpenChat()
									} catch (e) {}
								}}
								style={{
									marginTop: 16,
									padding: 12,
									borderRadius: 8,
									backgroundColor: '#fff',
									borderWidth: 1,
									borderColor: '#e5e7eb',
									alignItems: 'center'
								}}
							>
								<Text>{L.openChat || 'Open Chat'}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
	)
}
