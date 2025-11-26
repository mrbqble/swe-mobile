import React, { useEffect, useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, FlatList, TouchableOpacity, Modal, ScrollView, ActivityIndicator, RefreshControl } from 'react-native'
import { styles } from '../../styles/supplier/SupplierComplaintsScreen.styles'
import { complaints } from '../../api'
import { emitter } from '../../helpers/events'
import { toastShow } from '../../helpers/toast'
import { formatDateOnly } from '../../utils/formatters'
import { COMPLAINT_STATUS, COLORS, getStatusColor } from '../../constants'
import { getTranslations, type Language } from '../../translations'
import { Feather } from '@expo/vector-icons'

export default function SupplierComplaintsScreen({
	supplierName,
	onBack,
	onOpenComplaint,
	language = 'en',
	navigateTo,
	initialFilters
}: {
	supplierName?: string
	onBack?: () => void
	onOpenComplaint?: (complaintId: string) => void
	language?: Language
	navigateTo?: (screen: string) => void
	initialFilters?: any
}) {
	const t = getTranslations('supplier', 'complaints', language)
	const [items, setItems] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)

	// Filter states - using arrays for multi-select
	const [statusFilter, setStatusFilter] = useState<string[]>(initialFilters?.status || [])
	const [consumerFilter, setConsumerFilter] = useState<Array<number | string>>([])
	const [showFilters, setShowFilters] = useState(false)
	const [consumers, setConsumers] = useState<Array<{ id: number; name: string }>>([])

	// Helper to translate complaint status
	const getStatusTranslation = (status: string): string => {
		const statusLower = (status || '').toLowerCase()
		switch (statusLower) {
			case 'open':
				return t.statusOpen || 'Open'
			case 'escalated':
				return t.statusEscalated || 'Escalated'
			case 'resolved':
				return t.statusResolved || 'Resolved'
			default:
				return status.charAt(0).toUpperCase() + status.slice(1)
		}
	}

	// All filtering is done client-side, no need to build filter object for backend

	const load = async () => {
		try {
			setLoading(true)
			// Backend only filters by role, all other filtering is done client-side
			const res = await complaints.listComplaints(1, 100)
			const itemsList = res.items || []
			let filteredItems = itemsList

			// Apply status filter (multi-select)
			if (statusFilter.length > 0) {
				filteredItems = filteredItems.filter((complaint: any) => {
					const status = String(complaint.status || '').toLowerCase()
					return statusFilter.includes(status)
				})
			}

			// Apply consumer filter (multi-select)
			if (consumerFilter.length > 0) {
				filteredItems = filteredItems.filter((complaint: any) => {
					const consumerId = complaint.consumer_id || complaint.consumerId
					return consumerFilter.includes(consumerId)
				})
			}

			setItems(filteredItems)

			// Extract unique consumers from complaints
			const uniqueConsumers = new Map<number, { id: number; name: string }>()
			itemsList.forEach((complaint: any) => {
				if (complaint.consumer_id || complaint.consumerId) {
					const consumerId = complaint.consumer_id || complaint.consumerId
					if (!uniqueConsumers.has(consumerId)) {
						const consumerName =
							complaint.consumerName ||
							(complaint.consumer?.first_name && complaint.consumer?.last_name
								? `${complaint.consumer.first_name} ${complaint.consumer.last_name}`.trim()
								: complaint.consumer?.organization_name || complaint.consumer?.company_name || complaint.consumer?.name || `Consumer ${consumerId}`)
						uniqueConsumers.set(consumerId, { id: consumerId, name: consumerName })
					}
				}
			})
			setConsumers(Array.from(uniqueConsumers.values()))
		} catch (e: any) {
			console.error('Failed to load complaints:', e)
			setItems([])
			toastShow('Error', e?.message || 'Failed to load complaints')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
		const off = emitter.on('complaintsChanged', () => {
			load()
		})
		return () => {
			off()
		}
	}, [statusFilter, consumerFilter])

	const onRefresh = async () => {
		setRefreshing(true)
		try {
			const res = await complaints.listComplaints(1, 100)
			const itemsList = res.items || []
			let filteredItems = itemsList

			// Apply status filter (multi-select)
			if (statusFilter.length > 0) {
				filteredItems = filteredItems.filter((complaint: any) => {
					const status = String(complaint.status || '').toLowerCase()
					return statusFilter.includes(status)
				})
			}

			// Apply consumer filter (multi-select)
			if (consumerFilter.length > 0) {
				filteredItems = filteredItems.filter((complaint: any) => {
					const consumerId = complaint.consumer_id || complaint.consumerId
					return consumerFilter.includes(consumerId)
				})
			}

			setItems(filteredItems)
		} catch (e: any) {
			console.error('Failed to refresh complaints:', e)
		} finally {
			setRefreshing(false)
		}
	}

	const onChangeStatus = async (id: string, status: any) => {
		try {
			await complaints.updateComplaintStatus(id, status.toLowerCase(), null)
			toastShow('Updated', `Complaint marked ${status}`)
			emitter.emit('complaintsChanged')
			load()
		} catch (e: any) {
			console.error('Failed to update complaint status:', e)
			toastShow('Error', e?.message || 'Could not update complaint')
		}
	}

	const clearFilters = () => {
		setStatusFilter([])
		setConsumerFilter([])
	}

	const activeFiltersCount = useMemo(() => {
		let count = 0
		if (statusFilter.length > 0) count++
		if (consumerFilter.length > 0) count++
		return count
	}, [statusFilter, consumerFilter])

	// Toggle status filter
	const toggleStatusFilter = (status: string | null) => {
		if (status === null) {
			setStatusFilter([])
		} else {
			setStatusFilter((prev) => {
				if (prev.includes(status)) {
					return prev.filter((s) => s !== status)
				} else {
					return [...prev, status]
				}
			})
		}
	}

	// Toggle consumer filter
	const toggleConsumerFilter = (consumerId: number | string | null) => {
		if (consumerId === null) {
			setConsumerFilter([])
		} else {
			setConsumerFilter((prev) => {
				if (prev.includes(consumerId)) {
					return prev.filter((id) => id !== consumerId)
				} else {
					return [...prev, consumerId]
				}
			})
		}
	}

	const statusOptions = [
		{ value: 'open', label: t.statusOpen || 'Open' },
		{ value: 'escalated', label: t.statusEscalated || 'Escalated' },
		{ value: 'resolved', label: t.statusResolved || 'Resolved' }
	]

	const consumerOptions = consumers.map((c) => ({ value: c.id, label: c.name }))

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={styles.header}>
				<TouchableOpacity onPress={onBack || (() => navigateTo && navigateTo('supplier-home'))}>
					<Feather
						name="arrow-left"
						size={20}
						color="#111827"
					/>
				</TouchableOpacity>
				<Text style={{ fontSize: 18, fontWeight: '700' }}>{t.complaints}</Text>
				<TouchableOpacity
					onPress={() => setShowFilters(true)}
					style={{ padding: 8, position: 'relative' }}
				>
					<Feather
						name="filter"
						size={20}
						color="#111827"
					/>
					{activeFiltersCount > 0 && (
						<View
							style={{
								position: 'absolute',
								top: 4,
								right: 4,
								backgroundColor: '#ef4444',
								borderRadius: 10,
								minWidth: 18,
								height: 18,
								justifyContent: 'center',
								alignItems: 'center',
								paddingHorizontal: 4
							}}
						>
							<Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{activeFiltersCount}</Text>
						</View>
					)}
				</TouchableOpacity>
			</View>

			{loading && !refreshing ? (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<ActivityIndicator
						size="large"
						color="#2563eb"
					/>
				</View>
			) : (
				<FlatList
					data={items}
					keyExtractor={(i: any) => String(i.id)}
					contentContainerStyle={{ padding: 16 }}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
						/>
					}
					renderItem={({ item }: any) => {
						const status = (item.status || '').toLowerCase()
						const isResolved = status === 'resolved'
						const hasFeedback = item.consumer_feedback !== null && item.consumer_feedback !== undefined
						const isSatisfied = item.consumer_feedback === true
						const complaintNumber = `#${item.id}`
						const orderNumber = `#${item.order_id || item.orderId}`
						const date = item.created_at || item.createdAt || ''
						const consumerName = item.consumerName || t.consumer || 'Consumer'

						// Get status pill colors
						const getStatusPillStyle = () => {
							switch (status) {
								case 'resolved':
									return { backgroundColor: '#ecfdf5' }
								case 'escalated':
									return { backgroundColor: '#fef3c7' }
								case 'open':
								default:
									return { backgroundColor: '#eff6ff' }
							}
						}

						const getStatusTextColor = () => {
							switch (status) {
								case 'resolved':
									return '#059669'
								case 'escalated':
									return '#d97706'
								case 'open':
								default:
									return '#2563eb'
							}
						}

						return (
							<TouchableOpacity
								style={styles.card}
								onPress={() => onOpenComplaint && onOpenComplaint(String(item.id))}
							>
								<View style={styles.cardHeader}>
									<View style={{ flex: 1 }}>
										<Text style={{ fontWeight: '700' }}>
											{t.complaint || 'Complaint'} {complaintNumber}
										</Text>
										<Text style={{ color: '#6b7280' }}>{consumerName}</Text>
										{item.consumer_id || item.consumerId ? (
											<Text style={{ color: '#9ca3af', fontSize: 12 }}>ID: {item.consumer_id || item.consumerId}</Text>
										) : null}
										<Text style={{ color: '#6b7280', marginTop: 2, fontSize: 12 }}>
											{t.order || 'Order'}: {orderNumber}
										</Text>
										{isResolved && hasFeedback && (
											<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
												{isSatisfied ? (
													<>
														<Feather
															name="check-circle"
															size={14}
															color="#059669"
														/>
														<Text style={{ color: '#059669', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>{t.satisfied || 'Satisfied'}</Text>
													</>
												) : (
													<>
														<Feather
															name="x-circle"
															size={14}
															color="#dc2626"
														/>
														<Text style={{ color: '#dc2626', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
															{t.notSatisfied || 'Not Satisfied'}
														</Text>
													</>
												)}
											</View>
										)}
										{isResolved && !hasFeedback && (
											<Text style={{ color: '#9ca3af', marginTop: 4, fontSize: 12, fontStyle: 'italic' }}>
												{t.pendingFeedback || 'Pending feedback'}
											</Text>
										)}
									</View>
									<View style={[styles.statusPill, getStatusPillStyle()]}>
										<Text style={{ color: getStatusTextColor() }}>{getStatusTranslation(item.status)}</Text>
									</View>
								</View>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
									<Text style={{ color: '#6b7280' }}>{date ? new Date(date).toLocaleDateString() : ''}</Text>
									<View style={{ alignItems: 'flex-end' }}>
										<Text
											style={{ color: '#6b7280', fontSize: 12, maxWidth: 200, textAlign: 'right' }}
											numberOfLines={2}
										>
											{item.description || item.reason || t.noDescription}
										</Text>
									</View>
								</View>
							</TouchableOpacity>
						)
					}}
					ListEmptyComponent={() => (
						<View style={{ padding: 24 }}>
							<Text style={{ color: '#6b7280', textAlign: 'center' }}>{t.noComplaints}</Text>
						</View>
					)}
				/>
			)}

			{/* Filter Modal */}
			<Modal
				visible={showFilters}
				animationType="slide"
				transparent
				onRequestClose={() => setShowFilters(false)}
			>
				<View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
					<View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' }}>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center',
								padding: 16,
								borderBottomWidth: 1,
								borderBottomColor: '#e5e7eb'
							}}
						>
							<Text style={{ fontSize: 18, fontWeight: '700' }}>{t.filters || 'Filters'}</Text>
							<View style={{ flexDirection: 'row', gap: 12 }}>
								{activeFiltersCount > 0 && (
									<TouchableOpacity
										onPress={clearFilters}
										style={{ paddingHorizontal: 12, paddingVertical: 6 }}
									>
										<Text style={{ color: '#ef4444', fontSize: 14 }}>{t.clearFilters || 'Clear'}</Text>
									</TouchableOpacity>
								)}
								<TouchableOpacity
									onPress={() => setShowFilters(false)}
									style={{ padding: 8 }}
								>
									<Feather
										name="x"
										size={20}
										color="#111827"
									/>
								</TouchableOpacity>
							</View>
						</View>
						<ScrollView style={{ padding: 16 }}>
							{/* Status Filter */}
							<Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8 }}>{t.filterByStatus || 'Filter by Status'}</Text>
							<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
								{statusOptions.map((opt) => {
									const isSelected = statusFilter.includes(opt.value)
									return (
										<TouchableOpacity
											key={opt.value}
											onPress={() => toggleStatusFilter(opt.value)}
											style={{
												paddingHorizontal: 16,
												paddingVertical: 8,
												borderRadius: 20,
												backgroundColor: isSelected ? '#2563eb' : '#f3f4f6',
												borderWidth: 1,
												borderColor: isSelected ? '#2563eb' : '#e5e7eb'
											}}
										>
											<Text style={{ color: isSelected ? '#fff' : '#374151', fontSize: 14 }}>{opt.label}</Text>
										</TouchableOpacity>
									)
								})}
							</View>

							{/* Consumer Filter */}
							<Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>{t.filterByConsumer || 'Filter by Consumer'}</Text>
							<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
								{consumerOptions.map((opt) => {
									const isSelected = consumerFilter.includes(opt.value)
									return (
										<TouchableOpacity
											key={opt.value}
											onPress={() => toggleConsumerFilter(opt.value)}
											style={{
												paddingHorizontal: 16,
												paddingVertical: 8,
												borderRadius: 20,
												backgroundColor: isSelected ? '#2563eb' : '#f3f4f6',
												borderWidth: 1,
												borderColor: isSelected ? '#2563eb' : '#e5e7eb'
											}}
										>
											<Text style={{ color: isSelected ? '#fff' : '#374151', fontSize: 14 }}>{opt.label}</Text>
										</TouchableOpacity>
									)
								})}
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	)
}
