import { Hono } from 'hono'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

type Row = Record<string, unknown>

function parseDest(d: Row) {
  return {
    ...d,
    tags: JSON.parse(d.tags as string || '[]'),
    confirmed: d.confirmed === 1,
  }
}

const destinations = new Hono()

destinations.get('/', (c) => {
  const q    = c.req.query('q')?.toLowerCase()
  const sort = c.req.query('sort') // 'name' | 'distance' | 'duration'

  let query = 'SELECT * FROM destinations'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = []

  if (q) {
    query += ' WHERE lower(name) LIKE ? OR lower(coalesce(subtitle,"")) LIKE ?'
    params.push(`%${q}%`, `%${q}%`)
  }

  switch (sort) {
    case 'name':     query += ' ORDER BY name ASC'; break
    case 'distance': query += ' ORDER BY distance_km ASC'; break
    case 'duration': query += ' ORDER BY duration_hrs ASC'; break
    default:         query += ' ORDER BY id ASC'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = db.prepare(query).all(...(params as any[])) as Row[]
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
  const { name, subtitle, emoji, distance_km, duration_hrs, tags, notes } = await c.req.json()
  const { lastInsertRowid } = db.prepare(
    'INSERT INTO destinations (name, subtitle, emoji, distance_km, duration_hrs, tags, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(name, subtitle, emoji, distance_km, duration_hrs, JSON.stringify(tags ?? []), notes ?? null)
  const d = db.prepare('SELECT * FROM destinations WHERE id = ?').get(lastInsertRowid) as Row
  return c.json(parseDest(d), 201)
})

destinations.put('/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = db.prepare('SELECT * FROM destinations WHERE id = ?').get(id) as any | null
  if (!existing) return c.json({ error: 'Not found' }, 404)

  const { name, subtitle, emoji, distance_km, duration_hrs, tags, confirmed, notes } = await c.req.json()
  const isConfirm = confirmed === true || confirmed === 1

  db.transaction(() => {
    if (isConfirm) db.prepare('UPDATE destinations SET confirmed = 0').run()
    db.prepare(
      'UPDATE destinations SET name=?, subtitle=?, emoji=?, distance_km=?, duration_hrs=?, tags=?, confirmed=?, notes=? WHERE id=?'
    ).run(
      name         ?? existing.name,
      subtitle     ?? existing.subtitle,
      emoji        ?? existing.emoji,
      distance_km  ?? existing.distance_km,
      duration_hrs ?? existing.duration_hrs,
      JSON.stringify(tags ?? JSON.parse(existing.tags || '[]')),
      isConfirm ? 1 : (confirmed === false || confirmed === 0) ? 0 : existing.confirmed,
      notes !== undefined ? notes : existing.notes,
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

// Clone a destination with all its sections and items
destinations.post('/:id/clone', requireAuth, (c) => {
  const id = c.req.param('id')
  const d  = db.prepare('SELECT * FROM destinations WHERE id = ?').get(id) as Row | null
  if (!d) return c.json({ error: 'Not found' }, 404)

  let newDestId: number | bigint = 0
  db.transaction(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = d as any
    const { lastInsertRowid } = db.prepare(
      'INSERT INTO destinations (name, subtitle, emoji, distance_km, duration_hrs, tags, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(`${r.name} (Copy)`, r.subtitle, r.emoji, r.distance_km, r.duration_hrs, r.tags, r.notes ?? null)
    newDestId = lastInsertRowid

    const sections = db.prepare(
      'SELECT * FROM sections WHERE destination_id = ? ORDER BY sort_order ASC, id ASC'
    ).all(id) as Row[]

    for (const s of sections) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sa = s as any
      const { lastInsertRowid: newSecId } = db.prepare(
        'INSERT INTO sections (destination_id, type, title, icon, sort_order) VALUES (?, ?, ?, ?, ?)'
      ).run(newDestId, sa.type, sa.title, sa.icon, sa.sort_order)

      const items = db.prepare(
        'SELECT * FROM items WHERE section_id = ? ORDER BY sort_order ASC, id ASC'
      ).all(sa.id as number) as Row[]

      for (const item of items) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ia = item as any
        db.prepare(
          'INSERT INTO items (section_id, item_type, text, note, tag, tag_color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(newSecId, ia.item_type, ia.text, ia.note, ia.tag, ia.tag_color, ia.sort_order)
      }
    }
  })()

  const newDest = db.prepare('SELECT * FROM destinations WHERE id = ?').get(newDestId) as Row
  return c.json(parseDest(newDest), 201)
})

// Reorder sections: POST /api/destinations/:id/sections/reorder  [{id, sort_order}]
destinations.post('/:id/sections/reorder', requireAuth, async (c) => {
  const payload = await c.req.json<Array<{ id: number; sort_order: number }>>()
  const stmt = db.prepare('UPDATE sections SET sort_order = ? WHERE id = ?')
  db.transaction(() => { for (const { id, sort_order } of payload) stmt.run(sort_order, id) })()
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
