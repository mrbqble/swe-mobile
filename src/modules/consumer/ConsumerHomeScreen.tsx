import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FontAwesome5, MaterialIcons, Feather, Ionicons } from '@expo/vector-icons'
import { styles } from '../../styles/consumer/ConsumerHomeScreen.styles'
import { getTranslations, type Language } from '../../translations'

interface ConsumerHomeScreenProps {
	language?: 'en' | 'ru'
	navigateTo?: (screen: string) => void
	userName?: string
}

export default function ConsumerHomeScreen({ language = 'en', navigateTo, userName }: ConsumerHomeScreenProps) {
	const t = getTranslations('consumer', 'home', language)

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

