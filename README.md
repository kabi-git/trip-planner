# Trip Planner — Kabi & Deva

A self-hosted anniversary bike trip planner for July 5th. Compare destinations, manage safety checklists, plan routes, and confirm the final pick.

## Deploy

```bash
cd trip-planner

# Optional: change the password
# Edit ADMIN_PASSWORD in docker-compose.yml

docker compose up -d
```

Open `http://<your-proxmox-ip>:3000`

## Usage

| User | Access |
|------|--------|
| Kabi | Click **EDIT** badge → enter password → full edit mode (add/edit/delete destinations, sections, items, confirm trip) |
| Deva | View everything, tick checklist items (saved per device, no login needed) |

## Item Types

| Type | Display | Use for |
|------|---------|---------|
| `check` | Checkbox (ticks green) | Safety checklist, packing list, hotel criteria |
| `never` | Red ✕ | Hard rules / things to never do |
| `route_stop` | Colored dot + speed tag | Route waypoints with speed zones |
| `info` | Blue ℹ | Notes, planning info, no action needed |

## Reset (wipe data and re-seed)

```bash
docker compose down -v && docker compose up -d
```

## Stack

- **Backend**: Node.js + Express + better-sqlite3
- **Frontend**: Single `public/index.html` — vanilla JS, no build step
- **DB**: SQLite at `data/trips.db` (persisted via Docker volume)
- **Port**: 3000
