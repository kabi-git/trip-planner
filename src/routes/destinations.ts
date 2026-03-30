import { Hono } from 'hono'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

type Row = Record<string, unknown>

function parseDest(d: Row) {
  return { ...d, tags: JSON.parse(d.tags as string || '[]'), confirmed: d.confirmed === 1 }
}

const destinations = new Hono()

destinations.get('/', (c) => {
  const rows = db.prepare('SELECT * FROM destinations ORDER BY id ASC').all() as Row[]
  return c.json(rows.map(parseDest))
})

destinations.get('/:id', (c) => {
  const d = db.prepare('SELECT * FROM destinations WHERE id = ?').get(c.req.param('id')) as Row | null
  if (!d) return c.json({ error: 'Not found' }, 404)

  const sections = db.prepare(
    'SELECT * FROM sections WHERE destination_id = ? ORDER BY sort_order ASC, id ASC'
  ).all(d.id as number) as Row[]

  for (const s of sections) {
    s.items = db.prepare(
      'SELECT * FROM items WHERE section_id = ? ORDER BY sort_order ASC, id ASC'
    ).all(s.id as number)
  }

  return c.json({ ...parseDest(d), sections })
})

destinations.post('/', requireAuth, async (c) => {
  const { name, subtitle, emoji, distance_km, duration_hrs, tags } = await c.req.json()
  const { lastInsertRowid } = db.prepare(
    'INSERT INTO destinations (name, subtitle, emoji, distance_km, duration_hrs, tags) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, subtitle, emoji, distance_km, duration_hrs, JSON.stringify(tags ?? []))
  const d = db.prepare('SELECT * FROM destinations WHERE id = ?').get(lastInsertRowid) as Row
  return c.json(parseDest(d), 201)
})

destinations.put('/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const existing = db.prepare('SELECT * FROM destinations WHERE id = ?').get(id) as Row | null
  if (!existing) return c.json({ error: 'Not found' }, 404)

  const { name, subtitle, emoji, distance_km, duration_hrs, tags, confirmed } = await c.req.json()
  const isConfirm = confirmed === true || confirmed === 1

  db.transaction(() => {
    if (isConfirm) db.prepare('UPDATE destinations SET confirmed = 0').run()
    db.prepare(
      'UPDATE destinations SET name=?, subtitle=?, emoji=?, distance_km=?, duration_hrs=?, tags=?, confirmed=? WHERE id=?'
    ).run(
      name          ?? existing.name,
      subtitle      ?? existing.subtitle,
      emoji         ?? existing.emoji,
      distance_km   ?? existing.distance_km,
      duration_hrs  ?? existing.duration_hrs,
      JSON.stringify(tags ?? JSON.parse(existing.tags as string || '[]')),
      isConfirm ? 1 : (confirmed === false || confirmed === 0) ? 0 : existing.confirmed,
      id
    )
  })()

  const d = db.prepare('SELECT * FROM destinations WHERE id = ?').get(id) as Row
  return c.json(parseDest(d))
})

destinations.delete('/:id', requireAuth, (c) => {
  const { changes } = db.prepare('DELETE FROM destinations WHERE id = ?').run(c.req.param('id'))
  if (changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

// Nested: POST /api/destinations/:id/sections
destinations.post('/:id/sections', requireAuth, async (c) => {
  const destId = c.req.param('id')
  if (!db.prepare('SELECT id FROM destinations WHERE id = ?').get(destId)) {
    return c.json({ error: 'Destination not found' }, 404)
  }
  const { type, title, icon, sort_order } = await c.req.json()
  const { lastInsertRowid } = db.prepare(
    'INSERT INTO sections (destination_id, type, title, icon, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(destId, type ?? 'custom', title, icon, sort_order ?? 0)

  const section = db.prepare('SELECT * FROM sections WHERE id = ?').get(lastInsertRowid) as Row
  section.items = []
  return c.json(section, 201)
})

export default destinations
