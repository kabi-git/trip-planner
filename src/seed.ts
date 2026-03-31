import { db } from './db'

export async function seed() {
  const already = await db.get("SELECT value FROM settings WHERE key = 'seeded'")
  if (already) return

  // ── Destination 1: Vagamon ────────────────────────────────────────────
  const { lastInsertRowid: vagamonId } = await db.run(
    `INSERT INTO destinations (name, subtitle, emoji, distance_km, duration_hrs, tags) VALUES (?, ?, ?, ?, ?, ?)`,
    ['Vagamon', 'Ghats · Monsoon · Pine Forests', '🏔️', 240, '6-7 hrs one way',
      JSON.stringify(['GHATS', 'MONSOON', 'PARAGLIDING', 'TREK'])]
  )

  // Insert all sections in one batch, capture their IDs
  const sections = await db.batch([
    { sql: `INSERT INTO sections (destination_id,type,title,icon,sort_order) VALUES (?,?,?,?,?)`,
      args: [vagamonId, 'route', 'Route + Speed Zones', '🛣️', 0] },
    { sql: `INSERT INTO sections (destination_id,type,title,icon,sort_order) VALUES (?,?,?,?,?)`,
      args: [vagamonId, 'checklist', 'Safety Checklist', '✅', 1] },
    { sql: `INSERT INTO sections (destination_id,type,title,icon,sort_order) VALUES (?,?,?,?,?)`,
      args: [vagamonId, 'hotels', 'Stay Options', '🏨', 2] },
    { sql: `INSERT INTO sections (destination_id,type,title,icon,sort_order) VALUES (?,?,?,?,?)`,
      args: [vagamonId, 'activities', 'Activities + Weather Notes', '🏔️', 3] },
  ])
  const [routeId, checklistId, hotelsId, activitiesId] = sections.map(s => s.lastInsertRowid)

  // Insert all items in batches (one batch per section to keep it readable)
  type I = [string, string, string | null, string | null, string]
  const ii = `INSERT INTO items (section_id,item_type,text,note,tag,tag_color,sort_order) VALUES (?,?,?,?,?,?,?)`

  const routeItems: I[] = [
    ['route_stop', 'Ondipudur → Palakkad',   'Full tank. Highway. Night trucks — stay left.',    'Highway · 60–70 km/h',     'green'],
    ['route_stop', 'Palakkad → Thrissur',    'Refuel at Palakkad. Tea + stretch.',                'State roads · 50–60 km/h', 'green'],
    ['route_stop', 'Thrissur — Sleep Stop',  'Minimum 2–3 hrs sleep. Book lodge in advance.',    'Non-negotiable rest',       'red'],
    ['route_stop', 'Thrissur → Thodupuzha',  'Top up fuel here. Last stop before ghats.',        'Critical fuel stop',        'red'],
    ['route_stop', 'Ghat section → Vagamon', '20–25 km/h with pillion. Narrow + steep + wet.',  'Ghats · 20–25 km/h',       'red'],
    ['route_stop', 'Return: Vagamon → Home', '240 km. Break every 70–80 km. Start before 3 PM.','Watch fatigue',             'amber'],
  ]
  await db.batch(routeItems.map(([type, text, note, tag, color], i) =>
    ({ sql: ii, args: [routeId, type, text, note, tag, color, i] })))

  const checkItems: I[] = [
    ['check', 'Chain cleaned + lubed',                       'Do this the day before.',                             null,             ''],
    ['check', 'Brake pads ≥ 50% life',                       null,                                                  'critical',       'red'],
    ['check', 'Tyre pressure set correctly',                  'Slightly lower rear helps wet grip.',                 null,             ''],
    ['check', 'Both headlight + tail light working',          null,                                                  null,             ''],
    ['check', 'Full tank at departure',                       'Refuel: Palakkad → Thrissur → Thodupuzha',           null,             ''],
    ['check', 'Full-face helmet — both',                      null,                                                  'non-negotiable', 'red'],
    ['check', 'Rain poncho / jacket — both',                  'Pack accessible, not buried in bag.',                 null,             ''],
    ['check', 'Offline maps downloaded — full route',         'No signal in ghat zones.',                            'critical',       'red'],
    ['check', 'Share live location with someone at home',     'WhatsApp live location, full trip.',                  'critical',       'red'],
    ['check', 'RC + DL + Insurance — physical copies',        'Kerala checkposts are active.',                       null,             ''],
    ['check', 'Puncture kit + basic toolkit',                 'Remote ghat roads — no shops.',                       null,             ''],
    ['never', 'Overtake on blind curves or in heavy rain',    null,                                                  null,             ''],
    ['never', 'Skip Thrissur sleep stop to save time',        null,                                                  null,             ''],
    ['never', 'Ride in sandals or open footwear',             null,                                                  null,             ''],
  ]
  await db.batch(checkItems.map(([type, text, note, tag, color], i) =>
    ({ sql: ii, args: [checklistId, type, text, note, tag, color, i] })))

  const hotelItems: I[] = [
    ['check', 'Couple-friendly — confirm before booking',       'Call ahead. Some homestays ask for marriage proof.', 'important', 'amber'],
    ['check', 'Inside / covered parking for bike',              'No outside parking in July monsoon.',                'important', 'amber'],
    ['check', 'Lit road access to property',                    'Check on maps before booking.',                      null,        ''],
    ['check', 'Book in advance — July is peak monsoon season',  'Last-minute availability very low.',                 'critical',  'red'],
  ]
  await db.batch(hotelItems.map(([type, text, note, tag, color], i) =>
    ({ sql: ii, args: [hotelsId, type, text, note, tag, color, i] })))

  const actItems: I[] = [
    ['check', 'Kurisumala Trek — grip shoes mandatory',     'Wet grass on slopes. Early morning window best.', 'important',    'amber'],
    ['check', 'Trek only in dry window — avoid if raining', 'Check sky before starting.',                      null,           ''],
    ['check', 'Paragliding — check wind/weather on site',   'July = 70–80% cancellation chance.',              'check on-site','amber'],
    ['check', 'Adventure park — 9 AM to 5 PM',             'Cancel if rain or wind picks up.',                 null,           ''],
    ['check', 'Plan return ride to start before 3–4 PM',   'Post-activity 240 km in dark = high risk.',        'strict',       'red'],
  ]
  await db.batch(actItems.map(([type, text, note, tag, color], i) =>
    ({ sql: ii, args: [activitiesId, type, text, note, tag, color, i] })))

  // ── Destination 2: Wayanad ─────────────────────────────────────────────
  const { lastInsertRowid: wayanadId } = await db.run(
    `INSERT INTO destinations (name, subtitle, emoji, distance_km, duration_hrs, tags) VALUES (?, ?, ?, ?, ?, ?)`,
    ['Wayanad', 'Forests · Waterfalls · Wildlife', '🌿', 350, '8–9 hrs one way',
      JSON.stringify(['FOREST', 'WATERFALLS', 'WILDLIFE', 'LONG RIDE'])]
  )
  const { lastInsertRowid: planId } = await db.run(
    `INSERT INTO sections (destination_id,type,title,icon,sort_order) VALUES (?,?,?,?,?)`,
    [wayanadId, 'checklist', 'Planning Notes', '📝', 0]
  )
  await db.batch([
    { sql: ii, args: [planId, 'info', 'Route via Coimbatore → Palakkad → Mannarkkad → Wayanad', 'Check ghat road conditions before planning.', null, '', 0] },
    { sql: ii, args: [planId, 'info', '350 km one way — consider overnight stop', 'Longer than Vagamon. Plan accordingly.', 'important', 'amber', 1] },
  ])

  await db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ['seeded', '1'])
  console.log('Database seeded.')
}
