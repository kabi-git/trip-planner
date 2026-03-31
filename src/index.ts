import { serveStatic } from 'hono/bun'
import { createApp } from './app'

const app = await createApp()

// Static files (public/)
app.use('/*', serveStatic({ root: './public' }))

// SPA fallback → index.html
app.get('*', async (c) => c.html(await Bun.file('./public/index.html').text()))

const port = Number(process.env.PORT) || 3000
console.log(`Trip Planner running on http://localhost:${port}`)

export default { port, fetch: app.fetch }
