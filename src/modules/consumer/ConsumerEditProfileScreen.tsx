import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { styles } from '../../styles/auth/SignInScreen.styles'
import { User } from '../../api/user.http'
import { user } from '../../api'
import { getTranslations, type Language } from '../../translations'
import { toastShow } from '../../helpers/toast'

export default function ConsumerEditProfileScreen({
	user: initialUser,
	language,
	onBack,
	onSave
}: {
	user: User | undefined
	language: 'en' | 'ru'
	onBack: () => void
	onSave?: (updatedUser: User) => void
}) {
	const L = getTranslations('consumer', 'profile', language ?? 'en')
	const commonT = getTranslations('shared', 'common', language ?? 'en')

	const [firstName, setFirstName] = useState(initialUser?.first_name || '')
	const [lastName, setLastName] = useState(initialUser?.last_name || '')
	const [email, setEmail] = useState(initialUser?.email || '')
	const [organizationName, setOrganizationName] = useState(initialUser?.organization_name || '')
	const [profileImage, setProfileImage] = useState<string | null>(initialUser?.profile_image || null)
	const [profileImageUri, setProfileImageUri] = useState<string | null>(null) // Local URI for preview (newly selected)
	const [loading, setLoading] = useState(false)
	const [uploadingImage, setUploadingImage] = useState(false)

	const [emailValid, setEmailValid] = useState<boolean | null>(null)
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

	React.useEffect(() => {
		setEmailValid(email.length === 0 ? null : emailRegex.test(email))
	}, [email])

	const pickImage = async () => {
		try {
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
			if (status !== 'granted') {
				toastShow(commonT.error || 'Error', L.permissionDenied || 'Permission to access camera roll is required')
				return
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
				base64: true
			})

			if (!result.canceled && result.assets[0]) {
				const asset = result.assets[0]
				const uri = asset.uri
				const base64 = asset.base64

				setProfileImageUri(uri)
				setUploadingImage(true)
				try {
					if (base64) {
						setProfileImage(base64)
					} else {
						// Base64 should always be available when base64: true is set
						console.error('Base64 data is not available from ImagePicker')
						toastShow(commonT.error || 'Error', L.imageConversionFailed || 'Failed to process image')
						setProfileImageUri(null)
					}
				} catch (error) {
					console.error('Failed to process image:', error)
					toastShow(commonT.error || 'Error', L.imageConversionFailed || 'Failed to process image')
					setProfileImageUri(null)
				} finally {
					setUploadingImage(false)
				}
			}
		} catch (error) {
			console.error('Failed to pick image:', error)
			toastShow(commonT.error || 'Error', L.imagePickFailed || 'Failed to pick image')
		}
	}

	const removeImage = () => {
		setProfileImage(null)
		setProfileImageUri(null)
	}

	const isFormValid =
		firstName.trim() !== '' && lastName.trim() !== '' && email.trim() !== '' && organizationName.trim() !== '' && emailValid === true

	const handleSave = async () => {
		if (!firstName.trim() || !lastName.trim() || !email.trim() || !organizationName.trim()) {
			toastShow(commonT.validation || 'Validation', L.allFieldsRequired || 'All fields are required')
			return
		}

		if (!emailRegex.test(email)) {
			toastShow(commonT.validation || 'Validation', L.invalidEmail || 'Please enter a valid email address')
			return
		}

		setLoading(true)
		try {
			// Update user profile (first_name, last_name, email, organization_name, profile_image)
			// If profileImage is null (removed), send null explicitly; otherwise send the base64 string or undefined
			const updatedUser = await user.updateProfile({
				first_name: firstName.trim(),
				last_name: lastName.trim(),
				email: email.trim(),
				organization_name: organizationName.trim(),
				profile_image: profileImage !== null ? (profileImage || undefined) : null
			})

			toastShow(commonT.success || 'Success', L.profileUpdated || 'Profile updated successfully')
			if (onSave) {
				onSave(updatedUser)
			}
			onBack()
		} catch (e: any) {
			const msg = e?.message || e?.body?.detail || L.updateFailed || 'Failed to update profile'
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
				<TouchableOpacity
					onPress={onBack}
					style={{ position: 'absolute', left: 12, top: 12, padding: 8 }}
				>
					<Feather
						name="arrow-left"
						size={20}
						color="#111827"
					/>
				</TouchableOpacity>
				<Text style={styles.headerText}>{L.editProfile || 'Edit Profile'}</Text>
			</View>

			<View style={styles.body}>
				<View style={styles.bodyContent}>
					<Text style={{ fontWeight: '700', marginBottom: 8, fontSize: 16, color: '#111827' }}>{L.personalInformation}</Text>

					{/* Profile Image */}
					<View style={{ alignItems: 'center', marginBottom: 24 }}>
						<TouchableOpacity
							onPress={pickImage}
							disabled={loading || uploadingImage}
							style={{ position: 'relative' }}
						>
							{(profileImageUri || profileImage) ? (
								<>
									<Image
										source={{
											uri: profileImageUri
												? profileImageUri
												: (profileImage ? `data:image/jpeg;base64,${profileImage}` : '')
										}}
										style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#f3f4f6' }}
									/>
									{uploadingImage && (
										<View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 60 }}>
											<ActivityIndicator color="#fff" />
										</View>
									)}
									<TouchableOpacity
										onPress={(e) => {
											e.stopPropagation()
											removeImage()
										}}
										style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}
									>
										<Feather name="x" size={16} color="#fff" />
									</TouchableOpacity>
								</>
							) : (
								<View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed' }}>
									<Feather name="camera" size={32} color="#6b7280" />
								</View>
							)}
						</TouchableOpacity>
						<TouchableOpacity
							onPress={pickImage}
							disabled={loading || uploadingImage}
							style={{ marginTop: 12 }}
						>
							<Text style={{ color: '#2563eb', fontSize: 14, fontWeight: '600' }}>
								{profileImage || profileImageUri ? (L.changePhoto || 'Change Photo') : (L.uploadPhoto || 'Upload Photo')}
							</Text>
						</TouchableOpacity>
					</View>

					<Text style={styles.label}>{L.firstName || 'First Name'}</Text>
					<TextInput
						value={firstName}
						onChangeText={setFirstName}
						style={styles.input}
						placeholder={L.firstNamePlaceholder || 'Enter first name'}
						editable={!loading}
					/>

					<Text style={styles.label}>{L.lastName || 'Last Name'}</Text>
					<TextInput
						value={lastName}
						onChangeText={setLastName}
						style={styles.input}
						placeholder={L.lastNamePlaceholder || 'Enter last name'}
						editable={!loading}
					/>

					<Text style={styles.label}>{L.email}</Text>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<TextInput
							value={email}
							onChangeText={setEmail}
							style={[styles.input, { flex: 1 }]}
							placeholder={L.emailPlaceholder || 'Enter email'}
							keyboardType="email-address"
							autoCapitalize="none"
							editable={!loading}
						/>
						{emailValid === true && <Text style={{ color: 'green', marginLeft: 8 }}>✓</Text>}
						{emailValid === false && <Text style={{ color: 'red', marginLeft: 8 }}>✕</Text>}
					</View>

					<Text style={styles.label}>{L.organization}</Text>
					<TextInput
						value={organizationName}
						onChangeText={setOrganizationName}
						style={styles.input}
						placeholder={L.organizationPlaceholder || 'Enter organization name'}
						editable={!loading}
					/>

					<TouchableOpacity
						style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled, { marginTop: 24 }]}
						onPress={handleSave}
						disabled={loading || !isFormValid}
					>
						{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.continueButtonText}>{L.save || 'Save Changes'}</Text>}
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	)
}
