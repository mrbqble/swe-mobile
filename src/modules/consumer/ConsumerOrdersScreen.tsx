import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { styles } from '../../styles/consumer/ConsumerOrdersScreen.styles'
import { Feather } from '@expo/vector-icons'
import { useOrders } from '../../hooks/useOrders'
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
	const { orders, loading, error, refresh } = useOrders()
	const L = getTranslations('consumer', 'orders', language ?? 'en')

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
		// Format full name - item.supplier should already be normalized with full name from API
		const supplierName = item.supplier || L.supplier || 'Supplier'

		return (
			<TouchableOpacity
				style={styles.card}
				onPress={() => onOpenOrder && onOpenOrder(String(item.id))}
			>
				<View style={styles.cardHeader}>
					<Text style={styles.orderTitle}>
						{L.orderPrefix || 'Order '}
						{orderNumber}
					</Text>
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
				<View style={{ width: 36 }} />
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
		</SafeAreaView>
	)
}
