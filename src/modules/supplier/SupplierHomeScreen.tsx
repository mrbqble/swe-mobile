import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { styles } from '../../styles/supplier/SupplierHomeScreen.styles'
import { orders, complaints } from '../../api'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { emitter } from '../../helpers/events'
import { getTranslations, type Language } from '../../translations'
import { ORDER_STATUS, COMPLAINT_STATUS } from '../../constants'

export default function SupplierHomeScreen({
	language = 'en',
	userName = 'TechPro Supply',
	navigateTo
}: {
	language?: Language
	userName?: string
	navigateTo?: (screen: string) => void
}) {
	const t = getTranslations('supplier', 'home', language)
	const [openOrdersCount, setOpenOrdersCount] = useState<number | null>(null)
	const [activeComplaintsCount, setActiveComplaintsCount] = useState<number | null>(null)

	useEffect(() => {
		let mounted = true
		const load = async () => {
			try {
				// Fetch open orders for supplier (backend filters by role automatically)
				let open = 0
				try {
					const res = await orders.listOrders({ page: 1, size: 50 })
					const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []
					open = items.filter((o: any) => {
						const status = String(o.status || '').toLowerCase()
						return status !== ORDER_STATUS.COMPLETED_LOWER && status !== ORDER_STATUS.REJECTED_LOWER
					}).length
				} catch (e) {
					console.error('Failed to fetch orders:', e)
				}

				// Fetch active complaints for supplier (backend filters by role automatically)
				let active = 0
				try {
					const res = await complaints.listComplaints(1, 100)
					active = Array.isArray(res.items)
						? res.items.filter((c: any) => {
								const status = String(c.status || '').toLowerCase()
								return status !== COMPLAINT_STATUS.RESOLVED.toLowerCase() && status !== COMPLAINT_STATUS.ESCALATED.toLowerCase()
							}).length
						: 0
				} catch (e) {
					console.error('Failed to fetch complaints:', e)
				}

				if (mounted) {
					setOpenOrdersCount(open)
					setActiveComplaintsCount(active)
				}
			} catch (e) {
				console.error('Failed to load home screen data:', e)
				if (mounted) {
					setOpenOrdersCount(0)
					setActiveComplaintsCount(0)
				}
			}
		}
		load()
		const off1 = emitter.on('ordersChanged', load)
		const off2 = emitter.on('complaintsChanged', load)
		return () => {
			mounted = false
			try {
				off1()
				off2()
			} catch (e) {}
		}
	}, [])

	const kpis = [
		{
			id: 'supplier-orders',
			title: t.openOrders,
			value: openOrdersCount ?? 0,
			unit: t.orders,
			icon: () => (
				<MaterialIcons
					name="inventory"
					size={24}
					color="#22c55e"
				/>
			),
			color: '#bbf7d0',
			iconBg: '#f0fdf4',
			screen: 'supplier-orders',
			initialFilters: {
				status: [ORDER_STATUS.PENDING.toLowerCase(), ORDER_STATUS.ACCEPTED.toLowerCase(), ORDER_STATUS.IN_PROGRESS_LOWER.toLowerCase()]
			}
		},
		{
			id: 'complaints',
			title: t.openComplaints,
			value: activeComplaintsCount ?? 0,
			unit: t.issues,
			icon: () => (
				<MaterialIcons
					name="report-problem"
					size={24}
					color="#f59e42"
				/>
			),
			color: '#fed7aa',
			iconBg: '#fff7ed',
			screen: 'complaints',
			initialFilters: { status: [COMPLAINT_STATUS.OPEN.toLowerCase()] }
		}
	]

	const bottomTabs = [
		{
			id: 'supplier-home',
			label: t.home,
			icon: () => (
				<Feather
					name="home"
					size={22}
				/>
			)
		},
		{
			id: 'supplier-catalog',
			label: t.catalog,
			icon: () => (
				<MaterialIcons
					name="inventory"
					size={22}
				/>
			)
		},
		{
			id: 'supplier-orders',
			label: t.allOrders,
			icon: () => (
				<Feather
					name="package"
					size={22}
				/>
			)
		},
		{
			id: 'complaints',
			label: t.allComplaints,
			icon: () => (
				<MaterialIcons
					name="report-problem"
					size={22}
				/>
			)
		},
		{
			id: 'supplier-profile',
			label: t.profile,
			icon: () => (
				<Feather
					name="user"
					size={22}
				/>
			)
		}
	]

	const activeTab = 'supplier-home'

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
					onPress={() => navigateTo && navigateTo('supplier-catalog')}
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
				{/* KPIs */}
				{kpis.map((kpi) => (
					<TouchableOpacity
						key={kpi.id}
						style={styles.kpiCard}
						onPress={() => {
							if (navigateTo) {
								// Pass initial filters if available (for orders and complaints screens)
								if ((kpi.screen === 'supplier-orders' || kpi.screen === 'complaints') && (kpi as any).initialFilters) {
									;(navigateTo as any)(kpi.screen, true, { initialFilters: (kpi as any).initialFilters })
								} else {
									navigateTo(kpi.screen)
								}
							}
						}}
						activeOpacity={0.8}
					>
						<View style={[styles.kpiIconCircle, { backgroundColor: kpi.iconBg }]}>{kpi.icon()}</View>
						<View style={styles.kpiTextBlock}>
							<Text style={styles.kpiTitle}>{kpi.title}</Text>
							<Text style={styles.kpiDesc}>
								{kpi.value} {kpi.unit}
							</Text>
						</View>
						<Text style={styles.kpiViewAll}>{t.viewAll}</Text>
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
