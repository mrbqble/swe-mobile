import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { styles } from '../../styles/consumer/ConsumerOrderDetailScreen.styles'
import { Feather } from '@expo/vector-icons'
import { orders, complaints } from '../../api'
import { emitter } from '../../helpers/events'
import { toastShow } from '../../helpers/toast'
import ComplaintModal from './ComplaintModal'
import { getTranslations, type Language } from '../../translations'
import { formatPrice, formatDate } from '../../utils/formatters'
import { ORDER_STATUS, COMPLAINT_STATUS, COLORS } from '../../constants'

export default function ConsumerOrderDetailScreen({
	orderId,
	onBack,
	onOpenChat,
	language,
	userName
}: {
	orderId: string | null
	onBack: () => void
	onOpenChat?: () => void
	language?: 'en' | 'ru'
	userName?: string
}) {
	const [order, setOrder] = useState<any | null>(null)
	const L = getTranslations('consumer', 'orderDetail', language ?? 'en')
	const [loading, setLoading] = useState(false)
	const [complaintModalVisible, setComplaintModalVisible] = useState(false)
	const [complaint, setComplaint] = useState<any | null>(null)
	const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false)

	const Timeline = () => {
		const steps = [
			{ key: ORDER_STATUS.CREATED as const, label: L.orderCreated, icon: 'calendar' },
			{ key: ORDER_STATUS.ACCEPTED as const, label: 'Order Accepted', icon: 'check-circle' },
			{ key: ORDER_STATUS.IN_PROGRESS as const, label: 'In Progress', icon: 'clock' },
			{ key: ORDER_STATUS.COMPLETED as const, label: 'Completed', icon: 'check' }
		]

		// helper to find a timestamp from statusHistory
		const findTs = (statusKey: string) => {
			const hist = order?.statusHistory || []
			const h = hist.find((x: any) => String(x.status) === String(statusKey))
			return h?.ts || null
		}

		return (
			<View>
				{steps.map((s, idx) => {
					const ts = findTs(s.key as string)
					const done = !!ts
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
								<Text style={{ color: '#6b7280', fontSize: 12 }}>{done ? formatDate(ts) : ''}</Text>
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
				// attempt to load any existing complaint for this order
				try {
					const existing = await (complaints as any).fetchComplaintByOrderId(orderId)
					if (mounted) setComplaint(existing)
				} catch (e) {}
			} finally {
				if (mounted) setLoading(false)
			}
		})()
		// subscribe to complaint changes so consumer sees status updates
		const off = emitter.on('complaintsChanged', async () => {
			if (!orderId) return
			try {
				const updated = await (complaints as any).fetchComplaintByOrderId(orderId)
				if (mounted) setComplaint(updated)
			} catch (e) {}
		})
		return () => {
			mounted = false
			off()
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
								<Text style={{ fontWeight: '700' }}>{order?.orderNumber}</Text>
							</View>
							<View style={styles.rowBetween}>
								<Text style={{ color: '#6b7280' }}>{L.supplier}</Text>
								<Text>{order?.supplier}</Text>
							</View>
							<View style={styles.rowBetween}>
								<Text style={{ color: '#6b7280' }}>{L.date}</Text>
								<Text>{order?.date}</Text>
							</View>
							<View style={styles.rowBetween}>
								<Text style={{ color: '#6b7280' }}>{L.status}</Text>
								<View style={styles.statusPill}>
									<Text style={{ color: '#059669' }}>{order?.status}</Text>
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
							<Text style={{ fontWeight: '700', marginBottom: 8 }}>{L.timeline}</Text>
							<View style={{ marginBottom: 16 }}>
								<Timeline />
							</View>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<Text style={{ color: '#6b7280' }}>{L.total}</Text>
								<Text style={{ color: '#2563eb', fontWeight: '700' }}>{formatPrice(order?.total || 0)}</Text>
							</View>
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
								<Text>{L.orderDetail}</Text>
							</TouchableOpacity>

							<View>
								<TouchableOpacity
									onPress={() => setComplaintModalVisible(true)}
									disabled={!!complaint}
									style={[
										{ marginTop: 12, padding: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
										complaint ? { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' } : { backgroundColor: '#fee2e2', borderColor: '#fecaca' }
									]}
								>
									<Text style={{ color: complaint ? '#6b7280' : '#b91c1c', fontWeight: '700' }}>
										{complaint ? 'Complaint Submitted' : 'Report an issue'}
									</Text>
								</TouchableOpacity>

								{/* Mini status grid shown when a complaint exists */}
								{complaint && (
									<View style={{ marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' }}>
										<Text style={{ fontWeight: '700', marginBottom: 6 }}>Complaint Status</Text>
										{/* show reason first (full width) so long descriptions don't push status off-screen */}
										<View>
											<Text style={{ color: '#374151' }}>{complaint.reason || 'No description provided'}</Text>
											<Text style={{ color: '#6b7280', marginTop: 6, fontSize: 12 }}>
												Submitted: {formatDate(complaint.createdAt)}
											</Text>
										</View>
										{/* status on its own row below the description */}
										<View style={{ marginTop: 8, alignItems: 'flex-end' }}>
											<Text
												style={{
													color: complaint.status === COMPLAINT_STATUS.RESOLVED ? COLORS.SUCCESS : complaint.status === COMPLAINT_STATUS.IN_PROGRESS ? COLORS.WARNING : COLORS.ERROR,
													fontWeight: '700'
												}}
											>
												{complaint.status}
											</Text>
										</View>

										{/* If supplier resolved the complaint, ask for feedback */}
										{complaint.status === COMPLAINT_STATUS.RESOLVED && !feedbackGiven && (
											<View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
												<Text style={{ color: '#374151' }}>Did this resolution help you?</Text>
												<View style={{ flexDirection: 'row' }}>
													<TouchableOpacity
														onPress={() => {
															setFeedbackGiven(true)
															try {
																toastShow('Thanks', 'Thanks for your feedback!')
															} catch (e) {}
														}}
														style={{ backgroundColor: '#059669', padding: 8, borderRadius: 8, marginRight: 8 }}
													>
														<Text style={{ color: '#fff' }}>Yes</Text>
													</TouchableOpacity>
													<TouchableOpacity
														onPress={async () => {
															// consumer indicated 'No' — reopen the complaint for supplier action
															try {
																setFeedbackGiven(true)
																await (complaints as any).updateComplaintStatus(complaint.id, 'Open')
																// update local view
																const updated = await (complaints as any).fetchComplaintByOrderId(orderId as string)
																setComplaint(updated)
																try {
																	toastShow('Thanks', 'We notified the supplier and reopened the complaint')
																} catch (e) {}
															} catch (e) {
																try {
																	toastShow('Error', 'Could not reopen complaint')
																} catch (e) {}
															}
														}}
														style={{ backgroundColor: '#f3f4f6', padding: 8, borderRadius: 8 }}
													>
														<Text>No</Text>
													</TouchableOpacity>
												</View>
											</View>
										)}
										{feedbackGiven && <Text style={{ color: '#6b7280', marginTop: 8 }}>Thank you for your response.</Text>}
									</View>
								)}
							</View>

							<ComplaintModal
								visible={complaintModalVisible}
								initialValue={''}
								onClose={() => {
									setComplaintModalVisible(false)
								}}
								onSubmit={async (reason: string) => {
									if (!orderId) return
									try {
										const created = await complaints.createComplaint(orderId, undefined, order?.supplier, reason || '', userName || undefined)
										// set local complaint state so the consumer sees the mini-grid and can't resubmit
										setComplaint(created)
										try {
											toastShow('Complaint logged', 'We have recorded your issue and supplier will be notified')
										} catch (e) {}
									} catch (e) {
										try {
											toastShow('Error', 'Could not submit complaint')
										} catch (e) {}
										throw e
									}
								}}
							/>
						</View>
					)}
				/>
			)}
		</SafeAreaView>
	)
}
