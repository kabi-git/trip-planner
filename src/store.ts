// ── Types ────────────────────────────────────────────────────────────────────

export type Destination = {
  id: number
  name: string
  subtitle: string | null
  emoji: string | null
  distance_km: number | null
  duration_hrs: string | null
  tags: string[]
  confirmed: boolean
  created_at: string
  notes: string | null
}

export type Section = {
  id: number
  destination_id: number
  type: string
  title: string
  icon: string | null
  sort_order: number
}

export type Item = {
  id: number
  section_id: number
  item_type: string
  text: string
  note: string | null
  tag: string | null
  tag_color: string
  sort_order: number
}

export type Session = { token: string; role: string }

// ── Seed data ────────────────────────────────────────────────────────────────

const SEED_DESTINATIONS: Destination[] = [
  {
    id: 1, name: 'Vagamon', subtitle: 'Ghats · Monsoon · Pine Forests · Kurisimala',
    emoji: '🏔️', distance_km: 240, duration_hrs: '6–7 hrs (split across 2 legs)',
    tags: ['GHATS', 'MONSOON', 'TREK', 'ADVENTURE', 'NIGHT RIDE'],
    confirmed: false, created_at: '2026-03-30T01:30:37Z',
    notes: '2-day overnight trip. Depart 02 Jul 2026 at 6:00 PM from office.\nLeg 1: Office (MachDatum) → Thrissur (night stay)\nLeg 2: Thrissur → Vagamon (night ride, 3:00 AM)\nBike: Pulsar N 150 — Kabi & Deva\nHotels: TBD (see Stay Options section)\nDay 3: Kurisimala trek → depart straight home.',
  },
  {
    id: 2, name: 'Wayanad', subtitle: 'Forests · Waterfalls · Wildlife',
    emoji: '🌿', distance_km: 350, duration_hrs: '8–9 hrs one way',
    tags: ['FOREST', 'WATERFALLS', 'WILDLIFE', 'LONG RIDE'],
    confirmed: false, created_at: '2026-03-30T01:30:37Z', notes: null,
  },
]

const SEED_SECTIONS: Section[] = [
  { id: 1, destination_id: 1, type: 'route',      title: 'Route + Speed Zones',        icon: '🛣️', sort_order: 0 },
  { id: 2, destination_id: 1, type: 'checklist',  title: 'Safety Checklist',           icon: '✅', sort_order: 1 },
  { id: 3, destination_id: 1, type: 'hotels',     title: 'Stay Options',               icon: '🏨', sort_order: 2 },
  { id: 4, destination_id: 1, type: 'activities', title: 'Activities + Weather Notes', icon: '🏔️', sort_order: 3 },
  { id: 5, destination_id: 2, type: 'checklist',  title: 'Planning Notes',             icon: '📝', sort_order: 0 },
]

