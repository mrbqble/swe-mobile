import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { styles } from '../../styles/consumer/ConsumerSuppliersScreen.styles'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { useLinkedSuppliers } from '../../hooks/useLinkedSuppliers'
import { getTranslations, type Language } from '../../translations'
import { LINK_STATUS, COLORS, getStatusColor, getStatusBgColor } from '../../constants'

export default function ConsumerSuppliersScreen({
	onBack,
	onRequestLink,
	language
}: {
	onBack?: () => void
	onRequestLink?: () => void
	language?: 'en' | 'ru'
}) {
	const { suppliers, loading } = useLinkedSuppliers()
	const L = getTranslations('consumer', 'suppliers', language ?? 'en')

	const renderItem = ({ item }: any) => {
		// Format full name from first_name and last_name
		const formatFullName = (person: any) => {
			if (!person) return ''
			if (person.first_name && person.last_name) {
				return `${person.first_name} ${person.last_name}`.trim()
			}
			return person.company_name || person.organization_name || person.name || ''
		}
		const supplierName = formatFullName(item.supplier) || item.supplier?.company_name || item.name || L.unknownSupplier || 'Unknown Supplier'
		const status = (item.status || 'pending').toLowerCase()

		// Get translated status
		const getStatusTranslation = (statusValue: string): string => {
			switch (statusValue) {
				case 'pending':
					return L.statusPending || 'Pending'
				case 'accepted':
					return L.statusAccepted || 'Accepted'
				case 'denied':
					return L.statusDenied || 'Denied'
				case 'blocked':
					return L.statusBlocked || 'Blocked'
				case 'rejected':
					return L.statusRejected || 'Rejected'
				default:
					return statusValue.charAt(0).toUpperCase() + statusValue.slice(1).toLowerCase()
			}
		}
		const displayStatus = getStatusTranslation(status)

		return (
			<View style={styles.card}>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View style={styles.avatarPlaceholder}>
						<MaterialIcons
							name="apartment"
							size={18}
							color="#2563eb"
						/>
					</View>
					<View style={{ marginLeft: 12, flex: 1 }}>
						<Text style={{ fontWeight: '700' }}>{supplierName}</Text>
						<Text style={{ color: '#6b7280', marginTop: 4 }}>{item.supplier?.description || L.supplier || 'Supplier'}</Text>
						{item.created_at && (
							<Text style={{ color: '#9ca3af', marginTop: 4, fontSize: 12 }}>{L.requested || 'Requested'} {new Date(item.created_at).toLocaleDateString()}</Text>
						)}
					</View>
					<View style={[styles.statusPill, { backgroundColor: getStatusBgColor(status) }]}>
						<Text style={[styles.statusText, { color: getStatusColor(status) }]}>{displayStatus}</Text>
					</View>
				</View>
			</View>
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
				<Text style={{ fontSize: 18, fontWeight: '700' }}>{L.linkedSuppliers}</Text>
				<TouchableOpacity
					onPress={onRequestLink}
					style={styles.addButton}
				>
					<Feather
						name="plus"
						size={18}
						color="#fff"
					/>
				</TouchableOpacity>
			</View>

			{loading ? (
				<View style={{ padding: 16, alignItems: 'center' }}>
					<Text style={{ color: '#6b7280' }}>{L.loading || 'Loading...'}</Text>
				</View>
			) : suppliers.length === 0 ? (
				<View style={{ padding: 24, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
					<MaterialIcons
						name="apartment"
						size={48}
						color="#cbd5e1"
					/>
					<Text style={{ color: '#9ca3af', marginTop: 12, fontSize: 16, fontWeight: '600' }}>{L.noLinkedSuppliers || 'No Linked Suppliers'}</Text>
					<Text style={{ color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>{L.noLinkedSuppliersDesc || 'Request a link with a supplier to start ordering'}</Text>
				</View>
			) : (
				<FlatList
					data={suppliers}
					keyExtractor={(i: any) => String(i.id)}
					contentContainerStyle={{ padding: 16 }}
					renderItem={renderItem}
					refreshing={false}
				/>
			)}
		</SafeAreaView>
	)
}
