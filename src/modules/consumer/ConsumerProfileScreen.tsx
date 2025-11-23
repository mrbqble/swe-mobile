import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { User } from '../../api/user.http'

export default function ConsumerProfileScreen({
	user,
	language,
	setLanguage,
	onLogout,
	onBack
}: {
	user: User
	language: 'en' | 'ru'
	setLanguage: (l: 'en' | 'ru') => void
	onLogout: () => void
	onBack?: () => void
}) {
	const t = {
		en: {
			profile: 'Profile',
			personalInformation: 'Personal Information',
			name: 'Name',
			organization: 'Organization',
			email: 'Email',
			settings: 'Settings',
			languageLabel: 'Language',
			logout: 'Logout',
			english: 'English',
			russian: 'Русский'
		},
		ru: {
			profile: 'Профиль',
			personalInformation: 'Личная информация',
			name: 'Имя',
			organization: 'Организация',
			email: 'Эл. почта',
			settings: 'Настройки',
			languageLabel: 'Язык',
			logout: 'Выйти',
			english: 'English',
			russian: 'Русский'
		}
	} as any
	const L = t[language ?? 'en']

	console.log(user)

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={onBack}
					style={{ position: 'absolute', left: 12, top: 12, padding: 8 }}
				>
					<Text style={{ fontSize: 18 }}>←</Text>
				</TouchableOpacity>
				<Text style={{ fontSize: 18, fontWeight: '600' }}>{L.profile}</Text>
			</View>

			{/* <View style={{ alignItems: 'center', paddingTop: 24 }}>
				<View style={styles.avatar}>
					<Text style={{ color: '#2563eb', fontSize: 28 }}>👤</Text>
				</View>
				<Text style={{ marginTop: 12, fontWeight: '700', fontSize: 16 }}>{user?.first_name + ' ' + user?.last_name}</Text>
				<Text style={{ color: '#6b7280', marginTop: 4 }}>{user?.org}</Text>
			</View> */}

			<View style={{ padding: 16 }}>
				<Text style={{ fontWeight: '700', marginBottom: 8 }}>{L.personalInformation}</Text>
				<View style={styles.infoCard}>
					<Text style={{ color: '#6b7280' }}>{L.name}</Text>
					<Text style={{ marginTop: 6, fontWeight: '600' }}>{user?.first_name + ' ' + user?.last_name}</Text>
				</View>
				{/* <View style={styles.infoCard}>
					<Text style={{ color: '#6b7280' }}>{L.organization}</Text>
					<Text style={{ marginTop: 6, fontWeight: '600' }}>{user.org}</Text>
				</View> */}
				<View style={styles.infoCard}>
					<Text style={{ color: '#6b7280' }}>{L.email}</Text>
					<Text style={{ marginTop: 6, fontWeight: '600' }}>{user.email}</Text>
				</View>

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
					onPress={onLogout}
					style={styles.logoutBtn}
				>
					<Text style={{ color: '#ef4444', fontWeight: '700' }}>{L.logout}</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', alignItems: 'center' },
	avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
	infoCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eaeef3', padding: 12, marginBottom: 12 },
	langBtn: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
	logoutBtn: { marginTop: 20, borderWidth: 1, borderColor: '#fee2e2', backgroundColor: '#fff', padding: 12, borderRadius: 8, alignItems: 'center' }
})