const SEED_ITEMS: Item[] = [
  // ── Route stops (section 1) ──
  { id: 1,  section_id: 1, item_type: 'route_stop', text: 'Ondipudur → Palakkad',    note: 'Full tank. Highway. Night trucks — stay left.',   tag: 'Highway · 60–70 km/h',  tag_color: 'green', sort_order: 0 },
  { id: 2,  section_id: 1, item_type: 'route_stop', text: 'Palakkad → Thrissur',     note: 'Refuel at Palakkad. Tea + stretch.',              tag: 'State roads · 50–60 km/h', tag_color: 'green', sort_order: 1 },
  { id: 3,  section_id: 1, item_type: 'route_stop', text: 'Thrissur — Sleep Stop',   note: 'Minimum 2–3 hrs sleep. Book lodge in advance.',  tag: 'Non-negotiable rest',   tag_color: 'red',   sort_order: 2 },
  { id: 4,  section_id: 1, item_type: 'route_stop', text: 'Thrissur → Thodupuzha',   note: 'Top up fuel here. Last stop before ghats.',      tag: 'Critical fuel stop',    tag_color: 'red',   sort_order: 3 },
  { id: 5,  section_id: 1, item_type: 'route_stop', text: 'Ghat section → Vagamon',  note: '20–25 km/h with pillion. Narrow + steep + wet.', tag: 'Ghats · 20–25 km/h',   tag_color: 'red',   sort_order: 4 },
  { id: 6,  section_id: 1, item_type: 'route_stop', text: 'Return: Vagamon → Home',  note: '240 km. Break every 70–80 km. Start before 3 PM.', tag: 'Watch fatigue',       tag_color: 'amber', sort_order: 5 },
  // ── Safety checklist (section 2) ──
  { id: 7,  section_id: 2, item_type: 'check', text: 'Chain cleaned + lubed',                     note: 'Do this the day before.',                        tag: null,             tag_color: '',      sort_order: 0 },
  { id: 8,  section_id: 2, item_type: 'check', text: 'Brake pads ≥ 50% life',                     note: null,                                             tag: 'critical',       tag_color: 'red',   sort_order: 1 },
  { id: 9,  section_id: 2, item_type: 'check', text: 'Tyre pressure set correctly',               note: 'Slightly lower rear helps wet grip.',            tag: null,             tag_color: '',      sort_order: 2 },
  { id: 10, section_id: 2, item_type: 'check', text: 'Both headlight + tail light working',       note: null,                                             tag: null,             tag_color: '',      sort_order: 3 },
  { id: 11, section_id: 2, item_type: 'check', text: 'Full tank at departure',                    note: 'Refuel: Palakkad → Thrissur → Thodupuzha',      tag: null,             tag_color: '',      sort_order: 4 },
  { id: 12, section_id: 2, item_type: 'check', text: 'Full-face helmet — both',                   note: null,                                             tag: 'non-negotiable', tag_color: 'red',   sort_order: 5 },
  { id: 13, section_id: 2, item_type: 'check', text: 'Rain poncho / jacket — both',               note: 'Pack accessible, not buried in bag.',            tag: null,             tag_color: '',      sort_order: 6 },
  { id: 14, section_id: 2, item_type: 'check', text: 'Offline maps downloaded — full route',      note: 'No signal in ghat zones.',                       tag: 'critical',       tag_color: 'red',   sort_order: 7 },
  { id: 15, section_id: 2, item_type: 'check', text: 'Share live location with someone at home',  note: 'WhatsApp live location, full trip.',             tag: 'critical',       tag_color: 'red',   sort_order: 8 },
  { id: 16, section_id: 2, item_type: 'check', text: 'RC + DL + Insurance — physical copies',     note: 'Kerala checkposts are active.',                  tag: null,             tag_color: '',      sort_order: 9 },
  { id: 17, section_id: 2, item_type: 'check', text: 'Puncture kit + basic toolkit',              note: 'Remote ghat roads — no shops.',                  tag: null,             tag_color: '',      sort_order: 10 },
  { id: 18, section_id: 2, item_type: 'never', text: 'Overtake on blind curves or in heavy rain', note: null,                                             tag: null,             tag_color: '',      sort_order: 11 },
  { id: 19, section_id: 2, item_type: 'never', text: 'Skip Thrissur sleep stop to save time',     note: null,                                             tag: null,             tag_color: '',      sort_order: 12 },
  { id: 20, section_id: 2, item_type: 'never', text: 'Ride in sandals or open footwear',          note: null,                                             tag: null,             tag_color: '',      sort_order: 13 },
  // ── Stay options (section 3) ──
  { id: 21, section_id: 3, item_type: 'check', text: 'Couple-friendly — confirm before booking',      note: 'Call ahead. Some homestays ask for marriage proof.', tag: 'important', tag_color: 'amber', sort_order: 0 },
  { id: 22, section_id: 3, item_type: 'check', text: 'Inside / covered parking for bike',             note: 'No outside parking in July monsoon.',               tag: 'important', tag_color: 'amber', sort_order: 1 },
  { id: 23, section_id: 3, item_type: 'check', text: 'Lit road access to property',                   note: 'Check on maps before booking.',                     tag: null,        tag_color: '',      sort_order: 2 },
  { id: 24, section_id: 3, item_type: 'check', text: 'Book in advance — July is peak monsoon season', note: 'Last-minute availability very low.',                tag: 'critical',  tag_color: 'red',   sort_order: 3 },
  // ── Activities (section 4) ──
  { id: 25, section_id: 4, item_type: 'check', text: 'Kurisumala Trek — grip shoes mandatory',    note: 'Wet grass on slopes. Early morning window best.',  tag: 'important',    tag_color: 'amber', sort_order: 0 },
  { id: 26, section_id: 4, item_type: 'check', text: 'Trek only in dry window — avoid if raining', note: 'Check sky before starting.',                      tag: null,           tag_color: '',      sort_order: 1 },
  { id: 27, section_id: 4, item_type: 'check', text: 'Paragliding — check wind/weather on site',  note: 'July = 70–80% cancellation chance.',              tag: 'check on-site', tag_color: 'amber', sort_order: 2 },
  { id: 28, section_id: 4, item_type: 'check', text: 'Adventure park — 9 AM to 5 PM',             note: 'Cancel if rain or wind picks up.',                 tag: null,           tag_color: '',      sort_order: 3 },
  { id: 29, section_id: 4, item_type: 'check', text: 'Plan return ride to start before 3–4 PM',   note: 'Post-activity 240 km in dark = high risk.',       tag: 'strict',       tag_color: 'red',   sort_order: 4 },
  // ── Wayanad planning notes (section 5) ──
  { id: 30, section_id: 5, item_type: 'info', text: 'Route via Coimbatore → Palakkad → Mannarkkad → Wayanad', note: 'Check ghat road conditions before planning.', tag: null,       tag_color: '',      sort_order: 0 },
  { id: 31, section_id: 5, item_type: 'info', text: '350 km one way — consider overnight stop',               note: 'Longer than Vagamon. Plan accordingly.',      tag: 'important', tag_color: 'amber', sort_order: 1 },
]

