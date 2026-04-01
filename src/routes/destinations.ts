import { Hono } from 'hono'
import { store } from '../store'
import { requireAuth } from '../middleware/auth'

const destinations = new Hono()

destinations.get('/', async (c) => {
  const q    = c.req.query('q')
  const sort = c.req.query('sort')
  return c.json(store.destinations.all(q, sort))
})

destinations.get('/:id', async (c) => {
  const d = store.destinations.withSections(Number(c.req.param('id')))
  if (!d) return c.json({ error: 'Not found' }, 404)
  return c.json(d)
})

destinations.post('/', requireAuth, async (c) => {
  const { name, subtitle, emoji, distance_km, duration_hrs, tags, notes } = await c.req.json()
  if (!name) return c.json({ error: 'name required' }, 400)
  const d = store.destinations.create({ name, subtitle: subtitle ?? null, emoji: emoji ?? null, distance_km: distance_km ?? null, duration_hrs: duration_hrs ?? null, tags: tags ?? [], notes: notes ?? null })
  return c.json(d, 201)
})

destinations.put('/:id', requireAuth, async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const patch: Record<string, any> = {}
  if (body.name         !== undefined) patch.name         = body.name
  if (body.subtitle     !== undefined) patch.subtitle     = body.subtitle
  if (body.emoji        !== undefined) patch.emoji        = body.emoji
  if (body.distance_km  !== undefined) patch.distance_km  = body.distance_km
  if (body.duration_hrs !== undefined) patch.duration_hrs = body.duration_hrs
  if (body.tags         !== undefined) patch.tags         = body.tags
  if (body.notes        !== undefined) patch.notes        = body.notes
  if (body.confirmed    !== undefined) patch.confirmed    = body.confirmed === true || body.confirmed === 1

  const d = store.destinations.update(id, patch)
  if (!d) return c.json({ error: 'Not found' }, 404)
  return c.json(d)
})

destinations.delete('/:id', requireAuth, async (c) => {
  if (!store.destinations.delete(Number(c.req.param('id'))))
    return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

destinations.post('/:id/clone', requireAuth, async (c) => {
  const orig = store.destinations.withSections(Number(c.req.param('id')))
  if (!orig) return c.json({ error: 'Not found' }, 404)

  const newDest = store.destinations.create({
    name: `${orig.name} (Copy)`, subtitle: orig.subtitle, emoji: orig.emoji,
    distance_km: orig.distance_km, duration_hrs: orig.duration_hrs,
    tags: [...orig.tags], notes: orig.notes,
  })

  for (const s of orig.sections) {
    const newSec = store.sections.create({ destination_id: newDest.id, type: s.type, title: s.title, icon: s.icon, sort_order: s.sort_order })
    for (const item of s.items) {
      store.items.create({ section_id: newSec.id, item_type: item.item_type, text: item.text, note: item.note, tag: item.tag, tag_color: item.tag_color, sort_order: item.sort_order })
    }
  }

  return c.json(newDest, 201)
})

destinations.post('/:id/sections/reorder', requireAuth, async (c) => {
  const payload = await c.req.json<Array<{ id: number; sort_order: number }>>()
  store.sections.reorder(payload)
  return c.json({ ok: true })
})

destinations.post('/:id/sections', requireAuth, async (c) => {
  const destId = Number(c.req.param('id'))
  if (!store.destinations.get(destId)) return c.json({ error: 'Destination not found' }, 404)
  const { type, title, icon, sort_order } = await c.req.json()
  const s = store.sections.create({ destination_id: destId, type: type ?? 'custom', title, icon: icon ?? null, sort_order: sort_order ?? 0 })
  return c.json({ ...s, items: [] }, 201)
})

export default destinations
