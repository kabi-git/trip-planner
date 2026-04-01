import { Hono } from 'hono'
import { store } from '../store'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const DEVA_PASSWORD  = process.env.DEVA_PASSWORD

const auth = new Hono()

auth.post('/login', async (c) => {
  const { password } = await c.req.json<{ password: string }>()
  let role: string | null = null
  if (password === ADMIN_PASSWORD) role = 'admin'
  else if (password === DEVA_PASSWORD) role = 'viewer'
  if (!role) return c.json({ error: 'Wrong password' }, 401)

  const token = crypto.randomUUID()
  store.sessions.create(token, role)
  return c.json({ token, role })
})

auth.post('/logout', async (c) => {
  const header = c.req.header('Authorization')
  if (header?.startsWith('Bearer ')) store.sessions.delete(header.slice(7))
  return c.json({ ok: true })
})

auth.get('/check', async (c) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) return c.json({ authenticated: false, role: null })
  const session = store.sessions.get(header.slice(7))
  return c.json({ authenticated: !!session, role: session?.role ?? null })
})

export default auth
