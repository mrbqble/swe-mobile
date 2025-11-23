import httpClient from './httpClient';

export type User = {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  created_at?: string;
};

export async function getMe(): Promise<User> {
  return httpClient.fetchJson('/users/me');
}

export default { getMe };
