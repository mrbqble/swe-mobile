import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { styles } from '../../styles/supplier/SupplierOrderDetailScreen.styles'
import { Feather } from '@expo/vector-icons'
import { orders, complaints } from '../../api'
import { emitter } from '../../helpers/events'
import { toastShow } from '../../helpers/toast'
import { formatPrice, formatDate } from '../../utils/formatters'
import { ORDER_STATUS, COMPLAINT_STATUS } from '../../constants'
import { getTranslations, type Language } from '../../translations'

export default function SupplierOrderDetailScreen({
	orderId,
	onBack,
	onOpenChat,
	onOpenComplaint,
	language
}: {
	orderId: string | null
	onBack: () => void
	onOpenChat?: () => void
	onOpenComplaint?: (complaintId: string) => void
	language?: 'en' | 'ru'
}) {
	const [order, setOrder] = useState<any | null>(null)
	const [complaint, setComplaint] = useState<any | null>(null)
	const L = getTranslations('supplier', 'orderDetail', language ?? 'en')
	const [loading, setLoading] = useState(false)


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

				// Fetch complaint for this order if it exists
				try {
					const existing = await complaints.fetchComplaintByOrderId(orderId)
					if (mounted) setComplaint(existing)
				} catch (e) {
					// No complaint exists, that's fine
					if (mounted) setComplaint(null)
				}
			} catch (err: any) {
				console.error('Failed to fetch order:', err)
				const commonT = getTranslations('shared', 'common', language || 'en')
				toastShow(commonT.error || 'Error', err?.message || L.failedToLoadOrder || 'Failed to load order')
			} finally {
				if (mounted) setLoading(false)
			}
		})()

		// Subscribe to order and complaint updates
		const unsubOrder = emitter.on('ordersChanged', async () => {
			if (!orderId) return
			try {
				const o = await orders.fetchOrderById(orderId)
				if (mounted) setOrder(o)
			} catch (e) {
				console.error('Failed to refresh order:', e)
			}
		})

		const unsubComplaint = emitter.on('complaintsChanged', async () => {
			if (!orderId) return
			try {
				const existing = await complaints.fetchComplaintByOrderId(orderId)
				if (mounted) setComplaint(existing)
			} catch (e) {
				// No complaint exists, that's fine
				if (mounted) setComplaint(null)
			}
		})

		return () => {
			mounted = false
			try {
				unsubOrder()
				unsubComplaint()
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

							{/* Complaint section */}
							{complaint && (
								<View style={{ marginTop: 16, padding: 16, backgroundColor: '#fef3c7', borderRadius: 8, borderWidth: 1, borderColor: '#fde68a' }}>
									<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
										<Text style={{ fontWeight: '700', fontSize: 16 }}>{L.complaint || 'Complaint'}</Text>
										<View
											style={{
												paddingHorizontal: 8,
												paddingVertical: 4,
												borderRadius: 12,
												backgroundColor:
													complaint.status?.toLowerCase() === COMPLAINT_STATUS.RESOLVED
														? '#d1fae5'
														: complaint.status?.toLowerCase() === COMPLAINT_STATUS.ESCALATED
														? '#fee2e2'
														: '#dbeafe'
											}}
										>
											<Text
												style={{
													color:
														complaint.status?.toLowerCase() === COMPLAINT_STATUS.RESOLVED
															? '#059669'
															: complaint.status?.toLowerCase() === COMPLAINT_STATUS.ESCALATED
															? '#dc2626'
															: '#2563eb',
													fontSize: 12,
													fontWeight: '600'
												}}
											>
												{(() => {
													const statusLower = (complaint.status || '').toLowerCase()
													if (statusLower === 'open') return L.complaintOpen || 'Open'
													if (statusLower === 'escalated') return L.complaintEscalated || 'Escalated'
													if (statusLower === 'resolved') return L.complaintResolved || 'Resolved'
													return complaint.status?.charAt(0).toUpperCase() + complaint.status?.slice(1) || 'Open'
												})()}
											</Text>
										</View>
									</View>
									<Text style={{ color: '#374151', marginBottom: 8 }} numberOfLines={2}>
										{complaint.description || complaint.reason || L.noDescription || 'No description'}
									</Text>
									<Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>
										{L.submitted || 'Submitted:'} {formatDate(complaint.created_at || complaint.createdAt || '')}
									</Text>
									<TouchableOpacity
										onPress={() => {
											if (onOpenComplaint && complaint.id) {
												onOpenComplaint(String(complaint.id))
											}
										}}
										style={{
											padding: 10,
											borderRadius: 6,
											backgroundColor: '#fff',
											borderWidth: 1,
											borderColor: '#e5e7eb',
											alignItems: 'center'
										}}
									>
										<Text style={{ color: '#2563eb', fontWeight: '600' }}>{L.viewComplaintDetails || 'View Complaint Details'}</Text>
									</TouchableOpacity>
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
