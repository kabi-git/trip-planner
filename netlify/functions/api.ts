import { createApp } from '../../src/app'

// Cached across warm invocations
let appFetch: ((req: Request) => Promise<Response>) | null = null

async function getAppFetch() {
  if (!appFetch) {
    const app = await createApp()
    appFetch = app.fetch.bind(app)
  }
  return appFetch
}

export default async (req: Request): Promise<Response> => {
  const fetch = await getAppFetch()
  return fetch(req)
}

export const config = { path: '/api/*' }
