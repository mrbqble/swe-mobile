import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { styles } from '../../styles/consumer/ConsumerProfileScreen.styles'
import { User } from '../../api/user.http'
import { user } from '../../api'
import { getTranslations, type Language } from '../../translations'
import { formatDate } from '../../utils/formatters'
import { toastShow } from '../../helpers/toast'

export default function ConsumerProfileScreen({
	user,
	language,
	setLanguage,
	onLogout,
	onBack,
	onEdit
}: {
	user: User | undefined
	language: 'en' | 'ru'
	setLanguage: (l: 'en' | 'ru') => void
	onLogout: () => void
	onBack?: () => void
	onEdit?: () => void
}) {
	const L = getTranslations('consumer', 'profile', language ?? 'en')
	const commonT = getTranslations('shared', 'common', language ?? 'en')
	const [deactivating, setDeactivating] = useState(false)

	const handleDeactivate = () => {
		Alert.alert(
			L.deactivateAccount || 'Deactivate Account',
			L.deactivateConfirm || 'Are you sure you want to deactivate your account? You can reactivate it by signing in again.',
			[
				{
					text: L.cancel || 'Cancel',
					style: 'cancel'
				},
				{
					text: L.deactivate || 'Deactivate',
					style: 'destructive',
					onPress: async () => {
						setDeactivating(true)
						try {
							await user.deactivateAccount()
							toastShow(commonT.success || 'Success', L.accountDeactivated || 'Account deactivated successfully')
							// Logout after deactivation
							setTimeout(() => {
								onLogout()
							}, 1000)
						} catch (error: any) {
							const msg = error?.message || error?.body?.detail || L.deactivateFailed || 'Failed to deactivate account'
							toastShow(commonT.error || 'Error', msg)
							setDeactivating(false)
						}
					}
				}
			]
		)
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={onBack}
					style={{ position: 'absolute', left: 12, top: 12, padding: 8 }}
				>
					<Feather name="arrow-left" size={20} color="#111827" />
				</TouchableOpacity>
				<Text style={{ fontSize: 18, fontWeight: '600' }}>{L.profile}</Text>
				{typeof onEdit === 'function' && (
					<TouchableOpacity
						onPress={onEdit}
						style={{ position: 'absolute', right: 12, top: 12, padding: 8 }}
					>
						<Feather name="edit-2" size={20} color="#2563eb" />
					</TouchableOpacity>
				)}
			</View>

			<ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
				<View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 16 }}>
					{user?.profile_image ? (
						<Image
							source={{ uri: `data:image/jpeg;base64,${user.profile_image}` }}
							style={[styles.avatar, { width: 88, height: 88, borderRadius: 44 }]}
						/>
					) : (
				<View style={styles.avatar}>
					<Text style={{ color: '#2563eb', fontSize: 28 }}>👤</Text>
						</View>
					)}
					<Text style={{ marginTop: 12, fontWeight: '700', fontSize: 16 }}>{user ? `${user.first_name} ${user.last_name}` : ''}</Text>
					{user?.organization_name && (
						<Text style={{ color: '#6b7280', marginTop: 4 }}>{user.organization_name}</Text>
					)}
				</View>

			<View style={{ padding: 16 }}>
				<Text style={{ fontWeight: '700', marginBottom: 8 }}>{L.personalInformation}</Text>
				<View style={styles.infoCard}>
					<Text style={{ color: '#6b7280' }}>{L.name}</Text>
					<Text style={{ marginTop: 6, fontWeight: '600' }}>{user ? `${user.first_name} ${user.last_name}` : ''}</Text>
				</View>
				{user?.organization_name && (
					<View style={styles.infoCard}>
					<Text style={{ color: '#6b7280' }}>{L.organization}</Text>
						<Text style={{ marginTop: 6, fontWeight: '600' }}>{user.organization_name}</Text>
					</View>
				)}
				<View style={styles.infoCard}>
					<Text style={{ color: '#6b7280' }}>{L.email}</Text>
					<Text style={{ marginTop: 6, fontWeight: '600' }}>{user?.email}</Text>
				</View>
				{user?.id && (
					<View style={styles.infoCard}>
						<Text style={{ color: '#6b7280' }}>{L.userId || 'User ID'}</Text>
						<Text style={{ marginTop: 6, fontWeight: '600' }}>{user.id}</Text>
					</View>
				)}
				{user?.role && (
					<View style={styles.infoCard}>
						<Text style={{ color: '#6b7280' }}>{L.role || 'Role'}</Text>
						<Text style={{ marginTop: 6, fontWeight: '600' }}>
							{user.role === 'consumer' ? (L.consumer || 'Consumer') : user.role}
						</Text>
					</View>
				)}
				{user?.is_active !== undefined && (
					<View style={styles.infoCard}>
						<Text style={{ color: '#6b7280' }}>{L.accountStatus || 'Account Status'}</Text>
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
								{user.is_active ? (L.active || 'Active') : (L.inactive || 'Inactive')}
							</Text>
						</View>
					</View>
				)}
				{user?.created_at && (
					<View style={styles.infoCard}>
						<Text style={{ color: '#6b7280' }}>{L.memberSince || 'Member Since'}</Text>
						<Text style={{ marginTop: 6, fontWeight: '600' }}>
							{formatDate(user.created_at, { dateStyle: 'long' })}
						</Text>
					</View>
				)}

				<Text style={{ fontWeight: '700', marginTop: 16, marginBottom: 8 }}>{L.settings}</Text>
				<View style={[styles.infoCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
					<View>
						<Text style={{ color: '#6b7280' }}>{L.languageLabel}</Text>
						<Text style={{ marginTop: 6, fontWeight: '600' }}>{language === 'en' ? L.english : L.russian}</Text>
					</View>
					<View>
						<TouchableOpacity
							onPress={() => setLanguage(language === 'en' ? 'ru' : 'en')}
							style={styles.langBtn}
						>
							<Text style={{ color: '#111827' }}>{language === 'en' ? L.english : L.russian}</Text>
						</TouchableOpacity>
					</View>
				</View>

				<TouchableOpacity
					onPress={handleDeactivate}
					disabled={deactivating}
					style={[styles.logoutBtn, { marginBottom: 12, backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}
				>
					{deactivating ? (
						<ActivityIndicator color="#ef4444" />
					) : (
						<Text style={{ color: '#ef4444', fontWeight: '700' }}>{L.deactivateAccount || 'Deactivate Account'}</Text>
					)}
				</TouchableOpacity>

				<TouchableOpacity
					onPress={onLogout}
					style={styles.logoutBtn}
				>
					<Text style={{ color: '#ef4444', fontWeight: '700' }}>{L.logout}</Text>
				</TouchableOpacity>
			</View>
			</ScrollView>
		</SafeAreaView>
	)
}
