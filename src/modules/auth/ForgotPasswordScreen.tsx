import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { toastShow } from '../../helpers/toast'
import { auth } from '../../api'
import { styles } from '../../styles/auth/SignInScreen.styles'
import { getTranslations, type Language } from '../../translations'

interface ForgotPasswordScreenProps {
	language?: Language
	onBack?: () => void
	onPasswordReset?: () => void
}

export default function ForgotPasswordScreen({ language = 'en', onBack, onPasswordReset }: ForgotPasswordScreenProps) {
	const [email, setEmail] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [step, setStep] = useState<'email' | 'password'>('email')
	const [loading, setLoading] = useState(false)
	const t = getTranslations('auth', 'forgotPassword', language)
	const commonT = getTranslations('shared', 'common', language)

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

	const handleCheckEmail = async () => {
		if (!email || !emailRegex.test(email)) {
			toastShow(commonT.validation || 'Validation', t.invalidEmail || 'Please enter a valid email address')
			return
		}

		setLoading(true)
		try {
			// Check if email exists by attempting to reset with a dummy password
			// We'll catch the error to see if email exists
			// Actually, let's just proceed to password step - backend will validate
			setStep('password')
		} catch (err: any) {
			toastShow(commonT.error || 'Error', err?.message || t.emailCheckFailed || 'Failed to verify email')
		} finally {
			setLoading(false)
		}
	}

	const handleResetPassword = async () => {
		if (!newPassword || !confirmPassword) {
			toastShow(commonT.validation || 'Validation', t.allFieldsRequired || 'All fields are required')
			return
		}

		if (newPassword !== confirmPassword) {
			toastShow(commonT.validation || 'Validation', t.passwordsDoNotMatch || 'Passwords do not match')
			return
		}

		// Validate password requirements
		const passwordChecks = {
			minLength: (s: string) => s.length >= 8,
			upper: (s: string) => /[A-Z]/.test(s),
			lower: (s: string) => /[a-z]/.test(s),
			digitOrSymbol: (s: string) => /[0-9_!@#$%^&*()\-+=]/.test(s)
		}

		if (
			!passwordChecks.minLength(newPassword) ||
			!passwordChecks.upper(newPassword) ||
			!passwordChecks.lower(newPassword) ||
			!passwordChecks.digitOrSymbol(newPassword)
		) {
			toastShow(commonT.validation || 'Validation', t.passwordRequirements || 'Password must be 8+ chars with upper, lower and a number or symbol')
			return
		}

		setLoading(true)
		try {
			await (auth as any).resetPassword(email, newPassword)
			toastShow(commonT.success || 'Success', t.passwordResetSuccess || 'Password reset successfully')
			if (onPasswordReset) {
				onPasswordReset()
			}
		} catch (err: any) {
			const msg = err?.message || err?.body?.detail || t.passwordResetFailed || 'Failed to reset password'
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
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => {
						if (step === 'password') {
							setStep('email')
							setNewPassword('')
							setConfirmPassword('')
						} else if (onBack) {
							onBack()
						}
					}}
					style={{ position: 'absolute', left: 12, top: 12, padding: 8 }}
				>
					<Feather name="arrow-left" size={20} color="#111827" />
				</TouchableOpacity>
				<Text style={styles.headerText}>{t.title || 'Forgot Password'}</Text>
			</View>

			<View style={styles.body}>
				<View style={styles.bodyContent}>
					{step === 'email' ? (
						<>
							<Text style={[styles.label, { marginBottom: 8 }]}>{t.enterEmail || 'Enter your email address'}</Text>
							<Text style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
								{t.emailDescription || 'We will verify your email and allow you to reset your password.'}
							</Text>
							<Text style={styles.label}>{t.email || 'Email'}</Text>
							<TextInput
								style={styles.input}
								placeholder={t.emailPlaceholder || 'Enter your email'}
								value={email}
								onChangeText={setEmail}
								autoCapitalize="none"
								keyboardType="email-address"
								editable={!loading}
							/>
						</>
					) : (
						<>
							<Text style={[styles.label, { marginBottom: 8 }]}>{t.enterNewPassword || 'Enter your new password'}</Text>
							<Text style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
								{t.passwordDescription || 'Please enter a new password that meets the requirements below.'}
							</Text>
							<Text style={styles.label}>{t.newPassword || 'New Password'}</Text>
							<View style={{ position: 'relative' }}>
								<TextInput
									style={styles.input}
									placeholder={t.newPasswordPlaceholder || 'Enter new password'}
									value={newPassword}
									onChangeText={setNewPassword}
									secureTextEntry={!showNewPassword}
									editable={!loading}
								/>
								<TouchableOpacity
									onPress={() => setShowNewPassword(!showNewPassword)}
									style={{
										position: 'absolute',
										right: 12,
										top: 12,
										padding: 4
									}}
								>
									<Feather
										name={showNewPassword ? 'eye-off' : 'eye'}
										size={20}
										color="#6b7280"
									/>
								</TouchableOpacity>
							</View>
							<Text style={styles.label}>{t.confirmPassword || 'Confirm Password'}</Text>
							<View style={{ position: 'relative' }}>
								<TextInput
									style={styles.input}
									placeholder={t.confirmPasswordPlaceholder || 'Confirm new password'}
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									secureTextEntry={!showConfirmPassword}
									editable={!loading}
								/>
								<TouchableOpacity
									onPress={() => setShowConfirmPassword(!showConfirmPassword)}
									style={{
										position: 'absolute',
										right: 12,
										top: 12,
										padding: 4
									}}
								>
									<Feather
										name={showConfirmPassword ? 'eye-off' : 'eye'}
										size={20}
										color="#6b7280"
									/>
								</TouchableOpacity>
							</View>
							<View style={{ marginTop: 12 }}>
								<Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{t.passwordRequirements || 'Password must:'}</Text>
								<Text style={{ fontSize: 12, color: newPassword.length >= 8 ? 'green' : '#6b7280' }}>
									{newPassword.length >= 8 ? '✓' : '✕'} {t.passwordMinLength || 'At least 8 characters'}
								</Text>
								<Text style={{ fontSize: 12, color: /[A-Z]/.test(newPassword) ? 'green' : '#6b7280' }}>
									{/[A-Z]/.test(newPassword) ? '✓' : '✕'} {t.passwordUpper || 'One uppercase letter'}
								</Text>
								<Text style={{ fontSize: 12, color: /[a-z]/.test(newPassword) ? 'green' : '#6b7280' }}>
									{/[a-z]/.test(newPassword) ? '✓' : '✕'} {t.passwordLower || 'One lowercase letter'}
								</Text>
								<Text style={{ fontSize: 12, color: /[0-9_!@#$%^&*()\-+=]/.test(newPassword) ? 'green' : '#6b7280' }}>
									{/[0-9_!@#$%^&*()\-+=]/.test(newPassword) ? '✓' : '✕'} {t.passwordDigitOrSymbol || 'One number or symbol'}
								</Text>
							</View>
						</>
					)}
				</View>
			</View>

			<View style={styles.footer}>
				<View style={styles.footerContent}>
					<TouchableOpacity
						style={[
							styles.continueButton,
							(step === 'email' ? !email : (!newPassword || !confirmPassword)) && styles.continueButtonDisabled
						]}
						onPress={step === 'email' ? handleCheckEmail : handleResetPassword}
						disabled={loading}
					>
						<Text style={styles.continueButtonText}>
							{loading
								? (commonT.pleaseWait || 'Please wait...')
								: step === 'email'
									? (t.continue || 'Continue')
									: (t.resetPassword || 'Reset Password')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	)
}

