import { Hono } from 'hono'
import { store } from '../store'
import { requireAuth } from '../middleware/auth'

const items = new Hono()

items.put('/:id', requireAuth, async (c) => {
  const id = Number(c.req.param('id'))
  const { item_type, text, note, tag, tag_color } = await c.req.json()
  const item = store.items.update(id, {
    ...(item_type !== undefined && { item_type }),
    ...(text      !== undefined && { text }),
    ...(note      !== undefined && { note }),
    ...(tag       !== undefined && { tag }),
    ...(tag_color !== undefined && { tag_color }),
  })
  if (!item) return c.json({ error: 'Not found' }, 404)
  return c.json(item)
})

items.delete('/:id', requireAuth, async (c) => {
  if (!store.items.delete(Number(c.req.param('id'))))
    return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

export default items
