import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { styles } from '../../styles/auth/LanguagePickerScreen.styles'

interface LanguagePickerScreenProps {
	onLanguageSelect?: (language: 'en' | 'ru') => void
}

export default function LanguagePickerScreen({ onLanguageSelect }: LanguagePickerScreenProps) {
	return (
		<View style={styles.container}>
			<View style={styles.innerContainer}>
				<View style={styles.iconCircle}>
					<FontAwesome
						name="globe"
						size={32}
						color="#2563eb"
					/>
				</View>
				<View style={styles.textBlock}>
					<Text style={styles.title}>Choose Language</Text>
					<Text style={styles.subtitle}>Select your preferred language to continue</Text>
				</View>
				<View style={styles.buttonBlock}>
					<TouchableOpacity
						style={[styles.button, styles.buttonPrimary]}
						onPress={() => onLanguageSelect && onLanguageSelect('en')}
					>
						<Text style={styles.buttonPrimaryText}>English</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.button, styles.buttonOutline]}
						onPress={() => onLanguageSelect && onLanguageSelect('ru')}
					>
						<Text style={styles.buttonOutlineText}>Русский</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}
