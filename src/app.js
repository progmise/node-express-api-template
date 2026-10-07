import express from 'express';
import { cors } from './infrastructure/adapters/input/rest/middleware/cors.js';
import { systemRouter } from './infrastructure/adapters/input/rest/routes/system.js';
import { authRouter } from './infrastructure/adapters/input/rest/routes/auth.js';

// Express wiring: middleware + routers. Receives already-built use cases —
// nothing here knows about GitHub, env vars, or persistence.
export const createApp = ({ env, pkg, usecases }) => {
  const app = express();
  app.use(express.json());
  if (env.corsOrigin) app.use(cors(env.corsOrigin));

  app.use(systemRouter({ version: pkg.version }));
  app.use(authRouter({ env, ...usecases }));

  // Unknown API routes return JSON 404, never an HTML fallback.
  app.use('/api', (_req, res) => res.status(404).json({ error: 'not found' }));
  return app;
};
