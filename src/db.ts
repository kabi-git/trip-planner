import { Database } from 'bun:sqlite'
import { mkdirSync } from 'fs'
import path from 'path'

const dbPath = process.env.DB_PATH ?? path.join(import.meta.dir, '../data/trips.db')

mkdirSync(path.dirname(dbPath), { recursive: true })

export const db = new Database(dbPath, { create: true })

db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS destinations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    subtitle    TEXT,
    emoji       TEXT,
    distance_km INTEGER,
    duration_hrs TEXT,
    tags        TEXT NOT NULL DEFAULT '[]',
    confirmed   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sections (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    type           TEXT NOT NULL DEFAULT 'custom',
    title          TEXT NOT NULL,
    icon           TEXT,
    sort_order     INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    item_type  TEXT NOT NULL DEFAULT 'check',
    text       TEXT NOT NULL,
    note       TEXT,
    tag        TEXT,
    tag_color  TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`)
