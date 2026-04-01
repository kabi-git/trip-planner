import { createMiddleware } from 'hono/factory'
import { store } from '../store'

function getSession(authHeader: string | undefined) {
  if (!authHeader?.startsWith('Bearer ')) return null
  return store.sessions.get(authHeader.slice(7))
}

export const requireAuth = createMiddleware(async (c, next) => {
  const session = getSession(c.req.header('Authorization'))
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (session.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  await next()
})

export const requireAnyAuth = createMiddleware(async (c, next) => {
  const session = getSession(c.req.header('Authorization'))
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  await next()
})
