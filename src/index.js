// Composition root — the only file that knows how the layers connect:
// env config → output adapters → use cases → REST adapters → app.
import { createRequire } from 'node:module';
import { env } from './config/env.js';
import { githubIdentity } from './infrastructure/adapters/output/githubIdentity.js';
import { resolveSession } from './application/usecases/resolveSession.js';
import { exchangeOAuthCode } from './application/usecases/exchangeOAuthCode.js';
import { createApp } from './app.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const provider = githubIdentity({
  clientId: env.githubClientId,
  clientSecret: env.githubClientSecret,
});
const usecases = {
  resolveSession: resolveSession({ provider, allowedUsers: env.allowedUsers }),
  exchangeOAuthCode: exchangeOAuthCode({ provider, allowedUsers: env.allowedUsers }),
};

createApp({ env, pkg, usecases })
  .listen(env.port, () => console.log(`${pkg.name}:${pkg.version} on :${env.port}`));
