import { Hono } from 'hono'
import { initDb } from './db'
import { seed } from './seed'
import authRoutes from './routes/auth'
import destRoutes from './routes/destinations'
import sectionRoutes from './routes/sections'
import itemRoutes from './routes/items'
import checklistRoutes from './routes/checklist'

export async function createApp() {
  await initDb()
  await seed()

  const app = new Hono()

  app.onError((err, c) => {
    console.error(err)
    return c.json({ error: err.message }, 500)
  })

  app.route('/api/auth',         authRoutes)
  app.route('/api/destinations', destRoutes)
  app.route('/api/sections',     sectionRoutes)
  app.route('/api/items',        itemRoutes)
  app.route('/api/checklist',    checklistRoutes)

  return app
}
