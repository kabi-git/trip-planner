import { createClient, type Client } from '@libsql/client'

let _client: Client | null = null

function client(): Client {
  if (!_client) {
    _client = createClient({
      url:       process.env.TURSO_URL       ?? 'file:./data/trips.db',
      authToken: process.env.TURSO_TOKEN,
    })
  }
  return _client
}

// Convert a libSQL Row (array-like + named props) to a plain object
function rowToObj(columns: readonly string[], row: any): Record<string, any> {
  const obj: Record<string, any> = {}
  for (const col of columns) obj[col] = row[col]
  return obj
}

export async function initDb() {
  const c = client()

  // Create tables (each statement separate — libSQL doesn't allow multi-statement)
  await c.batch([
    { sql: `CREATE TABLE IF NOT EXISTS destinations (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      subtitle     TEXT,
      emoji        TEXT,
      distance_km  INTEGER,
      duration_hrs TEXT,
      tags         TEXT NOT NULL DEFAULT '[]',
      confirmed    INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    )` },
    { sql: `CREATE TABLE IF NOT EXISTS sections (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
      type           TEXT NOT NULL DEFAULT 'custom',
      title          TEXT NOT NULL,
      icon           TEXT,
      sort_order     INTEGER NOT NULL DEFAULT 0
    )` },
    { sql: `CREATE TABLE IF NOT EXISTS items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
      item_type  TEXT NOT NULL DEFAULT 'check',
      text       TEXT NOT NULL,
      note       TEXT,
      tag        TEXT,
      tag_color  TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    )` },
    { sql: `CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )` },
    { sql: `CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      role       TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )` },
    { sql: `CREATE TABLE IF NOT EXISTS checklist_state (
      device_id  TEXT NOT NULL,
      item_id    INTEGER NOT NULL,
      checked    INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (device_id, item_id)
    )` },
  ], 'write')

  // Migrations — silently skip if column already exists
  for (const sql of [`ALTER TABLE destinations ADD COLUMN notes TEXT`]) {
    try { await c.execute(sql) } catch {}
  }
}

export const db = {
  async all(sql: string, args: any[] = []): Promise<Record<string, any>[]> {
    const r = await client().execute({ sql, args })
    return r.rows.map(row => rowToObj(r.columns, row))
  },

  async get(sql: string, args: any[] = []): Promise<Record<string, any> | null> {
    const r = await client().execute({ sql, args })
    return r.rows[0] ? rowToObj(r.columns, r.rows[0]) : null
  },

  async run(sql: string, args: any[] = []): Promise<{ changes: number; lastInsertRowid: string }> {
    const r = await client().execute({ sql, args })
    return { changes: r.rowsAffected, lastInsertRowid: String(r.lastInsertRowid ?? 0) }
  },

  // Runs multiple statements in one round-trip inside an implicit transaction
  async batch(stmts: Array<{ sql: string; args?: any[] }>): Promise<Array<{ lastInsertRowid: string; changes: number }>> {
    const r = await client().batch(stmts.map(s => ({ sql: s.sql, args: s.args ?? [] })), 'write')
    return r.map(res => ({ lastInsertRowid: String(res.lastInsertRowid ?? 0), changes: res.rowsAffected }))
  },
}
