import { Hono } from 'hono'
import { store } from '../store'
import { requireAuth } from '../middleware/auth'

const sections = new Hono()

sections.put('/:id', requireAuth, async (c) => {
  const id = Number(c.req.param('id'))
  const { title, icon, sort_order } = await c.req.json()
  const s = store.sections.update(id, {
    ...(title      !== undefined && { title }),
    ...(icon       !== undefined && { icon }),
    ...(sort_order !== undefined && { sort_order }),
  })
  if (!s) return c.json({ error: 'Not found' }, 404)
  return c.json(s)
})

sections.delete('/:id', requireAuth, async (c) => {
  if (!store.sections.delete(Number(c.req.param('id'))))
    return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

sections.post('/:id/items/reorder', requireAuth, async (c) => {
  const payload = await c.req.json<Array<{ id: number; sort_order: number }>>()
  store.items.reorder(payload)
  return c.json({ ok: true })
})

sections.post('/:id/items', requireAuth, async (c) => {
  const sectionId = Number(c.req.param('id'))
  if (!store.sections.get(sectionId)) return c.json({ error: 'Section not found' }, 404)
  const { item_type, text, note, tag, tag_color, sort_order } = await c.req.json()
  const item = store.items.create({ section_id: sectionId, item_type: item_type ?? 'check', text, note: note ?? null, tag: tag ?? null, tag_color: tag_color ?? '', sort_order: sort_order ?? 0 })
  return c.json(item, 201)
})

export default sections
