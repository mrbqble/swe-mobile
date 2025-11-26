import React, { useEffect, useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native'
import { styles } from '../../styles/supplier/SupplierOrdersScreen.styles'
import { Feather } from '@expo/vector-icons'
import { orders } from '../../api'
import { emitter } from '../../helpers/events'
import { getTranslations, type Language } from '../../translations'
import { formatPrice } from '../../utils/formatters'

export default function SupplierOrdersScreen({
	language = 'en',
	navigateTo,
	onOrderSelect,
	supplierName,
	initialFilters
}: {
	language?: 'en' | 'ru'
	navigateTo?: (s: string) => void
	onOrderSelect?: (o: any) => void
	supplierName?: string
	initialFilters?: any
}) {
	const t = getTranslations('supplier', 'orders', language)
	const [ordersList, setOrders] = useState<any[]>([])
	const [refreshing, setRefreshing] = useState(false)
	const [loading, setLoading] = useState(true)

	// Filter states - using arrays for multi-select
	const [statusFilter, setStatusFilter] = useState<string[]>(initialFilters?.status || [])
	const [complaintFilter, setComplaintFilter] = useState<boolean | null>(null)
	const [minTotal, setMinTotal] = useState<string>('')
	const [maxTotal, setMaxTotal] = useState<string>('')
	const [showFilters, setShowFilters] = useState(false)
	const [consumers, setConsumers] = useState<Array<{ id: number; name: string }>>([])

	const clearFilters = () => {
		setStatusFilter([])
		setComplaintFilter(null)
		setMinTotal('')
		setMaxTotal('')
	}

	const activeFiltersCount = useMemo(() => {
		let count = 0
		if (statusFilter.length > 0) count++
		if (complaintFilter !== null) count++
		if (minTotal && !isNaN(parseFloat(minTotal))) count++
		if (maxTotal && !isNaN(parseFloat(maxTotal))) count++
		return count
	}, [statusFilter, complaintFilter, minTotal, maxTotal])

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

	// Normalize backend order structure to frontend format
	const normalizeOrder = (order: any) => {
		const total = typeof order.total_kzt === 'string' ? parseFloat(order.total_kzt) : Number(order.total_kzt || 0)
		const items = order.items || []
		const itemsCount = items.length

		// Calculate total items quantity
		const totalQty = items.reduce((sum: number, item: any) => sum + (item.qty || 0), 0)

		// Helper to format full name from first_name and last_name
		const formatFullName = (person: any) => {
			if (!person) return ''
			// Check if user object exists (nested relationship)
			const user = person.user || person
			if (user?.first_name && user?.last_name) {
				return `${user.first_name} ${user.last_name}`.trim()
			}
			return person.organization_name || person.company_name || person.name || ''
		}

		return {
			id: order.id,
			orderNumber: `#${order.id}`,
			supplier_id: order.supplier_id,
			consumer_id: order.consumer_id,
			supplier: order.supplier?.company_name || formatFullName(order.supplier) || order.supplier?.name || '',
			consumer: formatFullName(order.consumer) || order.consumer?.organization_name || order.consumer?.name || '',
			status: order.status || 'pending',
			total: total,
			total_kzt: order.total_kzt,
			date: order.created_at,
			created_at: order.created_at,
			has_complaint: order.has_complaint || false,
			items: items.map((item: any) => ({
				id: item.id,
				product_id: item.product_id,
				productId: item.product_id,
				qty: item.qty,
				quantity: item.qty,
				unit_price_kzt: item.unit_price_kzt,
				price: typeof item.unit_price_kzt === 'string' ? parseFloat(item.unit_price_kzt) : Number(item.unit_price_kzt || 0),
				name: item.product?.name || `Product ${item.product_id}`,
				description: item.product?.description || ''
			})),
			itemsCount: itemsCount,
			totalQty: totalQty
		}
	}

	useEffect(() => {
		let mounted = true
		setLoading(true)
		;(async () => {
			try {
				// Backend automatically filters orders by role (supplier sees their supplier's orders)
				// For sales reps, backend filters to only show orders assigned to them
				// All other filtering is done client-side
				const res = await orders.listOrders({ page: 1, size: 100 })
				const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []
				let filteredItems = items.map((order: any) => normalizeOrder(order)) || []

				// Extract unique consumers from orders
				const uniqueConsumers = new Map<number, { id: number; name: string }>()
				items.forEach((order: any) => {
					if (order.consumer_id) {
						const consumerId = order.consumer_id
						if (!uniqueConsumers.has(consumerId)) {
							const normalized = normalizeOrder(order)
							const consumerName = normalized.consumer || `Consumer ${consumerId}`
							uniqueConsumers.set(consumerId, { id: consumerId, name: consumerName })
						}
					}
				})
				setConsumers(Array.from(uniqueConsumers.values()))

				// Apply status filter (multi-select)
				if (statusFilter.length > 0) {
					filteredItems = filteredItems.filter((order: any) => {
						const status = String(order.status || '').toLowerCase()
						return statusFilter.includes(status)
					})
				}

				// Apply complaint filter
				if (complaintFilter !== null) {
					filteredItems = filteredItems.filter((order: any) => {
						return complaintFilter ? order.has_complaint : !order.has_complaint
					})
				}

				// Apply total amount filters
				if (minTotal && !isNaN(parseFloat(minTotal))) {
					const min = parseFloat(minTotal)
					filteredItems = filteredItems.filter((order: any) => {
						const total = typeof order.total === 'number' ? order.total : parseFloat(order.total_kzt || 0)
						return total >= min
					})
				}
				if (maxTotal && !isNaN(parseFloat(maxTotal))) {
					const max = parseFloat(maxTotal)
					filteredItems = filteredItems.filter((order: any) => {
						const total = typeof order.total === 'number' ? order.total : parseFloat(order.total_kzt || 0)
						return total <= max
					})
				}

				if (mounted) {
					setOrders(filteredItems)
					setLoading(false)
				}
			} catch (e) {
				console.error('Failed to fetch orders:', e)
				if (mounted) {
					setOrders([])
					setLoading(false)
				}
			}
		})()
		let unsub = () => {}
		if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
			unsub = emitter.on('ordersChanged', async () => {
				try {
					const res = await orders.listOrders({ page: 1, size: 100 })
					const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []
					let filteredItems = items.map((order: any) => normalizeOrder(order)) || []

					// Apply status filter (multi-select)
					if (statusFilter.length > 0) {
						filteredItems = filteredItems.filter((order: any) => {
							const status = String(order.status || '').toLowerCase()
							return statusFilter.includes(status)
						})
					}

					// Apply complaint filter
					if (complaintFilter !== null) {
						filteredItems = filteredItems.filter((order: any) => {
							return complaintFilter ? order.has_complaint : !order.has_complaint
						})
					}

					// Apply total amount filters
					if (minTotal && !isNaN(parseFloat(minTotal))) {
						const min = parseFloat(minTotal)
						filteredItems = filteredItems.filter((order: any) => {
							const total = typeof order.total === 'number' ? order.total : parseFloat(order.total_kzt || 0)
							return total >= min
						})
					}
					if (maxTotal && !isNaN(parseFloat(maxTotal))) {
						const max = parseFloat(maxTotal)
						filteredItems = filteredItems.filter((order: any) => {
							const total = typeof order.total === 'number' ? order.total : parseFloat(order.total_kzt || 0)
							return total <= max
						})
					}

					if (mounted) setOrders(filteredItems)
				} catch (e) {
					console.error('Failed to refresh orders:', e)
				}
			})
		}
		return () => {
			try {
				unsub()
			} catch (e) {}
			mounted = false
		}
	}, [statusFilter, complaintFilter, minTotal, maxTotal])

	const onRefresh = async () => {
		setRefreshing(true)
		try {
			const res = await orders.listOrders({ page: 1, size: 100 })
			const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []
			let filteredItems = items.map((order: any) => normalizeOrder(order)) || []

			// Apply status filter (multi-select)
			if (statusFilter.length > 0) {
				filteredItems = filteredItems.filter((order: any) => {
					const status = String(order.status || '').toLowerCase()
					return statusFilter.includes(status)
				})
			}

			// Apply complaint filter
			if (complaintFilter !== null) {
				filteredItems = filteredItems.filter((order: any) => {
					return complaintFilter ? order.has_complaint : !order.has_complaint
				})
			}

			// Apply total amount filters
			if (minTotal && !isNaN(parseFloat(minTotal))) {
				const min = parseFloat(minTotal)
				filteredItems = filteredItems.filter((order: any) => {
					const total = typeof order.total === 'number' ? order.total : parseFloat(order.total_kzt || 0)
					return total >= min
				})
			}
			if (maxTotal && !isNaN(parseFloat(maxTotal))) {
				const max = parseFloat(maxTotal)
				filteredItems = filteredItems.filter((order: any) => {
					const total = typeof order.total === 'number' ? order.total : parseFloat(order.total_kzt || 0)
					return total <= max
				})
			}

			setOrders(filteredItems)
		} catch (e) {
			console.error('Failed to refresh orders:', e)
		}
		setRefreshing(false)
	}

	const renderItem = ({ item }: any) => {
		const status = (item.status || 'pending').toLowerCase()

		// Get translated status
		const getStatusTranslation = (statusValue: string): string => {
			switch (statusValue) {
				case 'pending':
					return t.statusPending || 'Pending'
				case 'accepted':
					return t.statusAccepted || 'Accepted'
				case 'in_progress':
					return t.statusInProgress || 'In Progress'
				case 'completed':
					return t.statusCompleted || 'Completed'
				case 'rejected':
					return t.statusRejected || 'Rejected'
				default:
					return statusValue.charAt(0).toUpperCase() + statusValue.slice(1).replace('_', ' ')
			}
		}
		const displayStatus = getStatusTranslation(status)

		// Format full name - item.consumer should already be normalized with full name from API
		const consumerName = item.consumer || item.customer || t.consumer || 'Consumer'
		const orderNumber = item.orderNumber || `#${item.id}`
		const total =
			typeof item.total === 'number' ? item.total : typeof item.total_kzt === 'string' ? parseFloat(item.total_kzt) : Number(item.total_kzt || 0)
		const itemsCount = item.itemsCount || item.items?.length || 0
		const date = item.date || item.created_at || ''
		const hasComplaint = item.has_complaint || false

		return (
			<TouchableOpacity
				style={styles.card}
				onPress={() => onOrderSelect && onOrderSelect(item)}
			>
				<View style={styles.cardHeader}>
					<View style={{ flex: 1 }}>
						<Text style={{ fontWeight: '700' }}>
							{t.order} {orderNumber}
						</Text>
						<Text style={{ color: '#6b7280' }}>{consumerName}</Text>
						{item.consumer_id && <Text style={{ color: '#9ca3af', fontSize: 12 }}>ID: {item.consumer_id}</Text>}
						{hasComplaint && (
							<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
								<Feather
									name="alert-circle"
									size={14}
									color="#f59e0b"
								/>
								<Text style={{ color: '#f59e0b', fontSize: 12, marginLeft: 4 }}>{t.hasComplaint || 'Has Complaint'}</Text>
							</View>
						)}
					</View>
					<View style={[styles.statusPill, { backgroundColor: status === 'completed' ? '#ecfdf5' : status === 'rejected' ? '#fee2e2' : '#eff6ff' }]}>
						<Text style={{ color: status === 'completed' ? '#059669' : status === 'rejected' ? '#dc2626' : '#2563eb' }}>{displayStatus}</Text>
					</View>
				</View>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
					<Text style={{ color: '#6b7280' }}>{date ? new Date(date).toLocaleDateString() : ''}</Text>
					<View style={{ alignItems: 'flex-end' }}>
						<Text style={{ color: '#2563eb', fontWeight: '700' }}>{formatPrice(total)}</Text>
						<Text style={{ color: '#6b7280', fontSize: 12 }}>
							{itemsCount} {t.items || 'items'}
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		)
	}

	const statusOptions = [
		{ value: 'pending', label: t.statusPending || 'Pending' },
		{ value: 'accepted', label: t.statusAccepted || 'Accepted' },
		{ value: 'in_progress', label: t.statusInProgress || 'In Progress' },
		{ value: 'completed', label: t.statusCompleted || 'Completed' },
		{ value: 'rejected', label: t.statusRejected || 'Rejected' }
	]

	const complaintOptions = [
		{ value: null, label: t.allOrders || 'All Orders' },
		{ value: true, label: t.withComplaint || 'With Complaint' },
		{ value: false, label: t.withoutComplaint || 'Without Complaint' }
	]

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => navigateTo && navigateTo('supplier-home')}
					style={{ padding: 8 }}
				>
					<Feather
						name="arrow-left"
						size={20}
						color="#111827"
					/>
				</TouchableOpacity>
				<Text style={{ fontSize: 18, fontWeight: '700' }}>{t.orders}</Text>
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
								borderRadius: 8,
								minWidth: 16,
								height: 16,
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

			{loading && ordersList.length === 0 ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<Text style={{ color: '#6b7280' }}>{t.loading || 'Loading...'}</Text>
				</View>
			) : ordersList.length === 0 ? (
				<View style={{ padding: 24, alignItems: 'center' }}>
					<Text style={{ color: '#9ca3af' }}>{t.noOrders}</Text>
					<Text style={{ color: '#9ca3af', marginTop: 8 }}>{t.noOrdersDesc}</Text>
				</View>
			) : (
				<FlatList
					data={ordersList}
					keyExtractor={(i) => String(i.id)}
					contentContainerStyle={{ padding: 16 }}
					renderItem={renderItem}
					refreshing={refreshing}
					onRefresh={onRefresh}
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

							{/* Complaint Filter */}
							<Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>{t.filterByComplaint || 'Filter by Complaint'}</Text>
							<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
								{complaintOptions.map((opt) => (
									<TouchableOpacity
										key={opt.value === null ? 'all' : String(opt.value)}
										onPress={() => setComplaintFilter(opt.value)}
										style={{
											paddingHorizontal: 16,
											paddingVertical: 8,
											borderRadius: 20,
											backgroundColor: complaintFilter === opt.value ? '#2563eb' : '#f3f4f6',
											borderWidth: 1,
											borderColor: complaintFilter === opt.value ? '#2563eb' : '#e5e7eb'
										}}
									>
										<Text style={{ color: complaintFilter === opt.value ? '#fff' : '#374151', fontSize: 14 }}>{opt.label}</Text>
									</TouchableOpacity>
								))}
							</View>

							{/* Total Amount Filter */}
							<Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>{t.filterByAmount || 'Filter by Total Amount'}</Text>
							<View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{t.minAmount || 'Min Amount'}</Text>
									<TextInput
										value={minTotal}
										onChangeText={setMinTotal}
										placeholder="0"
										keyboardType="numeric"
										style={{
											borderWidth: 1,
											borderColor: '#e5e7eb',
											borderRadius: 8,
											padding: 12,
											fontSize: 14
										}}
									/>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{t.maxAmount || 'Max Amount'}</Text>
									<TextInput
										value={maxTotal}
										onChangeText={setMaxTotal}
										placeholder="∞"
										keyboardType="numeric"
										style={{
											borderWidth: 1,
											borderColor: '#e5e7eb',
											borderRadius: 8,
											padding: 12,
											fontSize: 14
										}}
									/>
								</View>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	)
}
