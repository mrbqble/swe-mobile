/**
 * Centralized constants for the application
 * All magic numbers, strings, and configuration values should be defined here
 */

// ============================================================================
// Pagination
// ============================================================================

export const PAGINATION = {
	/** Default page size for catalog/product listings */
	CATALOG_PAGE_SIZE: 20,
	/** Default page size for chat messages */
	CHAT_PAGE_SIZE: 50,
	/** Default page size for orders */
	ORDERS_PAGE_SIZE: 50,
	/** Default page size for general lists */
	DEFAULT_PAGE_SIZE: 20
} as const

// ============================================================================
// Status Values
// ============================================================================

export const ORDER_STATUS = {
	CREATED: 'Created',
	ACCEPTED: 'Accepted',
	IN_PROGRESS: 'In Progress',
	COMPLETED: 'Completed',
	REJECTED: 'Rejected',
	PENDING: 'pending',
	ACCEPTED_LOWER: 'accepted',
	IN_PROGRESS_LOWER: 'in_progress',
	COMPLETED_LOWER: 'completed',
	REJECTED_LOWER: 'rejected'
} as const

export const COMPLAINT_STATUS = {
	OPEN: 'open',
	ESCALATED: 'escalated',
	RESOLVED: 'resolved',
	// Legacy aliases for backward compatibility
	IN_PROGRESS: 'escalated', // 'In Progress' maps to 'escalated'
	REJECTED: 'rejected' // Not used in backend but kept for compatibility
} as const

export const LINK_STATUS = {
	PENDING: 'pending',
	ACCEPTED: 'accepted',
	DENIED: 'denied',
	BLOCKED: 'blocked',
	REJECTED: 'rejected'
} as const

// ============================================================================
// Delivery Methods
// ============================================================================

export const DELIVERY_METHOD = {
	PICKUP: 'Pickup',
	DELIVERY: 'Delivery'
} as const

export type DeliveryMethod = typeof DELIVERY_METHOD[keyof typeof DELIVERY_METHOD]

// ============================================================================
// Colors
// ============================================================================

export const COLORS = {
	// Primary colors
	PRIMARY: '#2563eb',
	PRIMARY_DARK: '#1e40af',

	// Status colors
	SUCCESS: '#059669',
	SUCCESS_LIGHT: '#ecfdf5',
	WARNING: '#f59e0b',
	WARNING_LIGHT: '#fff7ed',
	ERROR: '#b91c1c',
	ERROR_LIGHT: '#fee2e2',
	ERROR_DARK: '#dc2626',

	// Neutral colors
	TEXT_PRIMARY: '#111827',
	TEXT_SECONDARY: '#374151',
	TEXT_TERTIARY: '#6b7280',
	TEXT_MUTED: '#9ca3af',

	// Background colors
	BG_WHITE: '#fff',
	BG_GRAY: '#f3f4f6',
	BG_GRAY_LIGHT: '#f9fafb',

	// Border colors
	BORDER: '#e5e7eb',
	BORDER_LIGHT: '#f3f4f6',

	// Icon colors
	ICON_DEFAULT: '#111827',
	ICON_MUTED: '#9ca3af',
	ICON_DISABLED: '#cbd5e1'
} as const

// ============================================================================
// Timing & Delays
// ============================================================================

export const TIMING = {
	/** Debounce delay for search inputs (ms) */
	DEBOUNCE_DELAY: 300,
	/** Toast auto-dismiss delay (ms) */
	TOAST_DURATION: 2500,
	/** Animation duration (ms) */
	ANIMATION_DURATION: 200
} as const

// ============================================================================
// Icon Sizes
// ============================================================================

export const ICON_SIZES = {
	SMALL: 16,
	MEDIUM: 20,
	LARGE: 24,
	XLARGE: 28
} as const

// ============================================================================
// Spacing & Layout
// ============================================================================

export const SPACING = {
	XS: 4,
	SM: 8,
	MD: 12,
	LG: 16,
	XL: 24,
	XXL: 32
} as const

// ============================================================================
// Border Radius
// ============================================================================

export const BORDER_RADIUS = {
	SM: 4,
	MD: 8,
	LG: 12,
	XL: 16,
	FULL: 9999
} as const

// ============================================================================
// Font Weights
// ============================================================================

export const FONT_WEIGHTS = {
	NORMAL: '400' as const,
	MEDIUM: '500' as const,
	SEMIBOLD: '600' as const,
	BOLD: '700' as const
} as const

// ============================================================================
// Currency
// ============================================================================

export const CURRENCY = {
	SYMBOL: '₸',
	LOCALE: 'kk-KZ',
	DEFAULT: 'KZT'
} as const

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if an order status is considered "open" (not completed/resolved)
 */
export function isOrderOpen(status: string): boolean {
	const closedStatuses = [ORDER_STATUS.COMPLETED, ORDER_STATUS.RESOLVED, ORDER_STATUS.REJECTED]
	return !closedStatuses.includes(status)
}

/**
 * Check if a link status is accepted
 */
export function isLinkAccepted(status: string): boolean {
	return status.toLowerCase() === LINK_STATUS.ACCEPTED.toLowerCase()
}

/**
 * Get status color based on status value
 */
export function getStatusColor(status: string): string {
	const statusLower = status.toLowerCase()

	if (statusLower.includes('resolved') || statusLower.includes('completed') || statusLower === LINK_STATUS.ACCEPTED) {
		return COLORS.SUCCESS
	}
	if (statusLower.includes('progress') || statusLower === LINK_STATUS.PENDING) {
		return COLORS.WARNING
	}
	if (statusLower.includes('rejected') || statusLower.includes('denied') || statusLower.includes('blocked') || statusLower === COMPLAINT_STATUS.OPEN.toLowerCase()) {
		return COLORS.ERROR
	}

	return COLORS.TEXT_TERTIARY
}

/**
 * Get status background color based on status value
 */
export function getStatusBgColor(status: string): string {
	const statusLower = status.toLowerCase()

	if (statusLower.includes('resolved') || statusLower.includes('completed') || statusLower === LINK_STATUS.ACCEPTED) {
		return COLORS.SUCCESS_LIGHT
	}
	if (statusLower.includes('progress') || statusLower === LINK_STATUS.PENDING) {
		return COLORS.WARNING_LIGHT
	}
	if (statusLower.includes('rejected') || statusLower.includes('denied') || statusLower.includes('blocked') || statusLower === COMPLAINT_STATUS.OPEN.toLowerCase()) {
		return COLORS.ERROR_LIGHT
	}

	return COLORS.BG_GRAY
}

