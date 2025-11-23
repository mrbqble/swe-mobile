/**
 * Utility functions for formatting data in the application
 */

/**
 * Format a number as currency using Kazakhstani Tenge (₸)
 * @param price - The price to format
 * @param currency - Currency symbol (default: '₸')
 * @param locale - Locale for formatting (default: 'kk-KZ')
 * @returns Formatted price string
 *
 * @example
 * formatPrice(1234.56) // "1 234,56"
 * formatPrice(1234.56, '₸') // "₸1 234,56"
 */
export function formatPrice(price: number | string | null | undefined, currency = '₸', locale = 'kk-KZ'): string {
	if (price == null || price === '') return ''

	const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
	if (isNaN(numPrice)) return ''

	try {
		const formatted = new Intl.NumberFormat(locale).format(numPrice)
		return currency ? `${currency}${formatted}` : formatted
	} catch (error) {
		// Fallback to simple string conversion
		return currency ? `${currency}${numPrice}` : String(numPrice)
	}
}

/**
 * Format a date to a localized string
 * @param date - Date string, Date object, or timestamp
 * @param options - Intl.DateTimeFormatOptions
 * @param locale - Locale for formatting (default: browser default)
 * @returns Formatted date string
 *
 * @example
 * formatDate('2024-01-15T10:30:00Z') // "1/15/2024, 10:30:00 AM"
 * formatDate(new Date(), { dateStyle: 'short' }) // "1/15/24"
 */
export function formatDate(
	date: string | Date | number | null | undefined,
	options?: Intl.DateTimeFormatOptions,
	locale?: string
): string {
	if (!date) return ''

	try {
		const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
		if (isNaN(dateObj.getTime())) return ''

		return dateObj.toLocaleString(locale, options)
	} catch (error) {
		return ''
	}
}

/**
 * Format a date to a localized date string (without time)
 * @param date - Date string, Date object, or timestamp
 * @param options - Intl.DateTimeFormatOptions
 * @param locale - Locale for formatting (default: browser default)
 * @returns Formatted date string without time
 *
 * @example
 * formatDateOnly('2024-01-15T10:30:00Z') // "1/15/2024"
 * formatDateOnly(new Date(), { dateStyle: 'long' }) // "January 15, 2024"
 */
export function formatDateOnly(
	date: string | Date | number | null | undefined,
	options?: Intl.DateTimeFormatOptions,
	locale?: string
): string {
	if (!date) return ''

	try {
		const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
		if (isNaN(dateObj.getTime())) return ''

		return dateObj.toLocaleDateString(locale, options)
	} catch (error) {
		return ''
	}
}

/**
 * Format a date to a localized time string (without date)
 * @param date - Date string, Date object, or timestamp
 * @param options - Intl.DateTimeFormatOptions
 * @param locale - Locale for formatting (default: browser default)
 * @returns Formatted time string
 *
 * @example
 * formatTime('2024-01-15T10:30:00Z') // "10:30:00 AM"
 */
export function formatTime(
	date: string | Date | number | null | undefined,
	options?: Intl.DateTimeFormatOptions,
	locale?: string
): string {
	if (!date) return ''

	try {
		const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
		if (isNaN(dateObj.getTime())) return ''

		return dateObj.toLocaleTimeString(locale, options)
	} catch (error) {
		return ''
	}
}

/**
 * Format a number with thousand separators
 * @param value - Number to format
 * @param locale - Locale for formatting (default: 'kk-KZ')
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567) // "1 234 567"
 */
export function formatNumber(value: number | string | null | undefined, locale = 'kk-KZ'): string {
	if (value == null || value === '') return ''

	const numValue = typeof value === 'string' ? parseFloat(value) : Number(value)
	if (isNaN(numValue)) return ''

	try {
		return new Intl.NumberFormat(locale).format(numValue)
	} catch (error) {
		return String(numValue)
	}
}

