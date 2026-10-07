// Use case: OAuth code → session token, gated by the allowlist.
// Returns the token string, or null when the exchange fails or the user is
// not allowed — the REST adapter picks the status code.
import { isAllowed } from '../../domain/allowlist.js';

export const exchangeOAuthCode = ({ provider, allowedUsers }) =>
  async (code) => {
    const token = await provider.exchangeCode(code);
    if (!token) return { error: 'unauthorized' };
    if (allowedUsers.size) {
      const user = await provider.getUser(token);
      if (!user || !isAllowed(allowedUsers, user.login)) return { error: 'forbidden' };
    }
    return { token };
  };
