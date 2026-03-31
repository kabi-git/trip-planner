import { Hono } from 'hono'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

type Row = Record<string, any>

function parseDest(d: Row) {
  return {
    ...d,
    tags: JSON.parse(d.tags || '[]'),
    confirmed: d.confirmed === 1,
  }
}

const destinations = new Hono()

destinations.get('/', async (c) => {
  const q    = c.req.query('q')?.toLowerCase()
  const sort = c.req.query('sort') // 'name' | 'distance' | 'duration'

  let query = 'SELECT * FROM destinations'
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

  const rows = await db.all(query, params)
  return c.json(rows.map(parseDest))
})

destinations.get('/:id', async (c) => {
  const d = await db.get('SELECT * FROM destinations WHERE id = ?', [c.req.param('id')])
  if (!d) return c.json({ error: 'Not found' }, 404)

  const sections = await db.all(
    'SELECT * FROM sections WHERE destination_id = ? ORDER BY sort_order ASC, id ASC',
    [d.id]
  )

  for (const s of sections) {
    s.items = await db.all(
      'SELECT * FROM items WHERE section_id = ? ORDER BY sort_order ASC, id ASC',
      [s.id]
    )
  }

  return c.json({ ...parseDest(d), sections })
})

destinations.post('/', requireAuth, async (c) => {
  const { name, subtitle, emoji, distance_km, duration_hrs, tags, notes } = await c.req.json()
  const { lastInsertRowid } = await db.run(
    'INSERT INTO destinations (name, subtitle, emoji, distance_km, duration_hrs, tags, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, subtitle, emoji, distance_km, duration_hrs, JSON.stringify(tags ?? []), notes ?? null]
  )
  const d = await db.get('SELECT * FROM destinations WHERE id = ?', [lastInsertRowid])
  return c.json(parseDest(d!), 201)
})

destinations.put('/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const existing = await db.get('SELECT * FROM destinations WHERE id = ?', [id])
  if (!existing) return c.json({ error: 'Not found' }, 404)

  const { name, subtitle, emoji, distance_km, duration_hrs, tags, confirmed, notes } = await c.req.json()
  const isConfirm = confirmed === true || confirmed === 1

  if (isConfirm) {
    await db.run('UPDATE destinations SET confirmed = 0', [])
  }
  await db.run(
    'UPDATE destinations SET name=?, subtitle=?, emoji=?, distance_km=?, duration_hrs=?, tags=?, confirmed=?, notes=? WHERE id=?',
    [
      name         ?? existing.name,
      subtitle     ?? existing.subtitle,
      emoji        ?? existing.emoji,
      distance_km  ?? existing.distance_km,
      duration_hrs ?? existing.duration_hrs,
      JSON.stringify(tags ?? JSON.parse(existing.tags || '[]')),
      isConfirm ? 1 : (confirmed === false || confirmed === 0) ? 0 : existing.confirmed,
      notes !== undefined ? notes : existing.notes,
      id,
    ]
  )

  const d = await db.get('SELECT * FROM destinations WHERE id = ?', [id])
  return c.json(parseDest(d!))
})

destinations.delete('/:id', requireAuth, async (c) => {
  const { changes } = await db.run('DELETE FROM destinations WHERE id = ?', [c.req.param('id')])
  if (changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

// Clone a destination with all its sections and items
destinations.post('/:id/clone', requireAuth, async (c) => {
  const id = c.req.param('id')
  const d  = await db.get('SELECT * FROM destinations WHERE id = ?', [id])
  if (!d) return c.json({ error: 'Not found' }, 404)

  const { lastInsertRowid: newDestId } = await db.run(
    'INSERT INTO destinations (name, subtitle, emoji, distance_km, duration_hrs, tags, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [`${d.name} (Copy)`, d.subtitle, d.emoji, d.distance_km, d.duration_hrs, d.tags, d.notes ?? null]
  )

  const secs = await db.all(
    'SELECT * FROM sections WHERE destination_id = ? ORDER BY sort_order ASC, id ASC',
    [id]
  )

  for (const s of secs) {
    const { lastInsertRowid: newSecId } = await db.run(
      'INSERT INTO sections (destination_id, type, title, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
      [newDestId, s.type, s.title, s.icon, s.sort_order]
    )
    const its = await db.all(
      'SELECT * FROM items WHERE section_id = ? ORDER BY sort_order ASC, id ASC',
      [s.id]
    )
    if (its.length > 0) {
      await db.batch(its.map(item => ({
        sql: 'INSERT INTO items (section_id, item_type, text, note, tag, tag_color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [newSecId, item.item_type, item.text, item.note, item.tag, item.tag_color, item.sort_order],
      })))
    }
  }

  const newDest = await db.get('SELECT * FROM destinations WHERE id = ?', [newDestId])
  return c.json(parseDest(newDest!), 201)
})

// Reorder sections: POST /api/destinations/:id/sections/reorder  [{id, sort_order}]
destinations.post('/:id/sections/reorder', requireAuth, async (c) => {
  const payload = await c.req.json<Array<{ id: number; sort_order: number }>>()
  await db.batch(payload.map(({ id, sort_order }) => ({
    sql: 'UPDATE sections SET sort_order = ? WHERE id = ?',
    args: [sort_order, id],
  })))
  return c.json({ ok: true })
})

// Nested: POST /api/destinations/:id/sections
destinations.post('/:id/sections', requireAuth, async (c) => {
  const destId = c.req.param('id')
  if (!(await db.get('SELECT id FROM destinations WHERE id = ?', [destId]))) {
    return c.json({ error: 'Destination not found' }, 404)
  }
  const { type, title, icon, sort_order } = await c.req.json()
  const { lastInsertRowid } = await db.run(
    'INSERT INTO sections (destination_id, type, title, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
    [destId, type ?? 'custom', title, icon, sort_order ?? 0]
  )

  const section: Row = await db.get('SELECT * FROM sections WHERE id = ?', [lastInsertRowid]) ?? {}
  section.items = []
  return c.json(section, 201)
})

export default destinations
