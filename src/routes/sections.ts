import { Hono } from 'hono'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

type Row = Record<string, unknown>

const sections = new Hono()

sections.put('/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const existing = db.prepare('SELECT * FROM sections WHERE id = ?').get(id) as Row | null
  if (!existing) return c.json({ error: 'Not found' }, 404)

  const { title, icon } = await c.req.json()
  db.prepare('UPDATE sections SET title=?, icon=? WHERE id=?').run(
    title ?? existing.title,
    icon  ?? existing.icon,
    id
  )
  return c.json(db.prepare('SELECT * FROM sections WHERE id = ?').get(id))
})

sections.delete('/:id', requireAuth, (c) => {
  const { changes } = db.prepare('DELETE FROM sections WHERE id = ?').run(c.req.param('id'))
  if (changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

// Nested: POST /api/sections/:id/items
sections.post('/:id/items', requireAuth, async (c) => {
  const sectionId = c.req.param('id')
  if (!db.prepare('SELECT id FROM sections WHERE id = ?').get(sectionId)) {
    return c.json({ error: 'Section not found' }, 404)
  }
  const { item_type, text, note, tag, tag_color, sort_order } = await c.req.json()
  const { lastInsertRowid } = db.prepare(
    'INSERT INTO items (section_id, item_type, text, note, tag, tag_color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(sectionId, item_type ?? 'check', text, note, tag, tag_color ?? '', sort_order ?? 0)

  return c.json(db.prepare('SELECT * FROM items WHERE id = ?').get(lastInsertRowid), 201)
})

export default sections
