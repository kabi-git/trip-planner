import { Hono } from 'hono'
import { sessions, requireAuth } from '../middleware/auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'kabi2025'

const auth = new Hono()

auth.post('/login', async (c) => {
  const { password } = await c.req.json<{ password: string }>()
  if (password !== ADMIN_PASSWORD) return c.json({ error: 'Wrong password' }, 401)
  const token = crypto.randomUUID()
  sessions.set(token, true)
  return c.json({ token })
})

auth.post('/logout', (c) => {
  const header = c.req.header('Authorization')
  if (header?.startsWith('Bearer ')) sessions.delete(header.slice(7))
  return c.json({ ok: true })
})

auth.get('/check', (c) => {
  const header = c.req.header('Authorization')
  const authenticated = !!(header?.startsWith('Bearer ') && sessions.has(header.slice(7)))
  return c.json({ authenticated })
})

export default auth
