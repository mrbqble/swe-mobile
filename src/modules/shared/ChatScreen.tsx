import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { styles } from '../../styles/shared/ChatScreen.styles'
import { Feather } from '@expo/vector-icons'
import { useChat } from '../../hooks/useChat'
import { chat, orders } from '../../api'
import { Image, Modal } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { formatDate } from '../../utils/formatters'
import { getTranslations, type Language } from '../../translations'
import { getMimeType, getFileType } from '../../utils/fileUtils'
import type { ChatAttachment } from '../../api/chat.http'
import { useLinkedSuppliers } from '../../hooks/useLinkedSuppliers'
import { LINK_STATUS } from '../../constants'
import { toastShow } from '../../helpers/toast'

const MAX_ATTACHMENTS = 10 // Backend limit: maximum 10 attachments per message

export default function ChatScreen({
	orderId,
	sessionId: providedSessionId,
	messageId: providedMessageId,
	onBack,
	role = 'consumer',
	language = 'en'
}: {
	orderId?: string | null
	sessionId?: string | number | null
	messageId?: string | number | null
	onBack: () => void
	role?: 'consumer' | 'supplier'
	language?: Language
}) {
	const t = getTranslations('shared', 'chat', language)
	const [sessionId, setSessionId] = useState<number | string | null>(providedSessionId || null)
	const { messages, loading, refresh } = useChat(sessionId, role)
	const [text, setText] = useState('')
	const listRef = useRef<FlatList<any>>(null)
	const [orderInfo, setOrderInfo] = useState<any>(null)
	const [sessionLoading, setSessionLoading] = useState(false)
	const [sessionInfo, setSessionInfo] = useState<{ salesRepName?: string; consumerName?: string } | null>(null)
	const [hasAcceptedLink, setHasAcceptedLink] = useState<boolean | null>(null) // null = checking, true = has link, false = no link
	const { suppliers: linkedSuppliers, loading: linksLoading } = useLinkedSuppliers() // For consumer role: check accepted links
	const [hasScrolledToMessage, setHasScrolledToMessage] = useState(false) // Track if we've scrolled to the target message
	const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]) // Attachments waiting to be sent

	// Get or create chat session for the order, or use provided sessionId
	useEffect(() => {
		let mounted = true
		;(async () => {
			// If sessionId is provided directly, use it (assume link is already validated)
			if (providedSessionId) {
				setSessionId(providedSessionId)
				setHasAcceptedLink(true) // If session exists, link must be accepted
				// Load session info
				try {
					const sessions = await chat.listChatSessions(1, 100)
					const session = sessions.items.find((s: any) => s.id === Number(providedSessionId))
					if (session && mounted) {
						setSessionInfo({
							salesRepName: session.salesRepName,
							consumerName: session.consumerName
						})
					}
				} catch (error) {
					console.error('Failed to load session info:', error)
				}
				return
			}

			if (!orderId) {
				setSessionId(null)
				setHasAcceptedLink(null)
				return
			}
			setSessionLoading(true)
			setHasAcceptedLink(null) // Reset link check
			try {
				const o = await orders.fetchOrderById(orderId)
				if (mounted) setOrderInfo(o)

				// For consumer: check if there's an accepted link before allowing chat
				// For supplier: find existing session for this order
				if (role === 'consumer') {
					// If links are still loading, wait for them to finish (effect will re-run when loaded)
					if (linksLoading) {
						if (mounted) {
							setSessionLoading(false)
						}
						return
					}

					// Check if consumer has an accepted link with the order's supplier
					const orderSupplierId = o.supplier_id
					if (!orderSupplierId) {
						console.error('Order missing supplier_id')
						if (mounted) {
							setHasAcceptedLink(false)
							setSessionId(null)
						}
						return
					}

					// Check if there's an accepted link with this supplier
					const acceptedLink = linkedSuppliers.find((link: any) => {
						const linkSupplierId = link.supplier_id || link.supplierId || link.supplier?.id
						const status = String(link.status || '').toLowerCase()
						return linkSupplierId === orderSupplierId && status === LINK_STATUS.ACCEPTED.toLowerCase()
					})

					if (!acceptedLink) {
						// No accepted link - cannot chat
						if (mounted) {
							setHasAcceptedLink(false)
							setSessionId(null)
						}
						return
					}

					// Has accepted link - proceed to create/get session
					if (mounted) setHasAcceptedLink(true)
					// Backend will auto-assign sales rep based on order's supplier
					const session = await chat.getOrCreateChatSessionForOrder(orderId, null)
					if (mounted) {
						setSessionId(session.id)
						setSessionInfo({
							salesRepName: session.salesRepName,
							consumerName: session.consumerName
						})
					}
				} else {
					// Supplier: find existing session for this consumer-supplier pair
					// According to specs: one thread per Consumer-Supplier pair, reused for all orders
					try {
						const o = await orders.fetchOrderById(orderId)
						if (mounted) setOrderInfo(o)

						// Get all sessions for this sales rep (backend filters by supplier)
						const sessions = await chat.listChatSessions(1, 100)
						// Find session where consumer matches the order's consumer
						// The order has consumer_id, and we need to match it with session's consumer_id
						// According to specs: one thread per Consumer-Supplier pair, so we find the session
						// for the consumer who placed this order
						const existing = sessions.items.find((s: any) => {
							// Match by consumer_id - the session should have consumer_id that matches order's consumer
							// Backend returns consumer info in the response, so we can match by consumer_id
							return s.consumer_id === o.consumer_id || s.consumerId === o.consumer_id
						})

						if (existing && mounted) {
							setSessionId(existing.id)
							setSessionInfo({
								salesRepName: existing.salesRepName,
								consumerName: existing.consumerName
							})
						} else if (mounted) {
							// No session exists yet - consumer needs to start chat first
							setSessionId(null)
							setSessionInfo(null)
							setHasAcceptedLink(true) // Supplier can see chat even if session doesn't exist yet (consumer will create it)
						}
					} catch (e) {
						console.error('Failed to find chat session:', e)
						if (mounted) {
							setSessionId(null)
							setSessionInfo(null)
							setHasAcceptedLink(true) // Assume link exists for supplier (backend enforces)
						}
					}
				}
			} catch (e) {
				console.error('Failed to setup chat session:', e)
				if (mounted) {
					setSessionId(null)
					// Only set hasAcceptedLink to false if we're a consumer and haven't checked links yet
					if (role === 'consumer' && hasAcceptedLink === null) {
						setHasAcceptedLink(false)
					}
				}
			} finally {
				if (mounted) setSessionLoading(false)
			}
		})()
		return () => {
			mounted = false
		}
	}, [orderId, role, linkedSuppliers, linksLoading])

	// Scroll to end when new messages arrive (unless we're scrolling to a specific message)
	useEffect(() => {
		if (listRef.current && !providedMessageId) {
			setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120)
		}
	}, [messages.length, providedMessageId])

	// Scroll to specific message when messageId is provided
	useEffect(() => {
		if (providedMessageId && messages.length > 0 && listRef.current && !hasScrolledToMessage) {
			const messageIndex = messages.findIndex((msg: any) => String(msg.id) === String(providedMessageId))
			if (messageIndex >= 0) {
				setTimeout(() => {
					try {
						listRef.current?.scrollToIndex({
							index: messageIndex,
							animated: true,
							viewPosition: 0.5 // Center the message in view
						})
						setHasScrolledToMessage(true)
					} catch (error) {
						// If scroll fails, try scrolling to offset instead
						console.warn('ScrollToIndex failed, using scrollToOffset:', error)
						// Calculate offset from top
						const itemHeight = 80 // Approximate message height
						const offset = messageIndex * itemHeight
						listRef.current?.scrollToOffset({ offset, animated: true })
						setHasScrolledToMessage(true)
					}
				}, 500) // Wait for messages to render
			} else {
				// Message not found yet, might still be loading
				// Reset flag to try again when messages update
				if (messages.length > 0) {
					setHasScrolledToMessage(true) // Prevent infinite loop
				}
			}
		}
	}, [providedMessageId, messages, hasScrolledToMessage])

	const handleSend = async () => {
		if (!sessionId) return
		// Allow sending if there's text OR pending attachments
		if (text.trim().length === 0 && pendingAttachments.length === 0) return

		try {
			// Backend requires text to have min_length=1, so send space if no text provided but attachments exist
			const messageText = text.trim() || (pendingAttachments.length > 0 ? ' ' : '')
			await chat.sendMessage(sessionId, messageText, null, pendingAttachments.length > 0 ? pendingAttachments : undefined)
			setText('')
			setPendingAttachments([])
			await refresh()
		} catch (e: any) {
			console.error('Failed to send message:', e)
		}
	}

	// Preview modal state
	const [previewVisible, setPreviewVisible] = useState(false)
	const [previewUri, setPreviewUri] = useState<string | null>(null)
	const [uploading, setUploading] = useState(false)

	const pickImage = async () => {
		if (!sessionId) {
			return
		}
		try {
			const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
			if (!perm.granted) return
			const res = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				quality: 0.8,
				allowsEditing: false,
				allowsMultipleSelection: true, // Allow multiple image selection
				base64: true
			})

			// Handle cancellation
			if (res.canceled || !res.assets || res.assets.length === 0) {
				return
			}

			setUploading(true)
			try {
				// Check current attachment count
				const currentCount = pendingAttachments.length
				const remainingSlots = MAX_ATTACHMENTS - currentCount

				if (remainingSlots <= 0) {
					toastShow('Error', `Maximum ${MAX_ATTACHMENTS} attachments allowed per message`)
					setUploading(false)
					return
				}

				const newAttachments: ChatAttachment[] = []
				const assetsToProcess = res.assets.slice(0, remainingSlots) // Only process as many as we can fit

				// Show warning if some images were skipped
				if (res.assets.length > remainingSlots) {
					toastShow('Warning', `Only ${remainingSlots} of ${res.assets.length} images can be added (${MAX_ATTACHMENTS} attachment limit)`)
				}

				// Process each selected image
				for (const asset of assetsToProcess) {
					if (!asset?.uri) continue

					// Use base64 from ImagePicker (should always be available when base64: true is set)
					if (!asset.base64 || asset.base64.trim().length === 0) {
						console.error('Base64 data is empty for image:', asset.uri)
						toastShow('Error', 'Failed to process image. Please try again.')
						continue
					}
					const base64 = asset.base64

					const fileName = asset.fileName || asset.uri.split('/').pop() || 'image.jpg'
					const mimeType = getMimeType(fileName)
					const fileType = getFileType(fileName, mimeType)

					const attachment: ChatAttachment = {
						file_type: fileType,
						file_name: fileName,
						mime_type: mimeType,
						file_data: base64,
						file_size: asset.fileSize || null,
						previewUri: asset.uri // Store URI for preview
					}

					newAttachments.push(attachment)
				}

				// Add all processed attachments to pending attachments
				if (newAttachments.length > 0) {
					setPendingAttachments((prev) => [...prev, ...newAttachments])
				}
			} catch (e: any) {
				console.error('Failed to process images:', e)
			} finally {
				setUploading(false)
			}
		} catch (e: any) {
			console.error('Failed to pick images:', e)
			setUploading(false)
		}
	}

	const renderItem = ({ item }: any) =>
		item.system ? (
			<View style={{ alignItems: 'center', marginVertical: 8 }}>
				<View
					style={[
						styles.systemBlock,
						item.severity === 'error'
							? styles.systemError
							: item.severity === 'warning'
								? styles.systemWarning
								: item.severity === 'success'
									? styles.systemSuccess
									: styles.systemInfo
					]}
				>
					<Text style={styles.systemText}>{item.text}</Text>
				</View>
			</View>
		) : (
			<View style={[styles.msgRow, item.from === role ? styles.msgRowRight : styles.msgRowLeft]}>
				<View style={[styles.msgBubble, item.from === role ? styles.msgBubbleRight : styles.msgBubbleLeft]}>
					{/* sender header: avatar + label */}
					<View style={styles.senderRow}>
						<View style={[styles.avatar, item.from === role ? styles.avatarYou : styles.avatarOther]}>
							<Text style={[styles.avatarText, item.from === role ? styles.avatarTextYou : styles.avatarTextOther]}>
								{item.from === role
									? t.you?.charAt(0).toUpperCase() || 'Y'
									: item.senderName
										? item.senderName.charAt(0).toUpperCase()
										: item.from === 'supplier'
											? 'S'
											: 'C'}
							</Text>
						</View>
						<Text style={[styles.senderLabel, item.from === role ? styles.senderLabelYou : styles.senderLabelOther]}>
							{item.from === role ? t.you : item.senderName || (item.from === 'supplier' ? t.supplier : t.consumer)}
						</Text>
					</View>
					{item.text ? <Text style={item.from === role ? styles.msgTextRight : styles.msgTextLeft}>{item.text}</Text> : null}
					{/* attachments */}
					{item.attachments && item.attachments.length > 0 ? (
						<View style={{ marginTop: 8 }}>
							{item.attachments.map((a: any, idx: number) => {
								const src = (a.previewUri ||
									a.url ||
									(a.file_data ? `data:${a.mime_type || 'application/octet-stream'};base64,${a.file_data}` : null)) as string
								const isImage = a.file_type === 'image' || (src && (src.match(/\.(jpg|jpeg|png|gif|webp)$/i) || src.startsWith('data:image/')))
								const isAudio = a.file_type === 'audio' || (src && src.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) || src.startsWith('data:audio/')

								if (!src) return null

								if (isImage) {
									return (
										<TouchableOpacity
											key={`att_${a.id || idx}_${a.file_name}`}
											onPress={() => {
												setPreviewUri(src)
												setPreviewVisible(true)
											}}
											style={{ marginVertical: 4 }}
										>
											<Image
												source={{ uri: src }}
												style={{ width: 160, height: 120, borderRadius: 6 }}
											/>
											{a.file_name && (
												<Text
													style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}
													numberOfLines={1}
												>
													{a.file_name}
												</Text>
											)}
										</TouchableOpacity>
									)
								} else if (isAudio) {
									return (
										<View
											key={`att_${a.id || idx}_${a.file_name}`}
											style={{
												marginVertical: 4,
												padding: 8,
												backgroundColor: '#f3f4f6',
												borderRadius: 6,
												flexDirection: 'row',
												alignItems: 'center'
											}}
										>
											<Feather
												name="music"
												size={20}
												color="#2563eb"
											/>
											<View style={{ marginLeft: 8, flex: 1 }}>
												<Text
													style={{ fontSize: 12, fontWeight: '600' }}
													numberOfLines={1}
												>
													{a.file_name || 'Audio file'}
												</Text>
												{a.file_size && <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{(a.file_size / 1024).toFixed(1)} KB</Text>}
											</View>
										</View>
									)
								} else {
									return (
										<TouchableOpacity
											key={`att_${a.id || idx}_${a.file_name}`}
											style={{
												marginVertical: 4,
												padding: 8,
												backgroundColor: '#f3f4f6',
												borderRadius: 6,
												flexDirection: 'row',
												alignItems: 'center'
											}}
										>
											<Feather
												name="file"
												size={20}
												color="#2563eb"
											/>
											<View style={{ marginLeft: 8, flex: 1 }}>
												<Text
													style={{ fontSize: 12, fontWeight: '600', color: '#2563eb' }}
													numberOfLines={1}
												>
													{a.file_name || 'File'}
												</Text>
												{a.file_size && <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{(a.file_size / 1024).toFixed(1)} KB</Text>}
											</View>
										</TouchableOpacity>
									)
								}
							})}
						</View>
					) : null}
					<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<Text style={styles.msgTs}>{formatRelativeTime(item.ts, language)}</Text>
						{item.from === role ? (
							<Text style={{ fontSize: 11, color: item.read ? '#059669' : '#6b7280', marginLeft: 8 }}>
								{item.read ? t.read : item.delivered ? t.delivered : ''}
							</Text>
						) : null}
					</View>
				</View>
			</View>
		)

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
				<View style={{ flex: 1, alignItems: 'center' }}>
					<Text style={{ fontWeight: '700' }}>
						{role === 'consumer'
							? sessionInfo?.salesRepName || t.salesRep || 'Sales Rep'
							: sessionInfo?.consumerName || orderInfo?.customer || orderInfo?.supplier || t.chat}
					</Text>
					<Text style={{ fontSize: 12, color: '#6b7280' }}>{orderInfo ? `${t.orderPrefix}${orderInfo.orderNumber}` : ''}</Text>
				</View>
				<View style={{ width: 36 }} />
			</View>

			{sessionLoading ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<Text style={{ color: '#6b7280' }}>{t.loadingChat}</Text>
				</View>
			) : hasAcceptedLink === false && role === 'consumer' ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
					<Feather
						name="link"
						size={48}
						color="#cbd5e1"
					/>
					<Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 12, fontSize: 16, fontWeight: '600' }}>
						{t.noAcceptedLinkTitle || 'No Accepted Link'}
					</Text>
					<Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
						{t.noAcceptedLinkMessage ||
							'You need an accepted link with this supplier before you can chat. Request a link from the supplier to start messaging.'}
					</Text>
				</View>
			) : !sessionId ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
					<Text style={{ color: '#6b7280', textAlign: 'center' }}>{role === 'supplier' ? t.noSessionSupplier : t.noSessionConsumer}</Text>
				</View>
			) : (
				<FlatList
					ref={listRef}
					data={messages}
					keyExtractor={(i) => String(i.id)}
					contentContainerStyle={{ padding: 12 }}
					renderItem={renderItem}
					onScrollToIndexFailed={(info) => {
						// Handle scroll failure gracefully
						console.warn('Failed to scroll to index:', info)
						// Fallback: scroll to end
						setTimeout(() => {
							listRef.current?.scrollToEnd({ animated: true })
						}, 100)
					}}
					ListEmptyComponent={() => (
						<View style={{ padding: 24, alignItems: 'center' }}>
							<Text style={{ color: '#9ca3af' }}>{t.noMessages}</Text>
						</View>
					)}
				/>
			)}

			{sessionId && (
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
					keyboardVerticalOffset={80}
				>
					{/* Pending attachments preview */}
					{pendingAttachments.length > 0 && (
						<View
							style={{
								padding: 12,
								backgroundColor: '#f9fafb',
								borderTopWidth: 1,
								borderTopColor: '#e5e7eb',
								flexDirection: 'row',
								flexWrap: 'wrap',
								gap: 8
							}}
						>
							{pendingAttachments.map((att, index) => (
								<View
									key={index}
									style={{ position: 'relative', marginRight: 8, marginBottom: 8 }}
								>
									{att.previewUri && (
										<Image
											source={{ uri: att.previewUri }}
											style={{ width: 60, height: 60, borderRadius: 6 }}
										/>
									)}
									<TouchableOpacity
										onPress={() => {
											setPendingAttachments((prev) => prev.filter((_, i) => i !== index))
										}}
										style={{
											position: 'absolute',
											top: -4,
											right: -4,
											backgroundColor: '#ef4444',
											borderRadius: 10,
											width: 20,
											height: 20,
											justifyContent: 'center',
											alignItems: 'center'
										}}
									>
										<Feather
											name="x"
											size={12}
											color="#fff"
										/>
									</TouchableOpacity>
									{att.file_name && (
										<Text
											style={{ fontSize: 10, color: '#6b7280', marginTop: 2, maxWidth: 60 }}
											numberOfLines={1}
										>
											{att.file_name}
										</Text>
									)}
								</View>
							))}
						</View>
					)}
					<View style={styles.composer}>
						<TouchableOpacity
							onPress={pickImage}
							style={{ padding: 8 }}
						>
							<Feather
								name="paperclip"
								size={20}
								color="#9ca3af"
							/>
						</TouchableOpacity>
						<TextInput
							value={text}
							onChangeText={setText}
							placeholder={t.typeMessage}
							style={styles.input}
						/>
						<TouchableOpacity
							onPress={handleSend}
							disabled={!text.trim() && pendingAttachments.length === 0}
							style={[styles.sendBtn, !text.trim() && pendingAttachments.length === 0 && { opacity: 0.5 }]}
						>
							<Feather
								name="send"
								size={18}
								color="#fff"
							/>
						</TouchableOpacity>
					</View>
				</KeyboardAvoidingView>
			)}

			{/* Preview modal for tapped images */}
			<Modal
				visible={previewVisible}
				transparent
				animationType="fade"
			>
				<SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
					<TouchableOpacity
						onPress={() => setPreviewVisible(false)}
						style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}
					>
						<Feather
							name="x"
							size={28}
							color="#fff"
						/>
					</TouchableOpacity>
					{previewUri ? (
						<Image
							source={{ uri: previewUri }}
							style={{ width: '92%', height: '72%', resizeMode: 'contain' }}
						/>
					) : null}
				</SafeAreaView>
			</Modal>
		</SafeAreaView>
	)
}

function formatRelativeTime(iso?: string, language: Language = 'en') {
	if (!iso) return ''
	const t = getTranslations('shared', 'chat', language)
	try {
		const then = new Date(iso).getTime()
		const now = Date.now()
		const diff = Math.floor((now - then) / 1000)
		if (diff < 5) return t.justNow
		if (diff < 60) return `${diff}s ${t.ago}`
		const mins = Math.floor(diff / 60)
		if (mins < 60) return `${mins}m ${t.ago}`
		const hrs = Math.floor(mins / 60)
		if (hrs < 24) return `${hrs}h ${t.ago}`
		const days = Math.floor(hrs / 24)
		if (days < 7) return `${days}d ${t.ago}`
		const weeks = Math.floor(days / 7)
		if (weeks < 5) return `${weeks}w ${t.ago}`
		const months = Math.floor(days / 30)
		if (months < 12) return `${months}mo ${t.ago}`
		const years = Math.floor(days / 365)
		return `${years}y ${t.ago}`
	} catch (e) {
		return formatDate(iso)
	}
}
