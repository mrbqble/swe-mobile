import React, { useState } from 'react'
import { View, Text, Modal, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import { styles } from '../../styles/consumer/ComplaintModal.styles'

export default function ComplaintModal({
	visible,
	onClose,
	onSubmit,
	title = 'Report an issue',
	initialValue = '',
}: {
	visible: boolean
	onClose: () => void
	onSubmit: (reason: string) => Promise<void>
	title?: string
	initialValue?: string
}) {
	const [value, setValue] = useState(initialValue)
	const [submitting, setSubmitting] = useState(false)

	// reset value when modal opens/closes
	React.useEffect(() => {
		setValue(initialValue ?? '')
	}, [visible, initialValue])

	const doSubmit = async () => {
		try {
			setSubmitting(true)
			Keyboard.dismiss()
			await onSubmit(value || '')
			setSubmitting(false)
			onClose()
		} catch (e) {
			setSubmitting(false)
			// bubble up; caller may show toast
		}
	}

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			presentationStyle="overFullScreen"
			onRequestClose={onClose}
		>
			<View style={styles.backdrop}>
				<View style={styles.card}>
					<Text style={styles.title}>{title}</Text>
					<TextInput
						value={value}
						onChangeText={setValue}
						placeholder="Describe the issue (optional)"
						multiline
						style={styles.input}
						textAlignVertical="top"
						accessibilityLabel="complaint-input"
					/>
					<View style={styles.row}>
						<TouchableOpacity
							onPress={() => {
								setValue('')
								onClose()
							}}
							style={styles.cancel}
						>
							<Text>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={doSubmit}
							style={styles.submit}
							disabled={submitting}
						>
							<Text style={{ color: '#fff' }}>{submitting ? 'Submitting...' : 'Submit'}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	)
}
