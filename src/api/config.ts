// Centralized API configuration for the mobile app.
// Update `API_BASE` to point to your backend. For local development with
// the backend running on the same machine and default FastAPI port use:
// `http://localhost:8000/api/v1`.
// Use machine LAN IP so physical devices on the same network can reach the backend.
// When local machine networking blocks the device, we provide a tunnel fallback.
// The tunnel URL is generated dynamically; replace it with your tunnel if needed.
export const API_BASE = (typeof process !== 'undefined' && process.env.API_BASE) || 'https://fruity-forks-talk.loca.lt/api/v1';

// Helpful note for Android emulator: use 10.0.2.2 to reach host machine
// e.g. `http://10.0.2.2:8000/api/v1` when running on Android emulator.

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};
