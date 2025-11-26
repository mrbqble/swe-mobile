import React, { useEffect, useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useCart } from '../../hooks/useCart'
import { product, orders } from '../../api'
import { emitter } from '../../helpers/events'
import { toastShow } from '../../helpers/toast'
import { styles } from '../../styles/consumer/ConsumerCartScreen.styles'
import { getTranslations, type Language } from '../../translations'
import { formatPrice } from '../../utils/formatters'
import { DELIVERY_METHOD, type DeliveryMethod } from '../../constants'

export default function ConsumerCartScreen({
	onBack,
	navigateTo,
	language
}: {
	onBack: () => void
	navigateTo?: (screen: string) => void
	language?: 'en' | 'ru'
}) {
	const { items, totalQty, bySupplier: cartBySupplier, loading, load, add, remove, clear, update } = useCart()
	const t = getTranslations('consumer', 'cart', language || 'en')
	const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DELIVERY_METHOD.PICKUP)
	const [deliveryModalOpen, setDeliveryModalOpen] = useState(false)
	const [placeModalOpen, setPlaceModalOpen] = useState(false)
	const [placing, setPlacing] = useState(false)
	const [placingSupplierId, setPlacingSupplierId] = useState<string | number | null>(null)
	const [detailed, setDetailed] = useState<any[]>([])
	const [loadingDetails, setLoadingDetails] = useState(false)

	useEffect(() => {
		let mounted = true
		;(async () => {
			setLoadingDetails(true)
			try {
				// items are expected as { productId, qty, supplierId }
				const proms = items.map((it: any) => (product as any).fetchProduct(it.productId))
				const prods = await Promise.all(proms)
				if (mounted) {
					setDetailed(
						items.map((it: any, i: number) => ({
							...it,
							product: prods[i],
							// Ensure supplierId is set from product if not in cart item
							supplierId: it.supplierId || prods[i]?.supplierId || prods[i]?.supplier_id
						}))
					)
				}
			} catch (err) {
				if (mounted) setDetailed([])
			} finally {
				if (mounted) setLoadingDetails(false)
			}
		})()
		return () => {
			mounted = false
		}
	}, [items])

	// Group detailed items by supplier
	const itemsBySupplier = useMemo(() => {
		const grouped: Record<string, any[]> = {}
		detailed.forEach((item) => {
			const supplierId = String(item.supplierId || item.product?.supplierId || item.product?.supplier_id || 'unknown')
			if (!grouped[supplierId]) {
				grouped[supplierId] = []
			}
			grouped[supplierId].push(item)
		})
		return grouped
	}, [detailed])

	// Get supplier names for display
	const supplierNames = useMemo(() => {
		const names: Record<string, string> = {}
		Object.keys(itemsBySupplier).forEach((supplierId) => {
			const firstItem = itemsBySupplier[supplierId][0]
			names[supplierId] = firstItem?.product?.supplier || `Supplier ${supplierId}`
		})
		return names
	}, [itemsBySupplier])

	// Optimistic update helper: update local detailed immediately then call API
	const handleChangeQty = (productId: number | string, newQty: number, supplierId?: number | string) => {
		setDetailed((prev) => {
			if (newQty <= 0) return prev.filter((p) => String(p.productId) !== String(productId))
			return prev.map((p) => (String(p.productId) === String(productId) ? { ...p, qty: newQty } : p))
		})
		// call API to persist with supplierId
		update(productId, newQty, supplierId).catch(() => {
			// on error, reload from server to correct state
			load()
		})
	}

	if (loading)
		return (
			<SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<ActivityIndicator
					size="large"
					color="#2563eb"
				/>
			</SafeAreaView>
		)

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
				<Text style={{ fontSize: 18, fontWeight: '700' }}>{t.cart || 'Cart'}</Text>
				<Text style={{ color: '#6b7280' }}>
					{totalQty} {totalQty === 1 ? t.item || 'item' : t.items || 'items'}
				</Text>
			</View>

			{loadingDetails ? (
				<ActivityIndicator
					style={{ marginTop: 24 }}
					size="large"
					color="#2563eb"
				/>
			) : detailed.length === 0 ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
					<Feather
						name="shopping-cart"
						size={64}
						color="#9ca3af"
					/>
					<Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: '#374151' }}>{t.emptyCart || 'Your cart is empty'}</Text>
					<Text style={{ marginTop: 8, color: '#6b7280', textAlign: 'center' }}>
						{t.emptyCartDesc || 'Add items from the catalog to get started'}
					</Text>
					{navigateTo && (
						<TouchableOpacity
							onPress={() => navigateTo('catalog')}
							style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#2563eb', borderRadius: 8 }}
						>
							<Text style={{ color: '#fff', fontWeight: '600' }}>{t.browseCatalog || 'Browse Catalog'}</Text>
						</TouchableOpacity>
					)}
				</View>
			) : (
				<ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
					{Object.keys(itemsBySupplier).map((supplierId) => {
						const supplierItems = itemsBySupplier[supplierId]
						const supplierName = supplierNames[supplierId]
						const supplierTotal = supplierItems.reduce((sum, it) => sum + Number(it.product?.price || 0) * Number(it.qty || 0), 0)
						const supplierQty = supplierItems.reduce((sum, it) => sum + (it.qty || 0), 0)

						return (
							<View
								key={supplierId}
								style={{ marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 16 }}
							>
								{/* Supplier Header */}
								<View
									style={{
										paddingHorizontal: 16,
										paddingVertical: 12,
										backgroundColor: '#f9fafb',
										borderBottomWidth: 1,
										borderBottomColor: '#e5e7eb'
									}}
								>
									<Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>{supplierName}</Text>
									<Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
										{supplierQty} {supplierQty === 1 ? t.item || 'item' : t.items || 'items'}
									</Text>
								</View>

								{/* Items for this supplier */}
								{supplierItems.map((item: any) => (
									<View
										key={String(item.productId)}
										style={[styles.row, { marginHorizontal: 16, marginTop: 12 }]}
									>
										{item.product?.imageUrl ? (
											<Image
												source={{ uri: item.product.imageUrl }}
												style={styles.img}
											/>
										) : (
											<View style={styles.imgPlaceholder} />
										)}
										<View style={{ flex: 1, paddingLeft: 12 }}>
											<Text style={{ fontWeight: '600' }}>{item.product?.name ?? `${t.product || 'Product'} ${item.productId}`}</Text>
											<View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
												<TouchableOpacity
													onPress={() => handleChangeQty(item.productId, Math.max(0, item.qty - 1), item.supplierId)}
													style={{ marginRight: 12 }}
												>
													<Text style={{ color: '#ef4444', fontSize: 18 }}>-</Text>
												</TouchableOpacity>
												<Text style={{ marginHorizontal: 8 }}>{item.qty}</Text>
												<TouchableOpacity
													onPress={() => handleChangeQty(item.productId, item.qty + 1, item.supplierId)}
													style={{ marginLeft: 12 }}
												>
													<Text style={{ color: '#059669', fontSize: 18 }}>+</Text>
												</TouchableOpacity>
											</View>
										</View>
										<View style={{ alignItems: 'flex-end' }}>
											<Text style={{ color: '#2563eb', fontWeight: '700' }}>{item.product ? formatPrice(item.product.price) : ''}</Text>
											<Text style={{ color: '#6b7280', marginTop: 6 }}>
												{item.product ? `${t.subtotal || 'Subtotal'}: ${formatPrice(Number(item.product.price || 0) * Number(item.qty || 0))}` : ''}
											</Text>
										</View>
									</View>
								))}

								{/* Supplier Total and Checkout */}
								<View style={{ paddingHorizontal: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
									<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
										<Text style={{ color: '#6b7280', fontWeight: '600' }}>
											{t.total || 'Total'} ({supplierName}):
										</Text>
										<Text style={{ color: '#2563eb', fontWeight: '700', fontSize: 16 }}>{formatPrice(supplierTotal)}</Text>
									</View>
									<TouchableOpacity
										onPress={() => {
											setPlacingSupplierId(supplierId)
											setPlaceModalOpen(true)
										}}
										style={[styles.checkoutBtn, { width: '100%' }]}
										disabled={placing || supplierItems.length === 0}
									>
										<Text style={{ color: '#fff', fontWeight: '600' }}>
											{placing && placingSupplierId === supplierId
												? t.placing || 'Placing...'
												: (t.placeOrder || 'Place Order') + ` (${supplierName})`}
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						)
					})}
				</ScrollView>
			)}

			{detailed.length > 0 && (
				<View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', backgroundColor: '#fff' }}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
						<Text style={{ color: '#6b7280', fontWeight: '600' }}>
							{t.total || 'Total'} ({Object.keys(itemsBySupplier).length}{' '}
							{Object.keys(itemsBySupplier).length === 1 ? t.supplier || 'supplier' : t.suppliers || 'suppliers'}):
						</Text>
						<Text style={{ color: '#2563eb', fontWeight: '700', fontSize: 18 }}>
							{formatPrice(detailed.reduce((s, it) => s + Number(it.product?.price || 0) * Number(it.qty || 0), 0))}
						</Text>
					</View>
					<TouchableOpacity
						onPress={async () => {
							try {
								await clear()
								await load() // Reload cart after clearing
								toastShow(t.clear || 'Cleared', t.cartCleared || 'Cart has been cleared')
							} catch (err: any) {
								toastShow('Error', err?.message || t.clearFailed || 'Failed to clear cart')
							}
						}}
						style={[styles.clearBtn, { width: '100%' }]}
					>
						<Text style={{ color: '#fff', fontWeight: '600' }}>{t.clearAll || t.clear || 'Clear All'}</Text>
					</TouchableOpacity>
				</View>
			)}

			<Modal
				visible={deliveryModalOpen}
				transparent
				animationType="fade"
			>
				<SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
					<View style={{ margin: 24, backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
						<Text style={{ fontWeight: '700', marginBottom: 12 }}>{t.delivery || 'Delivery Method'}</Text>
						<TouchableOpacity
							onPress={() => {
								setDeliveryMethod(DELIVERY_METHOD.PICKUP)
								setDeliveryModalOpen(false)
							}}
							style={{ paddingVertical: 12 }}
						>
							<Text>{DELIVERY_METHOD.PICKUP}</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => {
								setDeliveryMethod(DELIVERY_METHOD.DELIVERY)
								setDeliveryModalOpen(false)
							}}
							style={{ paddingVertical: 12 }}
						>
							<Text>{DELIVERY_METHOD.DELIVERY}</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setDeliveryModalOpen(false)}
							style={{ paddingVertical: 12 }}
						>
							<Text style={{ color: '#6b7280' }}>{getTranslations('shared', 'common', language || 'en').cancel}</Text>
						</TouchableOpacity>
					</View>
				</SafeAreaView>
			</Modal>

			<Modal
				visible={placeModalOpen}
				transparent
				animationType="fade"
			>
				<SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
					<View style={{ margin: 24, backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
						<Text style={{ fontWeight: '700', marginBottom: 12 }}>{t.confirmOrder}</Text>
						{placingSupplierId &&
							itemsBySupplier[placingSupplierId] &&
							(() => {
								const supplierItems = itemsBySupplier[placingSupplierId]
								const supplierName = supplierNames[placingSupplierId]
								const itemCount = supplierItems.reduce((s, it) => s + it.qty, 0)
								return (
									<>
										<Text style={{ marginBottom: 8, fontWeight: '600', color: '#374151' }}>{supplierName}</Text>
										<Text style={{ marginBottom: 12, color: '#6b7280' }}>
											{t.confirmOrderMessage
												? t.confirmOrderMessage.replace('{count}', String(itemCount))
												: `Place order for ${itemCount} items from ${supplierName}?`}
										</Text>
									</>
								)
							})()}
						<View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
							<TouchableOpacity
								onPress={() => {
									setPlaceModalOpen(false)
									setPlacingSupplierId(null)
								}}
								style={{ padding: 12, marginRight: 8 }}
							>
								<Text style={{ color: '#6b7280' }}>{getTranslations('shared', 'common', language || 'en').cancel}</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={async () => {
									if (placing || !placingSupplierId) return
									setPlacing(true)
									try {
										const supplierItems = itemsBySupplier[placingSupplierId]
										const supplierName = supplierNames[placingSupplierId]

										// Validate that all items have product data
										if (supplierItems.length === 0 || supplierItems.some((d) => !d.product)) {
											throw new Error('Cannot place order: some items are missing product information')
										}

										// Get supplier_id from items (all should be from same supplier)
										const supplierId = supplierItems[0]?.supplierId || supplierItems[0]?.product?.supplierId || supplierItems[0]?.product?.supplier_id
										if (!supplierId) {
											throw new Error('Cannot place order: supplier information missing')
										}

										// Format items for order API: { productId, supplierId, qty }
										const orderItems = supplierItems.map((d) => ({
											productId: d.productId || d.product?.id,
											supplierId: supplierId,
											qty: d.qty || 1
										}))

										const total = supplierItems.reduce((s, it) => s + Number(it.product?.price || 0) * Number(it.qty || 0), 0)

										// Create order for this supplier
										await orders.placeOrderFromCart(orderItems, total)

										// Remove items for this supplier from cart
										for (const item of supplierItems) {
											await remove(item.productId)
										}

										setPlaceModalOpen(false)
										setPlacingSupplierId(null)
										toastShow(
											t.orderPlaced || 'Order Placed',
											`${t.orderPlacedMessage || 'Your order has been placed successfully.'} (${supplierName})`
										)

										// Emit event to refresh orders list
										emitter.emit('ordersChanged')

										// Reload cart to update UI
										await load()

										// Check if cart is now empty after a short delay to allow state update
										setTimeout(async () => {
											await load()
											// Use a ref or state check - for now just check if we removed all items
											// The cart will update via the useEffect hook
										}, 200)
									} catch (err: any) {
										console.error('Failed to place order:', err)
										const errorMsg = err?.body?.detail || err?.message || 'Failed to place order'
										toastShow('Error', errorMsg)
									} finally {
										setPlacing(false)
									}
								}}
								style={{ padding: 12, backgroundColor: '#2563eb', borderRadius: 8 }}
							>
								<Text style={{ color: '#fff' }}>
									{placing ? t.placing || 'Placing...' : getTranslations('shared', 'common', language || 'en').confirm || 'Confirm'}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</SafeAreaView>
			</Modal>
		</SafeAreaView>
	)
}
