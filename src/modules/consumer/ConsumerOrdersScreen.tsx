import React, { useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native'
import { styles } from '../../styles/consumer/ConsumerOrdersScreen.styles'
import { Feather } from '@expo/vector-icons'
import { useOrders } from '../../hooks/useOrders'
import { useLinkedSuppliers } from '../../hooks/useLinkedSuppliers'
import { getTranslations, type Language } from '../../translations'
import { formatPrice } from '../../utils/formatters'
import { ORDER_STATUS, COLORS } from '../../constants'

export default function ConsumerOrdersScreen({
	onBack,
	onOpenOrder,
	language
}: {
	onBack?: () => void
	onOpenOrder?: (id: string) => void
	language?: 'en' | 'ru'
}) {
	const L = getTranslations('consumer', 'orders', language ?? 'en')
	const commonT = getTranslations('shared', 'common', language ?? 'en')

	// Filter states
	const [statusFilter, setStatusFilter] = useState<string[]>([])
	const [supplierFilter, setSupplierFilter] = useState<Array<number | string>>([])
	const [complaintFilter, setComplaintFilter] = useState<boolean | null>(null) // null = all, true = has complaint, false = no complaint
	const [minTotal, setMinTotal] = useState<string>('')
	const [maxTotal, setMaxTotal] = useState<string>('')
	const [showFilters, setShowFilters] = useState(false)

	// Get suppliers for filter
	const { suppliers } = useLinkedSuppliers()
	const acceptedSuppliers = useMemo(() => {
		return suppliers.filter((s: any) => {
			const status = String(s.status || '').toLowerCase()
			return status === 'accepted'
		})
	}, [suppliers])

	// All filtering is done client-side
	const { orders: allOrders, loading, error, refresh } = useOrders()

	// Toggle status filter (multi-select, same logic as supplier orders)
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

	// Toggle supplier filter (multi-select)
	const toggleSupplierFilter = (supplierId: number | string | null) => {
		if (supplierId === null) {
			setSupplierFilter([])
		} else {
			setSupplierFilter((prev) => {
				if (prev.includes(supplierId)) {
					return prev.filter((id) => id !== supplierId)
				} else {
					return [...prev, supplierId]
				}
			})
		}
	}

	// Apply client-side filters
	const orders = useMemo(() => {
		let filtered = allOrders || []

		// Apply status filter (multi-select)
		if (statusFilter.length > 0) {
			filtered = filtered.filter((order: any) => {
				const status = String(order.status || '').toLowerCase()
				return statusFilter.includes(status)
			})
		}

		// Apply supplier filter (multi-select)
		if (supplierFilter.length > 0) {
			filtered = filtered.filter((order: any) => {
				const sid = order.supplier_id
				return supplierFilter.includes(sid)
			})
		}

		// Apply complaint filter
		if (complaintFilter !== null) {
			filtered = filtered.filter((order: any) => {
				return complaintFilter ? order.has_complaint : !order.has_complaint
			})
		}

		// Apply total amount filters
		if (minTotal && !isNaN(parseFloat(minTotal))) {
			const min = parseFloat(minTotal)
			filtered = filtered.filter((order: any) => {
				const total = typeof order.total === 'number' ? order.total : parseFloat(order.total_kzt || 0)
				return total >= min
			})
		}
		if (maxTotal && !isNaN(parseFloat(maxTotal))) {
			const max = parseFloat(maxTotal)
			filtered = filtered.filter((order: any) => {
				const total = typeof order.total === 'number' ? order.total : parseFloat(order.total_kzt || 0)
				return total <= max
			})
		}

		return filtered
	}, [allOrders, statusFilter, supplierFilter, complaintFilter, minTotal, maxTotal])

	const clearFilters = () => {
		setStatusFilter([])
		setSupplierFilter([])
		setComplaintFilter(null)
		setMinTotal('')
		setMaxTotal('')
	}

	const activeFiltersCount = useMemo(() => {
		let count = 0
		if (statusFilter.length > 0) count++
		if (supplierFilter.length > 0) count++
		if (complaintFilter !== null) count++
		if (minTotal && !isNaN(parseFloat(minTotal))) count++
		if (maxTotal && !isNaN(parseFloat(maxTotal))) count++
		return count
	}, [statusFilter, supplierFilter, complaintFilter, minTotal, maxTotal])

	const renderItem = ({ item }: any) => {
		const status = (item.status || 'pending').toLowerCase()

		// Get translated status
		const getStatusTranslation = (statusValue: string): string => {
			switch (statusValue) {
				case 'pending':
					return L.statusPending || 'Pending'
				case 'accepted':
					return L.statusAccepted || 'Accepted'
				case 'in_progress':
					return L.statusInProgress || 'In Progress'
				case 'completed':
					return L.statusCompleted || 'Completed'
				case 'rejected':
					return L.statusRejected || 'Rejected'
				default:
					return statusValue.charAt(0).toUpperCase() + statusValue.slice(1).replace('_', ' ')
			}
		}
		const displayStatus = getStatusTranslation(status)

		const orderNumber = item.orderNumber || `#${item.id}`
		const total =
			typeof item.total === 'number' ? item.total : typeof item.total_kzt === 'string' ? parseFloat(item.total_kzt) : Number(item.total_kzt || 0)
		const itemsCount = item.itemsCount || item.items?.length || 0
		const date = item.date || item.created_at || ''
		const supplierName = item.supplier || L.supplier || 'Supplier'
		const hasComplaint = item.has_complaint || false

		return (
			<TouchableOpacity
				style={styles.card}
				onPress={() => onOpenOrder && onOpenOrder(String(item.id))}
			>
				<View style={styles.cardHeader}>
					<View style={{ flex: 1 }}>
						<Text style={styles.orderTitle}>
							{L.orderPrefix || 'Order '}
							{orderNumber}
						</Text>
						{hasComplaint && (
							<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
								<Feather
									name="alert-circle"
									size={14}
									color="#f59e0b"
								/>
								<Text style={{ color: '#f59e0b', fontSize: 12, marginLeft: 4 }}>{L.hasComplaint || 'Has Complaint'}</Text>
							</View>
						)}
					</View>
					<View
						style={[
							styles.statusPill,
							status === 'completed'
								? { backgroundColor: COLORS.SUCCESS_LIGHT }
								: status === 'rejected'
									? { backgroundColor: COLORS.ERROR_LIGHT }
									: { backgroundColor: '#eff6ff' }
						]}
					>
						<Text style={[styles.statusText, { color: status === 'completed' ? COLORS.SUCCESS : status === 'rejected' ? COLORS.ERROR : '#2563eb' }]}>
							{displayStatus}
						</Text>
					</View>
				</View>
				<Text style={styles.supplier}>{supplierName}</Text>
				<View style={styles.cardFooter}>
					<Text style={styles.date}>{date ? new Date(date).toLocaleDateString() : ''}</Text>
					<View style={{ alignItems: 'flex-end' }}>
						<Text style={styles.total}>{formatPrice(total)}</Text>
						<Text style={styles.itemCount}>{`${itemsCount} ${L.items || 'items'}`}</Text>
					</View>
				</View>
			</TouchableOpacity>
		)
	}

	const statusOptions = [
		{ value: 'pending', label: L.statusPending || 'Pending' },
		{ value: 'accepted', label: L.statusAccepted || 'Accepted' },
		{ value: 'in_progress', label: L.statusInProgress || 'In Progress' },
		{ value: 'completed', label: L.statusCompleted || 'Completed' },
		{ value: 'rejected', label: L.statusRejected || 'Rejected' }
	]

	const complaintOptions = [
		{ value: null, label: L.allOrders || 'All Orders' },
		{ value: true, label: L.withComplaint || 'With Complaint' },
		{ value: false, label: L.withoutComplaint || 'Without Complaint' }
	]

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
				<Text style={{ fontSize: 18, fontWeight: '700' }}>{L.orders}</Text>
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

			{loading && orders.length === 0 ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<Text style={{ color: '#6b7280' }}>{L.loading || 'Loading...'}</Text>
				</View>
			) : error ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
					<Text style={{ color: '#ef4444', marginBottom: 12 }}>{L.errorLoadingOrders || 'Error loading orders'}</Text>
					<TouchableOpacity
						onPress={() => refresh()}
						style={{ padding: 12, backgroundColor: '#2563eb', borderRadius: 8 }}
					>
						<Text style={{ color: '#fff' }}>{L.retry || 'Retry'}</Text>
					</TouchableOpacity>
				</View>
			) : orders.length === 0 ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
					<Feather
						name="package"
						size={48}
						color="#cbd5e1"
					/>
					<Text style={{ color: '#6b7280', marginTop: 12, fontSize: 16, fontWeight: '600' }}>{L.noOrdersYet || 'No Orders Yet'}</Text>
					<Text style={{ color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
						{L.noOrdersYetDesc || 'Your orders will appear here once you place them'}
					</Text>
				</View>
			) : (
				<FlatList
					data={orders}
					keyExtractor={(i: any) => String(i.id)}
					contentContainerStyle={{ padding: 16 }}
					renderItem={renderItem}
					refreshing={loading && orders.length > 0}
					onRefresh={() => refresh()}
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
							<Text style={{ fontSize: 18, fontWeight: '700' }}>{L.filters || 'Filters'}</Text>
							<View style={{ flexDirection: 'row', gap: 12 }}>
								{activeFiltersCount > 0 && (
									<TouchableOpacity
										onPress={clearFilters}
										style={{ paddingHorizontal: 12, paddingVertical: 6 }}
									>
										<Text style={{ color: '#ef4444', fontSize: 14 }}>{L.clearFilters || 'Clear'}</Text>
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
							<Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8 }}>{L.filterByStatus || 'Filter by Status'}</Text>
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

							{/* Supplier Filter */}
							<Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>{L.filterBySupplier || 'Filter by Supplier'}</Text>
							<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
								{acceptedSuppliers.map((supplier: any) => {
									const supplierId = supplier.supplier_id || supplier.supplierId || supplier.id
									const supplierName = supplier.supplier?.company_name || supplier.name || L.supplier || 'Supplier'
									const isSelected = supplierFilter.includes(supplierId)
									return (
										<TouchableOpacity
											key={supplierId}
											onPress={() => toggleSupplierFilter(supplierId)}
											style={{
												paddingHorizontal: 16,
												paddingVertical: 8,
												borderRadius: 20,
												backgroundColor: isSelected ? '#2563eb' : '#f3f4f6',
												borderWidth: 1,
												borderColor: isSelected ? '#2563eb' : '#e5e7eb'
											}}
										>
											<Text
												style={{ color: isSelected ? '#fff' : '#374151', fontSize: 14 }}
												numberOfLines={1}
											>
												{supplierName}
											</Text>
										</TouchableOpacity>
									)
								})}
							</View>

							{/* Complaint Filter */}
							<Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>{L.filterByComplaint || 'Filter by Complaint'}</Text>
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
							<Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>{L.filterByAmount || 'Filter by Total Amount'}</Text>
							<View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{L.minAmount || 'Min Amount'}</Text>
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
									<Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{L.maxAmount || 'Max Amount'}</Text>
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
