const BASE = process.env.API_BASE || 'http://YOUR_API_BASE_HERE';

export async function registerConsumer(payload: { firstName?: string; lastName?: string; email: string; password: string }) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: any = new Error(body?.error || 'Registration failed');
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}
