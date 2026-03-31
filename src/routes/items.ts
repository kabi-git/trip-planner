import { Hono } from 'hono'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

const items = new Hono()

items.put('/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const existing = await db.get('SELECT * FROM items WHERE id = ?', [id])
  if (!existing) return c.json({ error: 'Not found' }, 404)

  const { item_type, text, note, tag, tag_color } = await c.req.json()
  await db.run(
    'UPDATE items SET item_type=?, text=?, note=?, tag=?, tag_color=? WHERE id=?',
    [
      item_type ?? existing.item_type,
      text      ?? existing.text,
      note      ?? existing.note,
      tag       ?? existing.tag,
      tag_color ?? existing.tag_color,
      id,
    ]
  )
  return c.json(await db.get('SELECT * FROM items WHERE id = ?', [id]))
})

items.delete('/:id', requireAuth, async (c) => {
  const { changes } = await db.run('DELETE FROM items WHERE id = ?', [c.req.param('id')])
  if (changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

export default items
