import { Router } from 'express';

// Health/ping — open endpoints used by the platform and CI smoke checks.
export const systemRouter = ({ version }) =>
  Router()
    .get('/api/ping', (_req, res) => res.json({ message: 'pong' }))
    .get('/api/health', (_req, res) => res.json({ status: 'ok', version }));
