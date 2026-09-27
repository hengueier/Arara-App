import axios from 'axios';

import { postValidated } from '@/api/client';
import { LoginResponseSchema, type LoginResponse } from '@/api/schemas';
import { bridgeLoginUrl, USE_AUTH_BRIDGE } from '@/config/tenants';

export async function login(user: string, password: string): Promise<LoginResponse> {
  if (USE_AUTH_BRIDGE) {
    const { data } = await axios.post<unknown>(
      bridgeLoginUrl(),
      { user, password },
      {
        timeout: 20_000,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      },
    );
    return LoginResponseSchema.parse(data);
  }
  return postValidated('/auth/login', { user, password }, LoginResponseSchema);
}
