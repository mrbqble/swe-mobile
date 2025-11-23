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
	// Check if feedback has been given based on complaint data
	const feedbackGiven = complaint?.consumer_feedback !== null && complaint?.consumer_feedback !== undefined

	const Timeline = () => {
		const steps = [
			{ key: 'pending', label: L.orderCreated || 'Order Created', icon: 'calendar' },
			{ key: 'accepted', label: L.orderAccepted || 'Order Accepted', icon: 'check-circle' },
			{ key: 'in_progress', label: L.inProgress || 'In Progress', icon: 'clock' },
			{ key: 'completed', label: L.completed || 'Completed', icon: 'check' }
		]

		const currentStatus = order?.status?.toLowerCase() || 'pending'

		// Helper to determine if a step is completed
		const isStepCompleted = (stepKey: string) => {
			const stepIndex = steps.findIndex((s) => s.key === stepKey)
			const currentIndex = steps.findIndex((s) => s.key === currentStatus)
			return stepIndex <= currentIndex
		}

		return (
			<View>
				{steps.map((s) => {
					const done = isStepCompleted(s.key)
					const isCurrent = s.key === currentStatus

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
								{isCurrent && order?.created_at && <Text style={{ color: '#6b7280', fontSize: 12 }}>{formatDate(order.created_at)}</Text>}
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
				} catch (e) {
					// No complaint exists yet, that's fine
				}
			} catch (err: any) {
				console.error('Failed to fetch order:', err)
				if (mounted) {
					const errorMsg = err?.body?.detail || err?.message || 'Failed to load order'
					const commonT = getTranslations('shared', 'common', language || 'en')
					toastShow(commonT.error || 'Error', errorMsg)
				}
			} finally {
				if (mounted) setLoading(false)
			}
		})()
		// subscribe to order and complaint changes
		const offOrder = emitter.on('ordersChanged', async () => {
			if (!orderId) return
			try {
				const updated = await orders.fetchOrderById(orderId)
				if (mounted) setOrder(updated)
			} catch (e) {
				console.error('Failed to refresh order:', e)
			}
		})
		const offComplaint = emitter.on('complaintsChanged', async () => {
			if (!orderId) return
			try {
				const updated = await (complaints as any).fetchComplaintByOrderId(orderId)
				if (mounted) setComplaint(updated)
			} catch (e) {
				// No complaint exists, that's fine
			}
		})
		return () => {
			mounted = false
			try {
				offOrder()
				offComplaint()
			} catch (e) {
				// ignore
			}
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

			{loading && !order ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<Text style={{ color: '#6b7280' }}>{L.loading || 'Loading...'}</Text>
				</View>
			) : !order ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
					<Text style={{ color: '#ef4444' }}>Order not found</Text>
					<TouchableOpacity
						onPress={onBack}
						style={{ marginTop: 12, padding: 12, backgroundColor: '#2563eb', borderRadius: 8 }}
					>
						<Text style={{ color: '#fff' }}>Go Back</Text>
					</TouchableOpacity>
				</View>
			) : (
				<FlatList
					ListHeaderComponent={() => (
						<View style={styles.card}>
							<View style={styles.rowBetween}>
								<Text style={{ color: '#6b7280' }}>{L.order || 'Order'}</Text>
								<Text style={{ fontWeight: '700' }}>{order?.orderNumber || `#${order?.id}`}</Text>
							</View>
							<View style={styles.rowBetween}>
								<Text style={{ color: '#6b7280' }}>{L.supplier || 'Supplier'}</Text>
								<Text>{order?.supplier || L.supplier}</Text>
							</View>
							<View style={styles.rowBetween}>
								<Text style={{ color: '#6b7280' }}>{L.date || 'Date'}</Text>
								<Text>{order?.created_at ? formatDate(order.created_at) : order?.date || ''}</Text>
							</View>
							<View style={styles.rowBetween}>
								<Text style={{ color: '#6b7280' }}>{L.status || 'Status'}</Text>
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
					renderItem={({ item }: any) => {
						const itemPrice =
							item.price || (typeof item.unit_price_kzt === 'string' ? parseFloat(item.unit_price_kzt) : Number(item.unit_price_kzt || 0))
						const itemTotal = itemPrice * (item.qty || item.quantity || 0)
						const itemName = item.name || item.product?.name || `Product ${item.product_id || item.productId}`

						return (
						<View style={styles.itemRow}>
								<View style={{ flex: 1 }}>
									<Text style={{ fontWeight: '600' }}>{itemName}</Text>
									{item.description && <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{item.description}</Text>}
								</View>
							<View style={{ alignItems: 'flex-end' }}>
								<Text style={{ color: '#6b7280', fontSize: 12 }}>
										{L.qty || 'Qty'}: {item.qty || item.quantity || 0}
									</Text>
									<Text style={{ color: '#2563eb', fontWeight: '700' }}>
										{formatPrice(itemPrice)} × {item.qty || item.quantity || 0} = {formatPrice(itemTotal)}
								</Text>
								</View>
							</View>
						)
					}}
					ListFooterComponent={() => (
						<View style={{ padding: 16 }}>
							<Text style={{ fontWeight: '700', marginBottom: 8 }}>{L.timeline}</Text>
							<View style={{ marginBottom: 16 }}>
								<Timeline />
							</View>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<Text style={{ color: '#6b7280' }}>{L.total || 'Total'}</Text>
								<Text style={{ color: '#2563eb', fontWeight: '700' }}>
									{formatPrice(
										typeof order?.total === 'number'
											? order.total
											: typeof order?.total_kzt === 'string'
												? parseFloat(order.total_kzt)
												: Number(order?.total_kzt || 0)
									)}
								</Text>
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
								<Text>{L.openChat || 'Open Chat'}</Text>
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
										{complaint ? (L.complaintSubmitted || 'Complaint Submitted') : (L.reportIssue || 'Report an issue')}
									</Text>
								</TouchableOpacity>

								{/* Mini status grid shown when a complaint exists */}
								{complaint && (
									<View style={{ marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' }}>
										<Text style={{ fontWeight: '700', marginBottom: 6 }}>{L.complaintStatus || 'Complaint Status'}</Text>
										{/* show reason first (full width) so long descriptions don't push status off-screen */}
										<View>
											<Text style={{ color: '#374151' }}>{complaint.description || complaint.reason || L.noDescription}</Text>
											<Text style={{ color: '#6b7280', marginTop: 6, fontSize: 12 }}>{L.submitted || 'Submitted:'} {formatDate(complaint.createdAt)}</Text>
										</View>
										{/* status on its own row below the description */}
										<View style={{ marginTop: 8, alignItems: 'flex-end' }}>
											<Text
												style={{
													color:
														complaint.status?.toLowerCase() === COMPLAINT_STATUS.RESOLVED
															? COLORS.SUCCESS
															: complaint.status?.toLowerCase() === COMPLAINT_STATUS.ESCALATED
																? COLORS.WARNING
																: COLORS.ERROR,
													fontWeight: '700'
												}}
											>
												{(() => {
													const statusLower = (complaint.status || '').toLowerCase();
													switch (statusLower) {
														case 'open':
															return L.statusOpen || 'Open';
														case 'escalated':
															return L.statusEscalated || 'Escalated';
														case 'resolved':
															return L.statusResolved || 'Resolved';
														default:
															return complaint.status?.charAt(0).toUpperCase() + complaint.status?.slice(1) || 'Open';
													}
												})()}
											</Text>
										</View>

										{/* If supplier resolved the complaint, ask for feedback */}
										{complaint.status?.toLowerCase() === COMPLAINT_STATUS.RESOLVED && complaint.consumer_feedback === null && (
											<View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
												<Text style={{ color: '#374151' }}>{L.didResolutionHelp || 'Did this resolution help you?'}</Text>
												<View style={{ flexDirection: 'row' }}>
													<TouchableOpacity
														onPress={async () => {
															if (!complaint) return
															try {
																// Submit positive feedback
																const updated = await complaints.submitConsumerFeedback(complaint.id, true)
																setComplaint(updated)
																emitter.emit('complaintsChanged')
																try {
																	const commonT = getTranslations('shared', 'common', language || 'en')
																	toastShow(commonT.welcome || 'Thanks', L.thanksForFeedback || 'Thanks for your feedback!')
																} catch (e) {}
															} catch (e: any) {
																console.error('Failed to submit feedback:', e)
																try {
																	const commonT = getTranslations('shared', 'common', language || 'en')
																	toastShow(commonT.error || 'Error', e?.message || 'Could not submit feedback')
																} catch (e) {}
															}
														}}
														style={{ backgroundColor: '#059669', padding: 8, borderRadius: 8, marginRight: 8 }}
													>
														<Text style={{ color: '#fff' }}>{L.yes || 'Yes'}</Text>
													</TouchableOpacity>
													<TouchableOpacity
														onPress={async () => {
															if (!complaint) return
															// consumer indicated 'No' — submit negative feedback
															try {
																const updated = await complaints.submitConsumerFeedback(complaint.id, false)
																setComplaint(updated)
																emitter.emit('complaintsChanged')
																try {
																	const commonT = getTranslations('shared', 'common', language || 'en')
																	toastShow(commonT.welcome || 'Thanks', L.thanksForFeedback || 'Thanks for your feedback!')
																} catch (e) {}
															} catch (e: any) {
																console.error('Failed to submit feedback:', e)
																try {
																	const commonT = getTranslations('shared', 'common', language || 'en')
																	toastShow(commonT.error || 'Error', e?.message || 'Could not submit feedback')
																} catch (e) {}
															}
														}}
														style={{ backgroundColor: '#f3f4f6', padding: 8, borderRadius: 8 }}
													>
														<Text>{L.no || 'No'}</Text>
													</TouchableOpacity>
												</View>
											</View>
										)}
										{feedbackGiven && (
											<View style={{ marginTop: 12 }}>
												{complaint.consumer_feedback === true ? (
													<Text style={{ color: '#059669', marginTop: 8, fontWeight: '600' }}>
														{L.thankYouForResponse || 'Thank you for your response.'}
													</Text>
												) : complaint.consumer_feedback === false && complaint.status?.toLowerCase() === COMPLAINT_STATUS.RESOLVED ? (
													<View>
														<Text style={{ color: '#6b7280', marginTop: 8 }}>
															{L.thankYouForResponse || 'Thank you for your response.'}
														</Text>
														<TouchableOpacity
															onPress={async () => {
																if (!complaint) return
																try {
																	const updated = await complaints.reopenComplaint(complaint.id)
																	setComplaint(updated)
																	emitter.emit('complaintsChanged')
																	try {
																		const commonT = getTranslations('shared', 'common', language || 'en')
																		toastShow(commonT.welcome || 'Thanks', L.notifiedSupplier || 'We notified the supplier and reopened the complaint')
																	} catch (e) {}
																} catch (e: any) {
																	console.error('Failed to reopen complaint:', e)
																	try {
																		const commonT = getTranslations('shared', 'common', language || 'en')
																		toastShow(commonT.error || 'Error', e?.message || L.couldNotReopen || 'Could not reopen complaint')
																	} catch (e) {}
																}
															}}
															style={{ backgroundColor: '#f3f4f6', padding: 8, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start' }}
														>
															<Text style={{ color: '#111827' }}>{L.reopenComplaint || 'Reopen Complaint'}</Text>
														</TouchableOpacity>
													</View>
												) : null}
											</View>
										)}
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
									if (!orderId || !order) return
									try {
										// Backend requires sales_rep_id and manager_id
										// For now, we'll need to get these from the supplier
										// In a real app, the backend should auto-assign these based on the supplier
										// For now, we'll use placeholder values - the backend should handle this better
										// TODO: Get actual sales_rep_id and manager_id from supplier staff API
										const supplierId = order.supplier_id || order.supplierId
										if (!supplierId) {
											const commonT = getTranslations('shared', 'common', language || 'en')
											toastShow(commonT.error || 'Error', L.cannotCreateComplaint || 'Cannot create complaint: supplier information missing')
											return
										}

										// For now, we'll try to create with default values
										// The backend should ideally auto-assign sales rep and manager
										// Using 1 as placeholder - backend should validate and assign proper staff
										const salesRepId = 1 // TODO: Get from supplier staff
										const managerId = 1 // TODO: Get from supplier staff

										const created = await complaints.createComplaint(orderId, salesRepId, managerId, reason || 'No description provided')
										// set local complaint state so the consumer sees the mini-grid and can't resubmit
										setComplaint(created)
										emitter.emit('complaintsChanged')
										try {
											const commonT = getTranslations('shared', 'common', language || 'en')
											toastShow(L.complaintLogged || 'Complaint logged', L.complaintLoggedMessage || 'We have recorded your issue and supplier will be notified')
										} catch (e) {}
									} catch (e: any) {
										console.error('Failed to create complaint:', e)
										const commonT = getTranslations('shared', 'common', language || 'en')
										const errorMsg = e?.body?.detail || e?.message || L.couldNotSubmitComplaint || 'Could not submit complaint'
										try {
											toastShow(commonT.error || 'Error', errorMsg)
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
