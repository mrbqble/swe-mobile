import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { notifications } from '../../api'
import { getTranslations, type Language } from '../../translations'
import { formatDate } from '../../utils/formatters'

type Notification = {
	id: number | string
	recipient_id: number
	message: string
	type?: string
	entity_id?: number | null
	entity_type?: string | null
	metadata?: { message_id?: number | string; order_id?: number | string } | null
	is_read: boolean
	created_at: string
	createdAt?: string
}

export default function ConsumerNotificationsScreen({
	language = 'en',
	onBack,
	onNotificationRead,
	onNavigateToOrder,
	onNavigateToChat
}: {
	language?: Language
	onBack: () => void
	onNotificationRead?: () => void
	onNavigateToOrder?: (orderId: string) => void
	onNavigateToChat?: (sessionId: string, messageId?: string | number) => void
}) {
	const t = getTranslations('consumer', 'notifications', language)
	const commonT = getTranslations('shared', 'common', language)
	const [notificationsList, setNotificationsList] = useState<Notification[]>([])
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)
	const [page, setPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [activeSection, setActiveSection] = useState<'unread' | 'all'>('unread')

	const loadNotifications = useCallback(
		async (pageNum: number = 1, refresh: boolean = false) => {
			try {
				if (refresh) {
					setRefreshing(true)
				} else {
					setLoading(true)
				}
				// Filter by read status based on active section
				// For 'unread': fetch only unread notifications (is_read=false)
				// For 'all': fetch all notifications (is_read=undefined)
				const is_read = activeSection === 'unread' ? false : undefined
				const response = await notifications.listNotifications(pageNum, 20, is_read)
				if (pageNum === 1) {
					setNotificationsList(response.items)
				} else {
					setNotificationsList((prev) => [...prev, ...response.items])
				}
				setHasMore(response.page < response.pages)
			} catch (error) {
				console.error('Failed to load notifications:', error)
			} finally {
				setLoading(false)
				setRefreshing(false)
			}
		},
		[activeSection]
	)

	useEffect(() => {
		setPage(1)
		setHasMore(true)
		loadNotifications(1, false)
	}, [loadNotifications])

	const handleMarkAsRead = async (notificationId: number | string) => {
		try {
			await notifications.markNotificationRead(notificationId)
			// Update local state
			setNotificationsList((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))

			// Refresh notifications list
			await loadNotifications(1, false)
			// Notify parent to refresh unread count
			if (onNotificationRead) {
				onNotificationRead()
			}
		} catch (error) {
			console.error('Failed to mark notification as read:', error)
		}
	}

	const handleMarkAllAsRead = async () => {
		try {
			await notifications.markAllNotificationsRead()
			// Reload notifications to reflect changes
			await loadNotifications(1, false)
			// Notify parent to refresh unread count
			if (onNotificationRead) {
				onNotificationRead()
			}
		} catch (error) {
			console.error('Failed to mark all notifications as read:', error)
		}
	}

	const handleNotificationPress = async (notification: Notification) => {
		// Mark as read if not already read
		if (!notification.is_read) {
			await handleMarkAsRead(notification.id)
		}

		// Navigate based on entity type
		if (notification.entity_type && notification.entity_id) {
			if (notification.entity_type === 'order') {
				// Navigate to order details
				if (onNavigateToOrder) {
					onNavigateToOrder(String(notification.entity_id))
				}
			} else if (notification.entity_type === 'complaint') {
				// For complaint notifications, get order_id from metadata (avoiding extra API call)
				const orderId = notification.metadata?.order_id
				if (orderId && onNavigateToOrder) {
					onNavigateToOrder(String(orderId))
				}
			} else if (notification.entity_type === 'chat_session') {
				// Navigate to chat with optional message_id for scrolling
				if (onNavigateToChat) {
					const messageId = notification.metadata?.message_id
					onNavigateToChat(String(notification.entity_id), messageId ? (typeof messageId === 'string' ? messageId : String(messageId)) : undefined)
				}
			}
		}
	}

	const handleLoadMore = () => {
		if (!loading && hasMore) {
			const nextPage = page + 1
			setPage(nextPage)
			loadNotifications(nextPage, false)
		}
	}

	const renderItem = ({ item }: { item: Notification }) => (
		<TouchableOpacity
			style={{
				padding: 16,
				borderBottomWidth: 1,
				borderBottomColor: '#e5e7eb',
				backgroundColor: item.is_read ? '#fff' : '#f0f9ff'
			}}
			onPress={() => handleNotificationPress(item)}
		>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
				<View style={{ flex: 1, marginRight: 12 }}>
					{!item.is_read && (
						<View
							style={{
								width: 8,
								height: 8,
								borderRadius: 4,
								backgroundColor: '#2563eb',
								marginBottom: 4
							}}
						/>
					)}
					<Text style={{ fontSize: 14, fontWeight: item.is_read ? '400' : '600', color: '#111827' }}>{item.message}</Text>
					<Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{formatDate(item.created_at || item.createdAt || '')}</Text>
				</View>
				{!item.is_read && (
					<TouchableOpacity
						onPress={() => handleMarkAsRead(item.id)}
						style={{ padding: 4 }}
					>
						<Feather
							name="check-circle"
							size={20}
							color="#2563eb"
						/>
					</TouchableOpacity>
				)}
			</View>
		</TouchableOpacity>
	)

	// Calculate unread count from current list (only relevant when viewing "all" section)
	const unreadCount = activeSection === 'unread' ? notificationsList.length : notificationsList.filter((n) => !n.is_read).length
	const hasUnread = notificationsList.some((n) => !n.is_read)

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
				<TouchableOpacity
					onPress={onBack}
					style={{ marginRight: 12, padding: 4 }}
				>
					<Feather
						name="arrow-left"
						size={24}
						color="#111827"
					/>
				</TouchableOpacity>
				<Text style={{ fontSize: 20, fontWeight: '700', flex: 1 }}>{t.notifications || 'Notifications'}</Text>
				{hasUnread && (
					<TouchableOpacity
						onPress={handleMarkAllAsRead}
						style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#2563eb', borderRadius: 6 }}
					>
						<Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{t.markAllAsRead || 'Mark all as read'}</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* Section Tabs */}
			<View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
				<TouchableOpacity
					onPress={() => setActiveSection('unread')}
					style={{
						flex: 1,
						paddingVertical: 12,
						alignItems: 'center',
						borderBottomWidth: activeSection === 'unread' ? 2 : 0,
						borderBottomColor: activeSection === 'unread' ? '#2563eb' : 'transparent'
					}}
				>
					<Text
						style={{
							fontSize: 14,
							fontWeight: activeSection === 'unread' ? '600' : '400',
							color: activeSection === 'unread' ? '#2563eb' : '#6b7280'
						}}
					>
						{t.unreadNotifications || 'Unread'}
						{activeSection === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setActiveSection('all')}
					style={{
						flex: 1,
						paddingVertical: 12,
						alignItems: 'center',
						borderBottomWidth: activeSection === 'all' ? 2 : 0,
						borderBottomColor: activeSection === 'all' ? '#2563eb' : 'transparent'
					}}
				>
					<Text
						style={{
							fontSize: 14,
							fontWeight: activeSection === 'all' ? '600' : '400',
							color: activeSection === 'all' ? '#2563eb' : '#6b7280'
						}}
					>
						{t.allNotifications || 'All'}
					</Text>
				</TouchableOpacity>
			</View>

			{loading && notificationsList.length === 0 ? (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<ActivityIndicator
						size="large"
						color="#2563eb"
					/>
				</View>
			) : notificationsList.length === 0 ? (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
					<Feather
						name="bell-off"
						size={48}
						color="#9ca3af"
					/>
					<Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
						{activeSection === 'unread' ? t.noUnreadNotifications || 'No unread notifications' : t.noNotifications || 'No notifications'}
					</Text>
				</View>
			) : (
				<FlatList
					data={notificationsList}
					keyExtractor={(item) => String(item.id)}
					renderItem={renderItem}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={() => loadNotifications(1, true)}
						/>
					}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.5}
					ListFooterComponent={
						hasMore && !loading ? (
							<View style={{ padding: 16, alignItems: 'center' }}>
								<ActivityIndicator
									size="small"
									color="#2563eb"
								/>
							</View>
						) : null
					}
				/>
			)}
		</SafeAreaView>
	)
}
