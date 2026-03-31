import { createMiddleware } from 'hono/factory'
import { db } from '../db'

export async function isValidSession(token: string): Promise<boolean> {
  return !!(await db.get('SELECT token FROM sessions WHERE token = ?', [token]))
}

export async function getSessionRole(token: string): Promise<string | null> {
  const row = await db.get('SELECT role FROM sessions WHERE token = ?', [token])
  return row?.role ?? null
}

// Admin-only: can create/edit/delete content
export const requireAuth = createMiddleware(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401)
  const token = header.slice(7)
  if (!(await isValidSession(token))) return c.json({ error: 'Unauthorized' }, 401)
  if ((await getSessionRole(token)) !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  await next()
})

// Any authenticated user (admin or viewer)
export const requireAnyAuth = createMiddleware(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401)
  if (!(await isValidSession(header.slice(7)))) return c.json({ error: 'Unauthorized' }, 401)
  await next()
})
