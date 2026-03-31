import { Hono } from 'hono'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

const sections = new Hono()

sections.put('/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const existing = await db.get('SELECT * FROM sections WHERE id = ?', [id])
  if (!existing) return c.json({ error: 'Not found' }, 404)

  const { title, icon, sort_order } = await c.req.json()
  await db.run('UPDATE sections SET title=?, icon=?, sort_order=? WHERE id=?', [
    title      ?? existing.title,
    icon       ?? existing.icon,
    sort_order ?? existing.sort_order,
    id,
  ])
  return c.json(await db.get('SELECT * FROM sections WHERE id = ?', [id]))
})

sections.delete('/:id', requireAuth, async (c) => {
  const { changes } = await db.run('DELETE FROM sections WHERE id = ?', [c.req.param('id')])
  if (changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

// Reorder items within a section: POST /api/sections/:id/items/reorder  [{id, sort_order}]
sections.post('/:id/items/reorder', requireAuth, async (c) => {
  const payload = await c.req.json<Array<{ id: number; sort_order: number }>>()
  await db.batch(payload.map(({ id, sort_order }) => ({
    sql: 'UPDATE items SET sort_order = ? WHERE id = ?',
    args: [sort_order, id],
  })))
  return c.json({ ok: true })
})

// Nested: POST /api/sections/:id/items
sections.post('/:id/items', requireAuth, async (c) => {
  const sectionId = c.req.param('id')
  if (!(await db.get('SELECT id FROM sections WHERE id = ?', [sectionId]))) {
    return c.json({ error: 'Section not found' }, 404)
  }
  const { item_type, text, note, tag, tag_color, sort_order } = await c.req.json()
  const { lastInsertRowid } = await db.run(
    'INSERT INTO items (section_id, item_type, text, note, tag, tag_color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [sectionId, item_type ?? 'check', text, note, tag, tag_color ?? '', sort_order ?? 0]
  )
  return c.json(await db.get('SELECT * FROM items WHERE id = ?', [lastInsertRowid]), 201)
})

export default sections
