import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { toastShow } from '../../helpers/toast'
import { auth } from '../../api'
import { styles } from '../../styles/auth/RegisterScreen.styles'
import { getTranslations, type Language } from '../../translations'

interface Props {
	language?: Language
	onRegistered?: (user: any) => void
	onCancel?: () => void
}

export default function RegisterScreen({ language = 'en', onRegistered, onCancel }: Props) {
	const t = getTranslations('auth', 'register', language)
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [email, setEmail] = useState('')
	const [organizationName, setOrganizationName] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)

	// Live validation states
	const [emailValid, setEmailValid] = useState<boolean | null>(null)
	const [passwordValid, setPasswordValid] = useState<boolean | null>(null)

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	const passwordChecks = {
		minLength: (s: string) => s.length >= 8,
		upper: (s: string) => /[A-Z]/.test(s),
		lower: (s: string) => /[a-z]/.test(s),
		digitOrSymbol: (s: string) => /[0-9_!@#$%^&*()\-+=]/.test(s)
	}

	React.useEffect(() => {
		setEmailValid(email.length === 0 ? null : emailRegex.test(email))
	}, [email])

	React.useEffect(() => {
		if (password.length === 0) return setPasswordValid(null)
		const ok =
			passwordChecks.minLength(password) && passwordChecks.upper(password) && passwordChecks.lower(password) && passwordChecks.digitOrSymbol(password)
		setPasswordValid(ok)
	}, [password])

	// Check if form is valid (all fields filled and validated)
	const isFormValid = firstName.trim() !== '' &&
		lastName.trim() !== '' &&
		email.trim() !== '' &&
		organizationName.trim() !== '' &&
		password.trim() !== '' &&
		emailValid === true &&
		passwordValid === true

	const handleRegister = async () => {
		const commonT = getTranslations('shared', 'common', language)
		if (!firstName || !lastName || !email || !organizationName || !password) {
			toastShow(commonT.validation || 'Validation', t.allFieldsRequired || 'All fields are required')
			return
		}
		if (!emailRegex.test(email)) {
			toastShow(commonT.validation || 'Validation', t.invalidEmail || 'Please enter a valid email address')
			return
		}
		if (
			!passwordChecks.minLength(password) ||
			!passwordChecks.upper(password) ||
			!passwordChecks.lower(password) ||
			!passwordChecks.digitOrSymbol(password)
		) {
			toastShow(commonT.validation || 'Validation', t.passwordRequirements || 'Password must be 8+ chars with upper, lower and a number or symbol')
			return
		}
		setLoading(true)
		try {
			// Backend expects: email, password, first_name, last_name, role, organization_name
			const res: any = await (auth as any).registerConsumer({
				email,
				password,
				first_name: firstName,
				last_name: lastName,
				role: 'consumer', // Mobile app only supports consumer registration
				organization_name: organizationName.trim() || undefined
			})
			toastShow(commonT.welcome || 'Welcome', t.accountCreated || 'Account created')
			if (onRegistered) onRegistered(res.user || res)
		} catch (e: any) {
			const msg = e?.message || e?.body?.detail || t.registrationFailed || 'Registration failed'
			toastShow(commonT.error || 'Error', msg)
		} finally {
			setLoading(false)
		}
	}

	return (
		<SafeAreaView
			style={styles.safeArea}
			edges={['top', 'left', 'right']}
		>
			{/* Header inside SafeAreaView */}
			<View style={styles.header}>
				<Text style={styles.headerText}>{t.title}</Text>
			</View>
			<View style={styles.body}>
				<View style={styles.bodyContent}>
					<Text style={styles.label}>{t.firstName}</Text>
					<TextInput
						value={firstName}
						onChangeText={setFirstName}
						style={styles.input}
						placeholder={t.firstNamePlaceholder}
					/>
					<Text style={styles.label}>{t.lastName}</Text>
					<TextInput
						value={lastName}
						onChangeText={setLastName}
						style={styles.input}
						placeholder={t.lastNamePlaceholder}
					/>
					<Text style={styles.label}>{t.email}</Text>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<TextInput
							value={email}
							onChangeText={setEmail}
							style={[styles.input, { flex: 1 }]}
							placeholder={t.email}
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						{emailValid === true && <Text style={{ color: 'green', marginLeft: 8 }}>✓</Text>}
						{emailValid === false && <Text style={{ color: 'red', marginLeft: 8 }}>✕</Text>}
					</View>
					<Text style={styles.label}>{t.organizationName || 'Organization Name'}</Text>
					<TextInput
						value={organizationName}
						onChangeText={setOrganizationName}
						style={styles.input}
						placeholder={t.organizationNamePlaceholder || 'Enter organization name'}
					/>
					<Text style={styles.label}>{t.password}</Text>
					<View style={{ position: 'relative' }}>
						<TextInput
							value={password}
							onChangeText={setPassword}
							style={styles.input}
							placeholder={t.password}
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
					<View style={{ marginTop: 6 }}>
						<Text style={{ fontSize: 12, color: passwordChecks.minLength(password) ? 'green' : '#6b7280' }}>
							{passwordChecks.minLength(password) ? '✓' : '✕'} {t.passwordMinLength}
						</Text>
						<Text style={{ fontSize: 12, color: passwordChecks.upper(password) ? 'green' : '#6b7280' }}>
							{passwordChecks.upper(password) ? '✓' : '✕'} {t.passwordUpper}
						</Text>
						<Text style={{ fontSize: 12, color: passwordChecks.lower(password) ? 'green' : '#6b7280' }}>
							{passwordChecks.lower(password) ? '✓' : '✕'} {t.passwordLower}
						</Text>
						<Text style={{ fontSize: 12, color: passwordChecks.digitOrSymbol(password) ? 'green' : '#6b7280' }}>
							{passwordChecks.digitOrSymbol(password) ? '✓' : '✕'} {t.passwordDigitOrSymbol}
						</Text>
					</View>
					{/* Register Button */}
					<TouchableOpacity
						style={[styles.continueButton, (!isFormValid) && styles.continueButtonDisabled, { marginTop: 24 }]}
						onPress={handleRegister}
						disabled={loading || !isFormValid}
					>
						{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.continueButtonText}>{t.register}</Text>}
					</TouchableOpacity>
					{/* Sign in link - center aligned */}
					{typeof onCancel === 'function' && (
						<View style={{ marginTop: 16, alignItems: 'center' }}>
							<TouchableOpacity onPress={() => onCancel && onCancel()}>
								<Text style={{ color: '#2563eb', fontSize: 14 }}>{t.haveAccount}</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>
			</View>
		</SafeAreaView>
	)
}
