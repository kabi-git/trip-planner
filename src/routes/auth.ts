import { Hono } from 'hono'
import { db } from '../db'
import { isValidSession, getSessionRole } from '../middleware/auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'kabi2025'
const DEVA_PASSWORD  = process.env.DEVA_PASSWORD  ?? 'deva2025'

const auth = new Hono()

auth.post('/login', async (c) => {
  const { password } = await c.req.json<{ password: string }>()
  let role: string | null = null
  if (password === ADMIN_PASSWORD) role = 'admin'
  else if (password === DEVA_PASSWORD) role = 'viewer'
  if (!role) return c.json({ error: 'Wrong password' }, 401)

  const token = crypto.randomUUID()
  db.prepare('INSERT INTO sessions (token, role) VALUES (?, ?)').run(token, role)
  return c.json({ token, role })
})

auth.post('/logout', (c) => {
  const header = c.req.header('Authorization')
  if (header?.startsWith('Bearer ')) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(header.slice(7))
  }
  return c.json({ ok: true })
})

auth.get('/check', (c) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) return c.json({ authenticated: false, role: null })
  const token = header.slice(7)
  const valid = isValidSession(token)
  const role  = valid ? getSessionRole(token) : null
  return c.json({ authenticated: valid, role })
})

export default auth
