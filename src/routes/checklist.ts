import { Hono } from 'hono'
import { store } from '../store'

const checklist = new Hono()

checklist.get('/:destId', async (c) => {
  const deviceId = c.req.query('device_id')
  if (!deviceId) return c.json({ error: 'device_id required' }, 400)
  return c.json(store.checklist.getForDest(Number(c.req.param('destId')), deviceId))
})

checklist.put('/:itemId', async (c) => {
  const { device_id, checked } = await c.req.json<{ device_id: string; checked: boolean }>()
  if (!device_id) return c.json({ error: 'device_id required' }, 400)
  store.checklist.set(device_id, Number(c.req.param('itemId')), !!checked)
  return c.json({ ok: true })
})

export default checklist
