type ConfigParams = {
	API_BASE: string
	DEFAULT_HEADERS: Record<string, string>
}

const Config: ConfigParams = {
	API_BASE: process.env.EXPO_PUBLIC_API_BASE as string,
	DEFAULT_HEADERS: {
		'Content-Type': 'application/json'
	}
}

export default Config
