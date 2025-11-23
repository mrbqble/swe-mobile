import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons'
import { toastShow } from '../../helpers/toast'
import { auth } from '../../api'
import { styles } from '../../styles/auth/SignInScreen.styles'
import { getTranslations, type Language } from '../../translations'

interface SignInScreenProps {
	language?: Language
	onSignIn?: (role: 'consumer' | 'supplier') => void
	onRegister?: () => void
}

export default function SignInScreen({ language = 'en', onSignIn, onRegister }: SignInScreenProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [selectedRole, setSelectedRole] = useState<'consumer' | 'supplier' | null>(null)
	const [loading, setLoading] = useState(false)
	const t = getTranslations('auth', 'signIn', language)

	const handleContinue = () => {
		// Basic client-side validation: require role, email and password.
		if (!selectedRole || !email || !password) {
			const commonT = getTranslations('shared', 'common', language)
			toastShow(commonT.validation || 'Validation', t.allFieldsRequired || 'All fields are required')
			return
		}
		// Call backend login and persist tokens via auth adapter
		setLoading(true)
		;(async () => {
			try {
				// auth.login will throw on error
				await (auth as any).login(email, password)
				if (onSignIn) onSignIn(selectedRole)
			} catch (err: any) {
				const msg = err?.message || t.signInFailed || 'Sign in failed'
				toastShow(getTranslations('shared', 'common', language).error || 'Error', msg)
			} finally {
				setLoading(false)
			}
		})()
	}

	return (
		<SafeAreaView
			style={styles.safeArea}
			edges={['top', 'left', 'right']}
		>
			{/* Header inside SafeAreaView */}
			<View style={styles.header}>
				<Text style={styles.headerText}>{t.signIn}</Text>
			</View>
			<View style={styles.body}>
				{/* Role Selection */}
				<Text style={styles.label}>{t.selectRole}</Text>
				<View style={styles.roleRow}>
					<TouchableOpacity
						style={[styles.roleButton, selectedRole === 'consumer' && styles.roleButtonSelected]}
						onPress={() => setSelectedRole('consumer')}
					>
						<FontAwesome5
							name="user"
							size={24}
							color={selectedRole === 'consumer' ? '#2563eb' : '#a1a1aa'}
							style={{ marginBottom: 4 }}
						/>
						<Text style={[styles.roleText, selectedRole === 'consumer' && styles.roleTextSelected]}>{t.consumer}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.roleButton, selectedRole === 'supplier' && styles.roleButtonSelected]}
						onPress={() => setSelectedRole('supplier')}
					>
						<MaterialIcons
							name="business"
							size={24}
							color={selectedRole === 'supplier' ? '#2563eb' : '#a1a1aa'}
							style={{ marginBottom: 4 }}
						/>
						<Text style={[styles.roleText, selectedRole === 'supplier' && styles.roleTextSelected]}>{t.supplier}</Text>
					</TouchableOpacity>
				</View>
				{/* Email */}
				<Text style={styles.label}>{t.email}</Text>
				<TextInput
					style={styles.input}
					placeholder={t.emailPlaceholder}
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
				/>
				{/* Password */}
				<Text style={styles.label}>{t.password}</Text>
				<TextInput
					style={styles.input}
					placeholder={t.passwordPlaceholder}
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>
			</View>
			{/* Continue Button */}
			<View style={styles.footer}>
				<TouchableOpacity
					style={[styles.continueButton, (!selectedRole || !email || !password) && styles.continueButtonDisabled]}
					onPress={handleContinue}
					disabled={loading}
				>
					<Text style={styles.continueButtonText}>{loading ? t.pleaseWait : t.continue}</Text>
				</TouchableOpacity>
				{/* Register link (consumers only) */}
				{typeof onRegister === 'function' && (
					<View style={{ marginTop: 12, alignItems: 'center' }}>
						<TouchableOpacity onPress={() => onRegister && onRegister()}>
							<Text style={{ color: '#2563eb' }}>{t.noAccount}</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>
		</SafeAreaView>
	)
}
