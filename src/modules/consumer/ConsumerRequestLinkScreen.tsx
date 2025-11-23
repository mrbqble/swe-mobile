import React, { useState, useEffect, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native'
import { styles } from '../../styles/consumer/ConsumerRequestLinkScreen.styles'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { catalog } from '../../api'
import { getTranslations, type Language } from '../../translations'
import { linkedSuppliers } from '../../api'
import { emitter } from '../../helpers/events'
import { toastShow } from '../../helpers/toast'

export default function ConsumerRequestLinkScreen({
	onBack,
	onSubmit,
	language
}: {
	onBack: () => void
	onSubmit?: (supplierId: string) => void
	language?: 'en' | 'ru'
}) {
	const [query, setQuery] = useState('')
	const [selected, setSelected] = useState<string | null>(null)
	const [allSuppliers, setAllSuppliers] = useState<any[]>([])
	const [linkedSupplierIds, setLinkedSupplierIds] = useState<Set<string | number>>(new Set())
	const [loading, setLoading] = useState(true)
	const L = getTranslations('consumer', 'requestLink', language ?? 'en')

	// Fetch all suppliers and linked suppliers on mount
	useEffect(() => {
		let mounted = true
		;(async () => {
			try {
				setLoading(true)
				// Fetch all suppliers and linked suppliers in parallel
				const [suppliersRes, linkedRes] = await Promise.all([
					catalog.listSuppliers({ page: 1, size: 100 }),
					linkedSuppliers.fetchLinkedSuppliers().catch(() => []) // Gracefully handle errors
				])

				if (mounted) {
					setAllSuppliers(suppliersRes.items || [])
					// Extract supplier IDs that are already linked (accepted or pending)
					const linkedIds = new Set<string | number>()
					;(linkedRes || []).forEach((link: any) => {
						const status = (link.status || '').toLowerCase()
						// Filter out suppliers with 'accepted' or 'pending' status
						if (status === 'accepted' || status === 'pending') {
							const supplierId = link.supplier_id || link.supplier?.id
							if (supplierId) {
								linkedIds.add(String(supplierId))
							}
						}
					})
					setLinkedSupplierIds(linkedIds)
				}
			} catch (err) {
				console.error('Failed to fetch suppliers:', err)
				if (mounted) {
					setAllSuppliers([])
					setLinkedSupplierIds(new Set())
				}
			} finally {
				if (mounted) {
					setLoading(false)
				}
			}
		})()

		// Subscribe to link changes to update the list
		const unsub = emitter.on('linkedSuppliersChanged', async () => {
			try {
				const linkedRes = await linkedSuppliers.fetchLinkedSuppliers()
				const linkedIds = new Set<string | number>()
				;(linkedRes || []).forEach((link: any) => {
					const status = (link.status || '').toLowerCase()
					if (status === 'accepted' || status === 'pending') {
						const supplierId = link.supplier_id || link.supplier?.id
						if (supplierId) {
							linkedIds.add(String(supplierId))
						}
					}
				})
				setLinkedSupplierIds(linkedIds)
			} catch (e) {
				console.error('Failed to refresh linked suppliers:', e)
			}
		})

		return () => {
			mounted = false
			try {
				unsub()
			} catch (e) {
				// ignore
			}
		}
	}, [])

	// Filter suppliers based on search query and exclude already linked suppliers
	const filteredResults = useMemo(() => {
		// First filter out already linked suppliers
		const availableSuppliers = allSuppliers.filter((supplier: any) => {
			const supplierId = String(supplier.id)
			return !linkedSupplierIds.has(supplierId)
		})

		// Then filter by search query if provided
		if (!query.trim()) {
			return availableSuppliers
		}
		const searchLower = query.toLowerCase().trim()
		return availableSuppliers.filter((supplier: any) => {
			const name = (supplier.company_name || supplier.name || '').toLowerCase()
			const description = (supplier.description || '').toLowerCase()
			return name.includes(searchLower) || description.includes(searchLower)
		})
	}, [allSuppliers, query, linkedSupplierIds])

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
				<Text style={{ fontSize: 18, fontWeight: '700' }}>{L.requestLink}</Text>
				<View style={{ width: 36 }} />
			</View>

			<View style={{ padding: 16 }}>
				<Text style={{ marginBottom: 8, color: '#6b7280' }}>{L.searchSuppliers}</Text>
				<View style={styles.searchBox}>
					<Feather
						name="search"
						size={18}
						color="#9CA3AF"
						style={{ marginLeft: 8 }}
					/>
					<TextInput
						placeholder={L.placeholder}
						value={query}
						onChangeText={setQuery}
						style={styles.searchInput}
					/>
				</View>
			</View>

			{loading ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<Text style={{ color: '#6b7280' }}>{L.loading || 'Loading...'}</Text>
				</View>
			) : filteredResults.length === 0 ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<MaterialIcons
						name="check-circle"
						size={48}
						color="#cbd5e1"
					/>
					<Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 16, fontWeight: '600' }}>
						{query.trim()
							? (L.noSuppliersFound || 'No suppliers found')
							: (L.allSuppliersLinked || 'All suppliers are already linked')
						}
					</Text>
					<Text style={{ color: '#9CA3AF', marginTop: 8, textAlign: 'center', paddingHorizontal: 32 }}>
						{query.trim()
							? (L.tryDifferentSearch || 'Try a different search term')
							: (L.allSuppliersLinkedDesc || 'You have already linked with all available suppliers or have pending requests with them.')
						}
					</Text>
				</View>
			) : (
				<FlatList
					data={filteredResults}
					keyExtractor={(i: any) => String(i.id)}
					contentContainerStyle={{ padding: 16 }}
					renderItem={({ item }: any) => (
						<TouchableOpacity
							onPress={() => setSelected(String(item.id))}
							style={[styles.card, selected === String(item.id) ? { borderColor: '#2563eb', borderWidth: 1 } : {}]}
						>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<View style={styles.avatar}>
									<MaterialIcons
										name="apartment"
										size={18}
										color="#2563eb"
									/>
								</View>
								<View style={{ marginLeft: 12, flex: 1 }}>
									<Text style={{ fontWeight: '700' }}>{item.company_name || item.name || L.supplier || 'Supplier'}</Text>
									<Text style={{ color: '#6b7280', marginTop: 4 }}>{item.description || ''}</Text>
								</View>
								{item.rating && <Text style={{ color: '#f59e0b' }}>★ {item.rating}</Text>}
							</View>
						</TouchableOpacity>
					)}
				/>
			)}

			<View style={styles.footer}>
				<TouchableOpacity
					disabled={!selected}
					onPress={async () => {
						if (!selected) return
						try {
							// Call backend to create link request
							await linkedSuppliers.addLinkRequest(selected)
							// optional callback
							if (onSubmit) await onSubmit(selected)
							// trigger refresh for supplier/consumer lists
							emitter.emit('linkRequestsChanged')
							emitter.emit('linkedSuppliersChanged')
							const commonT = getTranslations('shared', 'common', language ?? 'en')
							toastShow(L.submitRequest || 'Request Submitted', L.requestSubmittedMessage || 'The supplier will review your request.')
							// Navigate back after successful submission
							onBack()
						} catch (err: any) {
							console.error('Failed to submit link request:', err)
							const commonT = getTranslations('shared', 'common', language ?? 'en')
							const errorMsg = err?.body?.detail || err?.message || L.submitFailed || 'Could not submit link request'
							toastShow(commonT.error || 'Error', errorMsg)
						}
					}}
					style={[styles.submitBtn, !selected ? { backgroundColor: '#e5e7eb' } : {}]}
				>
					<Text style={{ color: selected ? '#fff' : '#9ca3af', fontWeight: '700' }}>{L.submitRequest}</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	)
}
