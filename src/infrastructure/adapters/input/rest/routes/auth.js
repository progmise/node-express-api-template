import { Router } from 'express';

const COOKIE = 'gh_token';

const baseUrl = (req) =>
  `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers['x-forwarded-host'] || req.headers.host}`;

const readCookie = (req) =>
  (req.headers.cookie || '').split(';').map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))?.split('=')[1];

// GitHub OAuth — the use cases carry the rules; this file only translates
// HTTP <-> application (statuses, cookie, redirects).
export const authRouter = ({ env, resolveSession, exchangeOAuthCode }) =>
  Router()
    .get('/api/auth/login', (req, res) => {
      const redirect = `${env.frontendUrl || baseUrl(req)}/api/auth/callback`;
      res.redirect(
        `https://github.com/login/oauth/authorize?client_id=${env.githubClientId}` +
        `&redirect_uri=${encodeURIComponent(redirect)}&scope=read:user`,
      );
    })

    .get('/api/auth/callback', async (req, res) => {
      const result = await exchangeOAuthCode(req.query.code);
      if (result.error === 'forbidden') return res.status(403).send('User not authorized');
      if (!result.token) return res.status(401).send('OAuth failed');
      res.setHeader('Set-Cookie',
        `${COOKIE}=${result.token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`);
      res.redirect(`${env.frontendUrl}/`);
    })

    .get('/api/logout', (_req, res) => {
      res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; Max-Age=0`);
      res.redirect(`${env.frontendUrl || '/'}`);
    })

    .get('/api/me', async (req, res) => {
      const session = await resolveSession(readCookie(req));
      if (session.error === 'forbidden')
        return res.status(403).json({ error: 'not authorized' });
      if (!session.user) return res.status(401).json({ error: 'not authenticated' });
      res.json({ login: session.user.login, avatar_url: session.user.avatar_url });
    });
