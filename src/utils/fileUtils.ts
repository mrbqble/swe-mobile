/**
 * Get MIME type from file extension (images only)
 */
export function getMimeType(fileName: string): string {
	const ext = fileName.split('.').pop()?.toLowerCase()
	const mimeTypes: Record<string, string> = {
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
		gif: 'image/gif',
		webp: 'image/webp'
	}
	return mimeTypes[ext || ''] || 'image/jpeg'
}

/**
 * Determine file type from MIME type or extension
 * Returns 'image' since only images are supported
 */
export function getFileType(fileName: string, mimeType?: string): 'image' | 'file' | 'audio' {
	const mime = mimeType || getMimeType(fileName)
	if (mime.startsWith('image/')) return 'image'
	// Fallback to 'file' for non-image types (shouldn't happen in practice)
	return 'file'
}
