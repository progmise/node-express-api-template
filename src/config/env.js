// Single place that reads process.env — resolved once at import time and
// treated as immutable config. New vars go here + .env.example (no values).
export const env = {
  port: process.env.PORT || 8080,
  githubClientId: process.env.GITHUB_CLIENT_ID || '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  // Comma-separated GitHub logins allowed to sign in. Empty = any GitHub user.
  allowedUsers: new Set(
    (process.env.ALLOWED_USERS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)),
  // Origin the SPA lives on when it is a separate service — OAuth
  // redirect_uri, post-login redirect, and CORS source.
  frontendUrl: (process.env.FRONTEND_URL || '').replace(/\/$/, ''),
  corsOrigin: (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '').replace(/\/$/, ''),
};
