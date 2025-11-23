import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff'
	},
	container: {
		flex: 1,
		backgroundColor: '#fff'
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingTop: 32,
		paddingBottom: 20,
		backgroundColor: '#2563eb'
		// Remove border radius for edge-to-edge fit
	},
	headerTitle: {
		color: '#fff',
		fontSize: 20,
		fontWeight: '700'
	},
	headerSubtitle: {
		color: '#dbeafe',
		fontSize: 14,
		marginTop: 2
	},
	searchButton: {
		backgroundColor: 'rgba(255,255,255,0.15)',
		borderRadius: 20,
		padding: 8
	},
	content: {
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 16
	},
	quickActionsTitle: {
		fontSize: 16,
		color: '#111827',
		fontWeight: '600',
		marginBottom: 16
	},
	actionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		padding: 16,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOpacity: 0.03,
		shadowRadius: 2,
		elevation: 1
	},
	actionIconCircle: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 16
	},
	actionTextBlock: {
		flex: 1
	},
	actionTitle: {
		fontSize: 16,
		color: '#111827',
		fontWeight: '600'
	},
	actionDesc: {
		fontSize: 13,
		color: '#6b7280',
		marginTop: 2
	},
	bottomNav: {
		flexDirection: 'row',
		borderTopWidth: 1,
		borderTopColor: '#e5e7eb',
		backgroundColor: '#fff',
		paddingVertical: 8,
		paddingBottom: 12,
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20
	},
	bottomNavItem: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	bottomNavLabel: {
		fontSize: 12,
		color: '#a1a1aa',
		marginTop: 2,
		fontWeight: '500'
	}
});

