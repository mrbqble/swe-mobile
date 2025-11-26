import React, { useEffect, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { View } from 'react-native'
import SignInScreen from './modules/auth/SignInScreen'
import RegisterScreen from './modules/auth/RegisterScreen'
import ForgotPasswordScreen from './modules/auth/ForgotPasswordScreen'
import LanguagePickerScreen from './modules/auth/LanguagePickerScreen'
import ConsumerHomeScreen from './modules/consumer/ConsumerHomeScreen'
import SupplierHomeScreen from './modules/supplier/SupplierHomeScreen'
import SupplierCatalogScreen from './modules/supplier/SupplierCatalogScreen'
import SupplierOrdersScreen from './modules/supplier/SupplierOrdersScreen'
import SupplierProfileScreen from './modules/supplier/SupplierProfileScreen'
import SupplierOrderDetailScreen from './modules/supplier/SupplierOrderDetailScreen'
import SupplierComplaintsScreen from './modules/supplier/SupplierComplaintsScreen'
import SupplierComplaintDetailScreen from './modules/supplier/SupplierComplaintDetailScreen'
import ChatScreen from './modules/shared/ChatScreen'
import ConsumerCatalogScreen from './modules/consumer/ConsumerCatalogScreen'
import ConsumerProductDetailScreen from './modules/consumer/ConsumerProductDetailScreen'
import ConsumerCartScreen from './modules/consumer/ConsumerCartScreen'
import ConsumerOrdersScreen from './modules/consumer/ConsumerOrdersScreen'
import ConsumerSuppliersScreen from './modules/consumer/ConsumerSuppliersScreen'
import ConsumerOrderDetailScreen from './modules/consumer/ConsumerOrderDetailScreen'
import ConsumerRequestLinkScreen from './modules/consumer/ConsumerRequestLinkScreen'
import ConsumerProfileScreen from './modules/consumer/ConsumerProfileScreen'
import ConsumerEditProfileScreen from './modules/consumer/ConsumerEditProfileScreen'
import ConsumerNotificationsScreen from './modules/consumer/ConsumerNotificationsScreen'
import { linkedSuppliers, auth } from './api'
import ToastHost from './modules/shared/ToastHost'
import { getMe, User } from './api/user.http'
import { getAccessToken } from './api/token'
import { getLanguage, setLanguage as saveLanguage, clearLanguage } from './api/languageStorage'

type Language = 'en' | 'ru'
type UserRole = 'consumer' | 'supplier' | null

export default function App() {
	const [language, setLanguage] = useState<Language | null>(null)
	const [signedIn, setSignedIn] = useState(false)
	const [role, setRole] = useState<UserRole>(null)
	const [showRegister, setShowRegister] = useState(false)
	const [showForgotPassword, setShowForgotPassword] = useState(false)
	const [user, setUser] = useState<User>()
	const [initializing, setInitializing] = useState(true)

	// Check for existing token and language preference on app startup
	useEffect(() => {
		;(async () => {
			try {
				// Load language preference first
				const storedLanguage = await getLanguage()
				if (storedLanguage) {
					setLanguage(storedLanguage)
				}

				// Then check for existing token
				const token = await getAccessToken()
				if (token) {
					// Token exists, try to fetch user data
					const userData = await getMe()
					setUser(userData)
					// Determine role from user data
					// consumer -> consumer
					// supplier_owner, supplier_manager, supplier_sales -> supplier
					let userRole: UserRole = null
					if (userData.role === 'consumer') {
						userRole = 'consumer'
					} else if (userData.role === 'supplier_sales') {
						userRole = 'supplier'
					}
					if (userRole) {
						setRole(userRole)
						setSignedIn(true)
					}
				}
			} catch (error) {
				// Token invalid or expired, user needs to sign in
				console.log('No valid session found')
			} finally {
				setInitializing(false)
			}
		})()
	}, [])

	// Fetch user data when signed in
	useEffect(() => {
		if (signedIn) {
			getMe()
				.then(setUser)
				.catch((error) => {
					console.error('Failed to fetch user data:', error)
					// If getMe fails, user might need to sign in again
					setSignedIn(false)
					setRole(null)
				})
		}
	}, [signedIn])

	// Navigation history stacks for tracking previous screens
	const [consumerHistory, setConsumerHistory] = useState<string[]>(['consumer-home'])
	const [supplierHistory, setSupplierHistory] = useState<string[]>(['supplier-home'])

	// Simple screen navigation for the consumer UI
	const [consumerScreen, setConsumerScreen] = useState<string>('consumer-home')
	const [selectedProductId, setSelectedProductId] = useState<number | string | null>(null)
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
	const [selectedChatSessionId, setSelectedChatSessionId] = useState<string | null>(null)
	const [selectedMessageId, setSelectedMessageId] = useState<string | number | null>(null)
	const [orderDetailReturnTo, setOrderDetailReturnTo] = useState<string>('consumer-orders')
	const [homeScreenRefreshKey, setHomeScreenRefreshKey] = useState(0)
	// supplier navigation state (keep hooks at top-level to preserve hook order)
	const [supplierScreen, setSupplierScreen] = useState<string>('supplier-home')
	const [supplierSelectedOrderId, setSupplierSelectedOrderId] = useState<string | null>(null)
	const [supplierSelectedComplaintId, setSupplierSelectedComplaintId] = useState<string | null>(null)
	const [supplierChatReturnTo, setSupplierChatReturnTo] = useState<string>('supplier-order-detail')
	const [supplierComplaintReturnTo, setSupplierComplaintReturnTo] = useState<string>('supplier-orders')
	const [supplierOrdersInitialFilters, setSupplierOrdersInitialFilters] = useState<any>(null)
	const [supplierComplaintsInitialFilters, setSupplierComplaintsInitialFilters] = useState<any>(null)

	// Navigation helper functions with history tracking
	const navigateConsumerTo = (screen: string, addToHistory: boolean = true) => {
		if (addToHistory && consumerScreen !== screen) {
			setConsumerHistory((prev) => [...prev, consumerScreen])
		}
		setConsumerScreen(screen)
	}

	const navigateConsumerBack = () => {
		if (consumerHistory.length > 1) {
			const previousScreen = consumerHistory[consumerHistory.length - 1]
			setConsumerHistory((prev) => prev.slice(0, -1))
			setConsumerScreen(previousScreen)
			// Refresh home screen if going back to it
			if (previousScreen === 'consumer-home') {
				setHomeScreenRefreshKey((prev) => prev + 1)
			}
		} else {
			// Fallback to home if no history
			setConsumerScreen('consumer-home')
			setHomeScreenRefreshKey((prev) => prev + 1)
		}
	}

	const navigateSupplierTo = (screen: string, addToHistory: boolean = true, options?: { initialFilters?: any }) => {
		// Parse screen string for query parameters (e.g., "supplier-orders?filters=...")
		const [screenName] = screen.split('?')

		if (addToHistory && supplierScreen !== screenName) {
			setSupplierHistory((prev) => [...prev, supplierScreen])
		}
		setSupplierScreen(screenName)

		// Store initial filters for orders screen
		if (screenName === 'supplier-orders') {
			if (options?.initialFilters) {
				setSupplierOrdersInitialFilters(options.initialFilters)
			} else {
				// Clear filters when navigating from tab (no initial filters)
				setSupplierOrdersInitialFilters(null)
			}
		}

		// Store initial filters for complaints screen
		if (screenName === 'complaints') {
			if (options?.initialFilters) {
				setSupplierComplaintsInitialFilters(options.initialFilters)
			} else {
				// Clear filters when navigating from tab (no initial filters)
				setSupplierComplaintsInitialFilters(null)
			}
		}
	}

	const navigateSupplierBack = () => {
		if (supplierHistory.length > 1) {
			const previousScreen = supplierHistory[supplierHistory.length - 1]
			setSupplierHistory((prev) => prev.slice(0, -1))
			setSupplierScreen(previousScreen)
		} else {
			// Fallback to home if no history
			setSupplierScreen('supplier-home')
		}
	}

	if (initializing) {
		// Show loading state while checking for existing session
		return (
			<SafeAreaProvider>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<ToastHost />
				</View>
			</SafeAreaProvider>
		)
	}

	if (language === null) {
		return (
			<SafeAreaProvider>
				<View style={{ flex: 1 }}>
					<LanguagePickerScreen
						onLanguageSelect={async (selectedLanguage) => {
							// Save language to AsyncStorage
							await saveLanguage(selectedLanguage)
							setLanguage(selectedLanguage)
						}}
						language={(language || 'en') as 'en' | 'ru'}
					/>
					<ToastHost />
				</View>
			</SafeAreaProvider>
		)
	}

	if (!signedIn) {
		return (
			<SafeAreaProvider>
				<View style={{ flex: 1 }}>
					{!showRegister && !showForgotPassword && (
						<SignInScreen
							language={language}
							onSignIn={async (selectedRole: UserRole) => {
								// Fetch user data after sign in
								try {
									const userData = await getMe()
									setUser(userData)
								} catch (error) {
									console.error('Failed to fetch user data after sign in:', error)
								}
								setRole(selectedRole)
								setSignedIn(true)
								// reset navigation state for the selected role so we always land on the home screen
								if (selectedRole === 'supplier') {
									setSupplierHistory(['supplier-home'])
									setSupplierScreen('supplier-home')
								} else if (selectedRole === 'consumer') {
									setConsumerHistory(['consumer-home'])
									setConsumerScreen('consumer-home')
								}
							}}
							onRegister={() => setShowRegister(true)}
							onForgotPassword={() => setShowForgotPassword(true)}
						/>
					)}
					{showRegister && (
						<RegisterScreen
							language={language as 'en' | 'ru'}
							onRegistered={async (user) => {
								// After successful registration, fetch user data and sign in as consumer
								try {
									const userData = await getMe()
									setUser(userData)
								} catch (error) {
									console.error('Failed to fetch user data after registration:', error)
								}
								setRole('consumer')
								setSignedIn(true)
								setConsumerHistory(['consumer-home'])
								setConsumerScreen('consumer-home')
								setShowRegister(false)
							}}
							onCancel={() => setShowRegister(false)}
						/>
					)}
					{showForgotPassword && (
						<ForgotPasswordScreen
							language={language as 'en' | 'ru'}
							onBack={() => setShowForgotPassword(false)}
							onPasswordReset={() => {
								setShowForgotPassword(false)
								// User can now log in with new password
							}}
						/>
					)}
					<ToastHost />
				</View>
			</SafeAreaProvider>
		)
	}

	if (role === 'supplier') {
		// navigateSupplierTo is now defined above with history tracking
		// Use company_name for supplier staff, fallback to user's name if not available
		const supplierName = user ? `${user.first_name} ${user.last_name}`.trim() : undefined

		return (
			<SafeAreaProvider>
				<View style={{ flex: 1 }}>
					{supplierScreen === 'supplier-home' && (
						<SupplierHomeScreen
							language={language as 'en' | 'ru'}
							userName={supplierName}
							navigateTo={navigateSupplierTo}
						/>
					)}
					{supplierScreen === 'supplier-catalog' && (
						<SupplierCatalogScreen
							language={language as 'en' | 'ru'}
							navigateTo={navigateSupplierTo}
							supplierName={supplierName}
							user={user}
						/>
					)}
					{supplierScreen === 'supplier-orders' && (
						<SupplierOrdersScreen
							language={language as 'en' | 'ru'}
							navigateTo={navigateSupplierTo}
							onOrderSelect={(o: any) => {
								setSupplierSelectedOrderId(o?.id || null)
								navigateSupplierTo('supplier-order-detail')
							}}
							supplierName={supplierName}
							initialFilters={supplierOrdersInitialFilters}
						/>
					)}
					{supplierScreen === 'complaints' && (
						<SupplierComplaintsScreen
							supplierName={supplierName}
							onBack={navigateSupplierBack}
							language={language as 'en' | 'ru'}
							navigateTo={navigateSupplierTo}
							initialFilters={supplierComplaintsInitialFilters}
							onOpenComplaint={(id: string) => {
								setSupplierSelectedComplaintId(id)
								setSupplierComplaintReturnTo('complaints')
								navigateSupplierTo('complaint-detail')
							}}
						/>
					)}
					{supplierScreen === 'complaint-detail' && (
						<SupplierComplaintDetailScreen
							complaintId={supplierSelectedComplaintId}
							onBack={navigateSupplierBack}
							language={language as 'en' | 'ru'}
							onOpenChat={(orderId) => {
								setSupplierSelectedOrderId(orderId || null)
								setSupplierChatReturnTo('complaint-detail')
								navigateSupplierTo('chat')
							}}
						/>
					)}
					{supplierScreen === 'supplier-order-detail' && (
						<SupplierOrderDetailScreen
							orderId={supplierSelectedOrderId}
							onBack={navigateSupplierBack}
							onOpenComplaint={(complaintId: string) => {
								setSupplierSelectedComplaintId(complaintId)
								setSupplierComplaintReturnTo('supplier-order-detail')
								navigateSupplierTo('complaint-detail')
							}}
							onOpenChat={() => {
								setSupplierChatReturnTo('supplier-order-detail')
								navigateSupplierTo('chat')
							}}
							language={language as 'en' | 'ru'}
						/>
					)}
					{supplierScreen === 'chat' && (
						<ChatScreen
							orderId={supplierSelectedOrderId}
							onBack={navigateSupplierBack}
							role="supplier"
							language={language as 'en' | 'ru'}
						/>
					)}
					{supplierScreen === 'supplier-profile' && (
						<SupplierProfileScreen
							language={language as 'en' | 'ru'}
							onLanguageChange={async (l) => {
								// Save language to AsyncStorage
								await saveLanguage(l)
								setLanguage(l)
							}}
							onLogout={async () => {
								await (auth as any).logout()
								await clearLanguage()
								setLanguage(null)
								setUser(undefined)
								setSignedIn(false)
								setRole(null)
								setConsumerScreen('consumer-home')
							}}
							navigateTo={navigateSupplierTo}
							supplierName={supplierName}
							user={user}
						/>
					)}
					<ToastHost />
				</View>
			</SafeAreaProvider>
		)
	}

	// Default to consumer home with history tracking
	const navigateTo = (screen: string) => {
		// Basic mapping: consumer-home, catalog, consumer-orders, linked-suppliers, consumer-profile
		if (screen === 'catalog' || screen === 'consumer-catalog') {
			navigateConsumerTo('catalog')
			return
		}
		if (screen === 'consumer-home') {
			navigateConsumerTo('consumer-home')
			return
		}
		// handle other simple ids by setting screen directly with history
		navigateConsumerTo(screen)
	}

	const onProductSelect = (product: any) => {
		setSelectedProductId(product?.id ?? null)
		navigateConsumerTo('product-detail')
	}

	return (
		<SafeAreaProvider>
			<View style={{ flex: 1 }}>
				{consumerScreen === 'consumer-home' && (
					<ConsumerHomeScreen
						key={`home-${homeScreenRefreshKey}`} // Force re-render when navigating back to home
						language={language}
						navigateTo={navigateTo}
						userName={user ? `${user.first_name} ${user.last_name}` : undefined}
					/>
				)}
				{consumerScreen === 'catalog' && (
					<ConsumerCatalogScreen
						language={language as 'en' | 'ru'}
						navigateTo={navigateTo}
						onProductSelect={onProductSelect}
					/>
				)}
				{consumerScreen === 'product-detail' && (
					<ConsumerProductDetailScreen
						productId={selectedProductId}
						onBack={navigateConsumerBack}
						language={language as 'en' | 'ru'}
					/>
				)}
				{consumerScreen === 'consumer-orders' && (
					<ConsumerOrdersScreen
						onBack={navigateConsumerBack}
						onOpenOrder={(id) => {
							setSelectedOrderId(id)
							setOrderDetailReturnTo('consumer-orders')
							navigateConsumerTo('order-detail')
						}}
						language={language as 'en' | 'ru'}
					/>
				)}
				{consumerScreen === 'linked-suppliers' && (
					<ConsumerSuppliersScreen
						onBack={navigateConsumerBack}
						onRequestLink={() => navigateConsumerTo('request-link')}
						onNavigateToChat={(sessionId) => {
							setSelectedChatSessionId(sessionId)
							navigateConsumerTo('chat')
						}}
						language={language as 'en' | 'ru'}
					/>
				)}
				{consumerScreen === 'request-link' && (
					<ConsumerRequestLinkScreen
						onBack={navigateConsumerBack}
						onSubmit={async (supplierId) => {
							try {
								// call API adapter to create a link request
								await (linkedSuppliers as any).addLinkRequest(supplierId)
							} catch (err) {
								// handle errors appropriately
							}
							// after submit, navigate back using history
							navigateConsumerBack()
						}}
						language={language as 'en' | 'ru'}
					/>
				)}
				{consumerScreen === 'order-detail' && (
					<ConsumerOrderDetailScreen
						orderId={selectedOrderId}
						onBack={() => {
							setSelectedOrderId(null)
							navigateConsumerBack()
							// Refresh notifications when returning from order detail
							if (orderDetailReturnTo === 'notifications') {
								setHomeScreenRefreshKey((prev) => prev + 1)
							}
						}}
						onOpenChat={() => {
							setSelectedChatSessionId(null)
							navigateConsumerTo('chat')
						}}
						language={language as 'en' | 'ru'}
						userName={user ? `${user.first_name} ${user.last_name}` : undefined}
					/>
				)}
				{consumerScreen === 'cart' && (
					<ConsumerCartScreen
						onBack={navigateConsumerBack}
						navigateTo={navigateTo}
						language={language as 'en' | 'ru'}
					/>
				)}
				{consumerScreen === 'chat' && (
					<ChatScreen
						orderId={selectedOrderId}
						sessionId={selectedChatSessionId}
						messageId={selectedMessageId}
						onBack={() => {
							setSelectedChatSessionId(null)
							setSelectedMessageId(null)
							navigateConsumerBack()
						}}
						role="consumer"
						language={language as 'en' | 'ru'}
					/>
				)}
				{consumerScreen === 'consumer-profile' && (
					<ConsumerProfileScreen
						user={user}
						language={language as 'en' | 'ru'}
						setLanguage={async (l) => {
							// Save language to AsyncStorage
							await saveLanguage(l)
							setLanguage(l)
						}}
						onLogout={async () => {
							await clearLanguage()
							setLanguage(null)
							setSignedIn(false)
							setRole(null)
							setConsumerHistory(['consumer-home'])
							setConsumerScreen('consumer-home')
						}}
						onBack={navigateConsumerBack}
						onEdit={() => navigateConsumerTo('consumer-edit-profile')}
					/>
				)}
				{consumerScreen === 'consumer-edit-profile' && (
					<ConsumerEditProfileScreen
						user={user}
						language={language as 'en' | 'ru'}
						onBack={navigateConsumerBack}
						onSave={async (updatedUser) => {
							setUser(updatedUser)
							navigateConsumerBack()
						}}
					/>
				)}
				{consumerScreen === 'notifications' && (
					<ConsumerNotificationsScreen
						language={language as 'en' | 'ru'}
						onBack={() => {
							// Force re-render of home screen to refresh unread count
							setHomeScreenRefreshKey((prev) => prev + 1)
							navigateConsumerBack()
						}}
						onNotificationRead={() => {
							// Trigger refresh when notification is read
							setHomeScreenRefreshKey((prev) => prev + 1)
						}}
						onNavigateToOrder={(orderId) => {
							setSelectedOrderId(orderId)
							setOrderDetailReturnTo('notifications')
							navigateConsumerTo('order-detail')
						}}
						onNavigateToChat={(sessionId, messageId) => {
							setSelectedChatSessionId(sessionId)
							setSelectedMessageId(messageId || null)
							navigateConsumerTo('chat')
						}}
					/>
				)}
				<ToastHost />
			</View>
		</SafeAreaProvider>
	)
}
