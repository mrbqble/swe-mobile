type ConfigParams = {
	API_BASE: string
	USE_MOCK: boolean
	DEFAULT_HEADERS: Record<string, string>
}

const Config: ConfigParams = {
	API_BASE: process.env.API_BASE as string,
	USE_MOCK: process.env.USE_MOCK === 'true',
	DEFAULT_HEADERS: {
		'Content-Type': 'application/json'
	}
}

export default Config