// ── In-memory state ──────────────────────────────────────────────────────────

let destinations: Destination[] = []
let sections: Section[]         = []
let items: Item[]               = []
let sessions: Session[]         = []
const checklistState            = new Map<string, boolean>() // `${deviceId}:${itemId}` → checked

let nextDestId    = 0
let nextSectionId = 0
let nextItemId    = 0

export function initStore() {
  destinations  = SEED_DESTINATIONS.map(d => ({ ...d, tags: [...d.tags] }))
  sections      = SEED_SECTIONS.map(s => ({ ...s }))
  items         = SEED_ITEMS.map(i => ({ ...i }))
  sessions      = []
  checklistState.clear()

  nextDestId    = Math.max(...destinations.map(d => d.id), 0)
  nextSectionId = Math.max(...sections.map(s => s.id), 0)
  nextItemId    = Math.max(...items.map(i => i.id), 0)
}

// ── Store API ────────────────────────────────────────────────────────────────

export const store = {

  destinations: {
    all(q?: string, sort?: string): Destination[] {
      let list = [...destinations]
      if (q) {
        const lq = q.toLowerCase()
        list = list.filter(d =>
          d.name.toLowerCase().includes(lq) ||
          (d.subtitle ?? '').toLowerCase().includes(lq)
        )
      }
      switch (sort) {
        case 'name':     list.sort((a, b) => a.name.localeCompare(b.name)); break
        case 'distance': list.sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0)); break
        case 'duration': list.sort((a, b) => (a.duration_hrs ?? '').localeCompare(b.duration_hrs ?? '')); break
        default:         list.sort((a, b) => a.id - b.id)
      }
      return list
    },

    get(id: number): Destination | null {
      return destinations.find(d => d.id === id) ?? null
    },

    create(data: Omit<Destination, 'id' | 'confirmed' | 'created_at'>): Destination {
      const d: Destination = {
        ...data, id: ++nextDestId, confirmed: false,
        created_at: new Date().toISOString(),
      }
      destinations.push(d)
      return d
    },

    update(id: number, patch: Partial<Destination>): Destination | null {
      const idx = destinations.findIndex(d => d.id === id)
      if (idx === -1) return null
      if (patch.confirmed === true) destinations.forEach(d => (d.confirmed = false))
      destinations[idx] = { ...destinations[idx], ...patch }
      return destinations[idx]
    },

    delete(id: number): boolean {
      const idx = destinations.findIndex(d => d.id === id)
      if (idx === -1) return false
      const sids = sections.filter(s => s.destination_id === id).map(s => s.id)
      items    = items.filter(i => !sids.includes(i.section_id))
      sections = sections.filter(s => s.destination_id !== id)
      destinations.splice(idx, 1)
      return true
    },

    withSections(id: number) {
      const d = store.destinations.get(id)
      if (!d) return null
      const secs = store.sections.allForDest(id)
      return { ...d, sections: secs.map(s => ({ ...s, items: store.items.allForSection(s.id) })) }
    },
  },

  sections: {
    allForDest(destId: number): Section[] {
      return sections
        .filter(s => s.destination_id === destId)
        .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
    },

    get(id: number): Section | null {
      return sections.find(s => s.id === id) ?? null
    },

    create(data: Omit<Section, 'id'>): Section {
      const s: Section = { ...data, id: ++nextSectionId }
      sections.push(s)
      return s
    },

    update(id: number, patch: Partial<Section>): Section | null {
      const idx = sections.findIndex(s => s.id === id)
      if (idx === -1) return null
      sections[idx] = { ...sections[idx], ...patch }
      return sections[idx]
    },

    delete(id: number): boolean {
      const idx = sections.findIndex(s => s.id === id)
      if (idx === -1) return false
      items = items.filter(i => i.section_id !== id)
      sections.splice(idx, 1)
      return true
    },

    reorder(payload: Array<{ id: number; sort_order: number }>) {
      for (const { id, sort_order } of payload) {
        const s = sections.find(s => s.id === id)
        if (s) s.sort_order = sort_order
      }
    },
  },

  items: {
    allForSection(sectionId: number): Item[] {
      return items
        .filter(i => i.section_id === sectionId)
        .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
    },

    allForDest(destId: number): Item[] {
      const sids = new Set(sections.filter(s => s.destination_id === destId).map(s => s.id))
      return items.filter(i => sids.has(i.section_id))
    },

    get(id: number): Item | null {
      return items.find(i => i.id === id) ?? null
    },

    create(data: Omit<Item, 'id'>): Item {
      const item: Item = { ...data, id: ++nextItemId }
      items.push(item)
      return item
    },

    update(id: number, patch: Partial<Item>): Item | null {
      const idx = items.findIndex(i => i.id === id)
      if (idx === -1) return null
      items[idx] = { ...items[idx], ...patch }
      return items[idx]
    },

    delete(id: number): boolean {
      const idx = items.findIndex(i => i.id === id)
      if (idx === -1) return false
      items.splice(idx, 1)
      return true
    },

    reorder(payload: Array<{ id: number; sort_order: number }>) {
      for (const { id, sort_order } of payload) {
        const item = items.find(i => i.id === id)
        if (item) item.sort_order = sort_order
      }
    },
  },

  sessions: {
    create(token: string, role: string) {
      sessions.push({ token, role })
    },
    get(token: string): Session | null {
      return sessions.find(s => s.token === token) ?? null
    },
    delete(token: string) {
      sessions = sessions.filter(s => s.token !== token)
    },
  },

  checklist: {
    getForDest(destId: number, deviceId: string): Record<number, boolean> {
      const destItems = store.items.allForDest(destId)
      const result: Record<number, boolean> = {}
      for (const item of destItems) {
        const v = checklistState.get(`${deviceId}:${item.id}`)
        if (v !== undefined) result[item.id] = v
      }
      return result
    },
    set(deviceId: string, itemId: number, checked: boolean) {
      checklistState.set(`${deviceId}:${itemId}`, checked)
    },
  },
}
