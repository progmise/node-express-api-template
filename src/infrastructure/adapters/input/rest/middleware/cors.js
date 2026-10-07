// CORS only when an origin is configured — same-origin deployments (a proxy
// serving /api/*) do not need it.
export const cors = (origin) => (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
};
