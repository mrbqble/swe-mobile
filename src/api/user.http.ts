import httpClient from './httpClient';

export type User = {
  id: number;
  email: string;
  role: string;
  first_name?: string | null;
  last_name?: string | null;
};

export async function getMe(): Promise<User> {
  return httpClient.fetchJson('/users/me');
}

export default { getMe };
