import { Hono } from 'hono'
import { db } from '../db'

const checklist = new Hono()

// GET /api/checklist/:destId?device_id=xxx  → { itemId: boolean }
checklist.get('/:destId', (c) => {
  const destId  = c.req.param('destId')
  const deviceId = c.req.query('device_id')
  if (!deviceId) return c.json({ error: 'device_id required' }, 400)

  const itemRows = db.prepare(`
    SELECT i.id FROM items i
    JOIN sections s ON i.section_id = s.id
    WHERE s.destination_id = ?
  `).all(destId) as Array<{ id: number }>

  if (itemRows.length === 0) return c.json({})

  const ids = itemRows.map(r => r.id)
  const placeholders = ids.map(() => '?').join(',')
  const rows = db.prepare(
    `SELECT item_id, checked FROM checklist_state WHERE device_id = ? AND item_id IN (${placeholders})`
  ).all(deviceId, ...ids) as Array<{ item_id: number; checked: number }>

  const state: Record<string, boolean> = {}
  for (const r of rows) state[r.item_id] = r.checked === 1
  return c.json(state)
})

// PUT /api/checklist/:itemId  { device_id, checked }
checklist.put('/:itemId', async (c) => {
  const itemId   = parseInt(c.req.param('itemId'))
  const { device_id, checked } = await c.req.json<{ device_id: string; checked: boolean }>()
  if (!device_id) return c.json({ error: 'device_id required' }, 400)

  db.prepare(`
    INSERT INTO checklist_state (device_id, item_id, checked, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(device_id, item_id) DO UPDATE
      SET checked = excluded.checked, updated_at = excluded.updated_at
  `).run(device_id, itemId, checked ? 1 : 0)

  return c.json({ ok: true })
})

export default checklist
