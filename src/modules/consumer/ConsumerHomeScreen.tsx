import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FontAwesome5, MaterialIcons, Feather, Ionicons } from '@expo/vector-icons'

interface ConsumerHomeScreenProps {
	language?: 'en' | 'ru'
	navigateTo?: (screen: string) => void
	userName?: string
}

const translations = {
	en: {
		welcome: 'Welcome back!',
		quickActions: 'Quick Actions',
		requestLink: 'Request Link',
		viewCatalog: 'View Catalog',
		myOrders: 'My Orders',
		requestLinkDesc: 'Connect with new suppliers',
		viewCatalogDesc: 'Browse products',
		myOrdersDesc: 'Track your orders',
		home: 'Home',
		suppliers: 'Suppliers',
		catalog: 'Catalog',
		orders: 'Orders',
		profile: 'Profile'
	},
	ru: {
		welcome: 'Добро пожаловать!',
		quickActions: 'Быстрые действия',
		requestLink: 'Запросить связь',
		viewCatalog: 'Просмотр каталога',
		myOrders: 'Мои заказы',
		requestLinkDesc: 'Подключиться к новым поставщикам',
		viewCatalogDesc: 'Просмотр товаров',
		myOrdersDesc: 'Отследить заказы',
		home: 'Главная',
		suppliers: 'Поставщики',
		catalog: 'Каталог',
		orders: 'Заказы',
		profile: 'Профиль'
	}
}

// const userName = 'John Smith';

export default function ConsumerHomeScreen({ language = 'en', navigateTo, userName }: ConsumerHomeScreenProps) {
	const t = translations[language]

	const quickActions = [
		{
			id: 'request-link',
			icon: () => (
				<Feather
					name="link"
					size={24}
					color="#2563eb"
				/>
			), // icon as function
			title: t.requestLink,
			description: t.requestLinkDesc,
			color: '#e0e7ff',
			iconBg: '#eff6ff'
		},
		{
			id: 'catalog',
			icon: () => (
				<MaterialIcons
					name="shopping-bag"
					size={24}
					color="#059669"
				/>
			),
			title: t.viewCatalog,
			description: t.viewCatalogDesc,
			color: '#bbf7d0',
			iconBg: '#f0fdf4'
		},
		{
			id: 'consumer-orders',
			icon: () => (
				<Ionicons
					name="cube-outline"
					size={24}
					color="#a21caf"
				/>
			),
			title: t.myOrders,
			description: t.myOrdersDesc,
			color: '#f3e8ff',
			iconBg: '#faf5ff'
		}
	]

	const bottomTabs = [
		{
			id: 'consumer-home',
			label: t.home,
			icon: () => (
				<Feather
					name="home"
					size={22}
				/>
			)
		},
		{
			id: 'linked-suppliers',
			label: t.suppliers,
			icon: () => (
				<Feather
					name="link"
					size={22}
				/>
			)
		},
		{
			id: 'catalog',
			label: t.catalog,
			icon: () => (
				<MaterialIcons
					name="shopping-bag"
					size={22}
				/>
			)
		},
		{
			id: 'consumer-orders',
			label: t.orders,
			icon: () => (
				<Ionicons
					name="cube-outline"
					size={22}
				/>
			)
		},
		{
			id: 'consumer-profile',
			label: t.profile,
			icon: () => (
				<Feather
					name="user"
					size={22}
				/>
			)
		}
	]

	// For demo, set home as active
	const activeTab = 'consumer-home'

	return (
		<SafeAreaView
			style={styles.safeArea}
			edges={['left', 'right', 'bottom', 'top']}
		>
			{/* Header */}
			<View style={styles.header}>
				<View>
					<Text style={styles.headerTitle}>{t.welcome}</Text>
					<Text style={styles.headerSubtitle}>{userName}</Text>
				</View>
				<TouchableOpacity
					style={styles.searchButton}
					onPress={() => navigateTo && navigateTo('catalog')}
				>
					<Feather
						name="search"
						size={22}
						color="#fff"
					/>
				</TouchableOpacity>
			</View>
			{/* Content */}
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.quickActionsTitle}>{t.quickActions}</Text>
				{quickActions.map((action) => (
					<TouchableOpacity
						key={action.id}
						style={styles.actionButton}
						onPress={() => navigateTo && navigateTo(action.id)}
						activeOpacity={0.8}
					>
						<View style={[styles.actionIconCircle, { backgroundColor: action.iconBg }]}>{action.icon()}</View>
						<View style={styles.actionTextBlock}>
							<Text style={styles.actionTitle}>{action.title}</Text>
							<Text style={styles.actionDesc}>{action.description}</Text>
						</View>
					</TouchableOpacity>
				))}
			</ScrollView>
			{/* Bottom Navigation */}
			<View style={styles.bottomNav}>
				{bottomTabs.map((tab) => (
					<TouchableOpacity
						key={tab.id}
						style={styles.bottomNavItem}
						onPress={() => navigateTo && navigateTo(tab.id)}
					>
						{tab.icon()}
						<Text style={[styles.bottomNavLabel, activeTab === tab.id && { color: '#2563eb' }]}>{tab.label}</Text>
					</TouchableOpacity>
				))}
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff'
	},
	container: {
		flex: 1,
		backgroundColor: '#fff'
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingTop: 32,
		paddingBottom: 20,
		backgroundColor: '#2563eb'
		// Remove border radius for edge-to-edge fit
	},
	headerTitle: {
		color: '#fff',
		fontSize: 20,
		fontWeight: '700'
	},
	headerSubtitle: {
		color: '#dbeafe',
		fontSize: 14,
		marginTop: 2
	},
	searchButton: {
		backgroundColor: 'rgba(255,255,255,0.15)',
		borderRadius: 20,
		padding: 8
	},
	content: {
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 16
	},
	quickActionsTitle: {
		fontSize: 16,
		color: '#111827',
		fontWeight: '600',
		marginBottom: 16
	},
	actionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		padding: 16,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOpacity: 0.03,
		shadowRadius: 2,
		elevation: 1
	},
	actionIconCircle: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 16
	},
	actionTextBlock: {
		flex: 1
	},
	actionTitle: {
		fontSize: 16,
		color: '#111827',
		fontWeight: '600'
	},
	actionDesc: {
		fontSize: 13,
		color: '#6b7280',
		marginTop: 2
	},
	bottomNav: {
		flexDirection: 'row',
		borderTopWidth: 1,
		borderTopColor: '#e5e7eb',
		backgroundColor: '#fff',
		paddingVertical: 8,
		paddingBottom: 12,
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20
	},
	bottomNavItem: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	bottomNavLabel: {
		fontSize: 12,
		color: '#a1a1aa',
		marginTop: 2,
		fontWeight: '500'
	}
})
