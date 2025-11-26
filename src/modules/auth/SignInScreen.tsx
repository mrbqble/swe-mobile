import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { toastShow } from '../../helpers/toast'
import { auth } from '../../api'
import { getMe } from '../../api/user.http'
import { styles } from '../../styles/auth/SignInScreen.styles'
import { getTranslations, type Language } from '../../translations'

interface SignInScreenProps {
	language?: Language
	onSignIn?: (role: 'consumer' | 'supplier') => void
	onRegister?: () => void
	onForgotPassword?: () => void
}

export default function SignInScreen({ language = 'en', onSignIn, onRegister, onForgotPassword }: SignInScreenProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const t = getTranslations('auth', 'signIn', language)

	const handleContinue = () => {
		// Basic client-side validation: require email and password.
		if (!email || !password) {
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
				// After successful login, get user info to determine role
				const user = await getMe()
				// Map backend role to app role
				// consumer -> consumer
				// supplier_owner, supplier_manager, supplier_sales -> supplier
				let appRole: 'consumer' | 'supplier'
				if (user.role === 'consumer') {
					appRole = 'consumer'
				} else if (user.role === 'supplier_owner' || user.role === 'supplier_manager' || user.role === 'supplier_sales') {
					appRole = 'supplier'
				} else {
					// Default to consumer for unknown roles (e.g., admin)
					appRole = 'consumer'
				}
				if (onSignIn) onSignIn(appRole)
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
				<View style={styles.bodyContent}>
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
					<View style={{ position: 'relative' }}>
						<TextInput
							style={styles.input}
							placeholder={t.passwordPlaceholder}
							value={password}
							onChangeText={setPassword}
							secureTextEntry={!showPassword}
						/>
						<TouchableOpacity
							onPress={() => setShowPassword(!showPassword)}
							style={{
								position: 'absolute',
								right: 12,
								top: 12,
								padding: 4
							}}
						>
							<Feather
								name={showPassword ? 'eye-off' : 'eye'}
								size={20}
								color="#6b7280"
							/>
						</TouchableOpacity>
					</View>
					{/* Forgot Password link - right aligned */}
					{typeof onForgotPassword === 'function' && (
						<View style={{ marginTop: 8, alignItems: 'flex-end' }}>
							<TouchableOpacity onPress={() => onForgotPassword && onForgotPassword()}>
								<Text style={{ color: '#2563eb', fontSize: 14 }}>{t.forgotPassword || 'Forgot Password?'}</Text>
							</TouchableOpacity>
						</View>
					)}
					{/* Continue Button */}
					<TouchableOpacity
						style={[styles.continueButton, (!email || !password) && styles.continueButtonDisabled, { marginTop: 24 }]}
						onPress={handleContinue}
						disabled={loading}
					>
						{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.continueButtonText}>{t.continue}</Text>}
					</TouchableOpacity>
					{/* Register link (consumers only) - center aligned */}
					{typeof onRegister === 'function' && (
						<View style={{ marginTop: 16, alignItems: 'center' }}>
							<TouchableOpacity onPress={() => onRegister && onRegister()}>
								<Text style={{ color: '#2563eb', fontSize: 14 }}>{t.noAccount}</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>
			</View>
		</SafeAreaView>
	)
}
