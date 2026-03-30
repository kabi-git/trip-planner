import { createMiddleware } from 'hono/factory'

export const sessions = new Map<string, true>()

export const requireAuth = createMiddleware(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401)
  if (!sessions.has(header.slice(7)))  return c.json({ error: 'Unauthorized' }, 401)
  await next()
})
