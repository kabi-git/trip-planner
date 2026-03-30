import { Hono } from 'hono'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

type Row = Record<string, unknown>

const items = new Hono()

items.put('/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id) as Row | null
  if (!existing) return c.json({ error: 'Not found' }, 404)

  const { item_type, text, note, tag, tag_color } = await c.req.json()
  db.prepare(
    'UPDATE items SET item_type=?, text=?, note=?, tag=?, tag_color=? WHERE id=?'
  ).run(
    item_type ?? existing.item_type,
    text      ?? existing.text,
    note      ?? existing.note,
    tag       ?? existing.tag,
    tag_color ?? existing.tag_color,
    id
  )
  return c.json(db.prepare('SELECT * FROM items WHERE id = ?').get(id))
})

items.delete('/:id', requireAuth, (c) => {
  const { changes } = db.prepare('DELETE FROM items WHERE id = ?').run(c.req.param('id'))
  if (changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

export default items
