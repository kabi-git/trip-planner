import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { seed } from './seed'
import authRoutes from './routes/auth'
import destRoutes from './routes/destinations'
import sectionRoutes from './routes/sections'
import itemRoutes from './routes/items'
import checklistRoutes from './routes/checklist'

seed()

const app = new Hono()

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: err.message }, 500)
})

// API
app.route('/api/auth',         authRoutes)
app.route('/api/destinations', destRoutes)
app.route('/api/sections',     sectionRoutes)
app.route('/api/items',        itemRoutes)
app.route('/api/checklist',    checklistRoutes)

// Static files (public/)
app.use('/*', serveStatic({ root: './public' }))

// SPA fallback → index.html
app.get('*', async (c) => c.html(await Bun.file('./public/index.html').text()))

const port = Number(process.env.PORT) || 3000
console.log(`Trip Planner running on http://localhost:${port}`)

export default { port, fetch: app.fetch }
