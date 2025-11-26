import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import { styles } from '../../styles/supplier/SupplierProfileScreen.styles'
import { MaterialIcons, Feather } from '@expo/vector-icons'
import { getTranslations, type Language } from '../../translations'
import { User } from '../../api/user.http'
import { formatDate } from '../../utils/formatters'

export default function SupplierProfileScreen({
	language = 'en',
	onLanguageChange,
	onLogout,
	navigateTo,
	supplierName,
	user
}: {
	language?: 'en' | 'ru'
	onLanguageChange?: (l: 'en' | 'ru') => void
	onLogout?: () => void
	navigateTo?: (s: string) => void
	supplierName?: string
	user?: User
}) {
	const t = getTranslations('supplier', 'profile', language)

	const companyName = user?.company_name || supplierName || t.supplier || 'Supplier'

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => navigateTo && navigateTo('supplier-home')}
					style={{ position: 'absolute', left: 12, top: 12, padding: 8 }}
				>
					<Feather
						name="arrow-left"
						size={20}
						color="#111827"
					/>
				</TouchableOpacity>
				<Text style={{ fontSize: 18, fontWeight: '600' }}>{t.profile}</Text>
			</View>

			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ paddingBottom: 24 }}
			>
				<View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 16 }}>
					{user?.profile_image ? (
						<Image
							source={{ uri: `data:image/jpeg;base64,${user.profile_image}` }}
							style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: '#f3f4f6' }}
						/>
					) : (
						<View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }}>
							<MaterialIcons
								name="apartment"
								size={40}
								color="#2563eb"
							/>
						</View>
					)}
					<Text style={{ marginTop: 12, fontWeight: '700', fontSize: 16 }}>{user ? `${user.first_name} ${user.last_name}` : ''}</Text>
					{companyName && <Text style={{ color: '#6b7280', marginTop: 4 }}>{companyName}</Text>}
					{user?.role && <Text style={{ color: '#6b7280', marginTop: 4, textTransform: 'capitalize' }}>{user.role}</Text>}
				</View>

				<View style={{ padding: 16 }}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
						<Text style={{ fontWeight: '700', fontSize: 18 }}>{t.personalInformation || t.organizationInfo}</Text>
					</View>
					{user && (
						<View style={styles.infoCard}>
							<Text style={{ color: '#6b7280' }}>{t.name}</Text>
							<Text style={{ marginTop: 6, fontWeight: '600' }}>
								{user.first_name} {user.last_name}
							</Text>
						</View>
					)}
					{user?.email && (
						<View style={styles.infoCard}>
							<Text style={{ color: '#6b7280' }}>{t.email}</Text>
							<Text style={{ marginTop: 6, fontWeight: '600' }}>{user.email}</Text>
						</View>
					)}
					{companyName && (
						<View style={styles.infoCard}>
							<Text style={{ color: '#6b7280' }}>{t.companyName}</Text>
							<Text style={{ marginTop: 6, fontWeight: '600' }}>{companyName}</Text>
						</View>
					)}
					{user?.id && (
						<View style={styles.infoCard}>
							<Text style={{ color: '#6b7280' }}>{t.userId || 'User ID'}</Text>
							<Text style={{ marginTop: 6, fontWeight: '600' }}>{user.id}</Text>
						</View>
					)}
					{user?.role && (
						<View style={styles.infoCard}>
							<Text style={{ color: '#6b7280' }}>{t.role || 'Role'}</Text>
							<Text style={{ marginTop: 6, fontWeight: '600', textTransform: 'capitalize' }}>{user.role}</Text>
						</View>
					)}
					{user?.is_active !== undefined && (
						<View style={styles.infoCard}>
							<Text style={{ color: '#6b7280' }}>{t.accountStatus || 'Account Status'}</Text>
							<View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center' }}>
								<View
									style={{
										width: 8,
										height: 8,
										borderRadius: 4,
										backgroundColor: user.is_active ? '#22c55e' : '#ef4444',
										marginRight: 8
									}}
								/>
								<Text style={{ fontWeight: '600', color: user.is_active ? '#22c55e' : '#ef4444' }}>
									{user.is_active ? t.active || 'Active' : t.inactive || 'Inactive'}
								</Text>
							</View>
						</View>
					)}
					{user?.created_at && (
						<View style={styles.infoCard}>
							<Text style={{ color: '#6b7280' }}>{t.memberSince || 'Member Since'}</Text>
							<Text style={{ marginTop: 6, fontWeight: '600' }}>{formatDate(user.created_at, { dateStyle: 'long' })}</Text>
						</View>
					)}

					<Text style={{ fontWeight: '700', marginTop: 16, marginBottom: 8 }}>{t.settings}</Text>
					<View style={[styles.infoCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Feather
								name="globe"
								size={18}
								color="#9ca3af"
							/>
							<Text style={{ marginLeft: 8 }}>{t.language}</Text>
						</View>
						<TouchableOpacity
							onPress={() => onLanguageChange && onLanguageChange(language === 'en' ? 'ru' : 'en')}
							style={styles.langBtn}
						>
							<Text>{language === 'en' ? t.english : t.russian}</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						onPress={() => onLogout && onLogout()}
						style={styles.logoutBtn}
					>
						<Text style={{ color: '#ef4444', fontWeight: '700' }}>{t.logout}</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
