import { db } from './db'

export function seed() {
  const already = db.prepare("SELECT value FROM settings WHERE key = 'seeded'").get()
  if (already) return

  const insertDest    = db.prepare(`INSERT INTO destinations (name, subtitle, emoji, distance_km, duration_hrs, tags) VALUES (?, ?, ?, ?, ?, ?)`)
  const insertSection = db.prepare(`INSERT INTO sections (destination_id, type, title, icon, sort_order) VALUES (?, ?, ?, ?, ?)`)
  const insertItem    = db.prepare(`INSERT INTO items (section_id, item_type, text, note, tag, tag_color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`)

  db.transaction(() => {
    // ── Destination 1: Vagamon ─────────────────────────────────────────────
    const { lastInsertRowid: vagamonId } = insertDest.run(
      'Vagamon',
      'Ghats · Monsoon · Pine Forests',
      '🏔️', 240, '6-7 hrs one way',
      JSON.stringify(['GHATS', 'MONSOON', 'PARAGLIDING', 'TREK'])
    )

    // Route + Speed Zones
    const { lastInsertRowid: routeId } = insertSection.run(vagamonId, 'route', 'Route + Speed Zones', '🛣️', 0)
    ;[
      ['Ondipudur → Palakkad',    'Full tank. Highway. Night trucks — stay left.',          'Highway · 60–70 km/h',     'green'],
      ['Palakkad → Thrissur',     'Refuel at Palakkad. Tea + stretch.',                     'State roads · 50–60 km/h', 'green'],
      ['Thrissur — Sleep Stop',   'Minimum 2–3 hrs sleep. Book lodge in advance.',          'Non-negotiable rest',       'red'],
      ['Thrissur → Thodupuzha',   'Top up fuel here. Last stop before ghats.',              'Critical fuel stop',        'red'],
      ['Ghat section → Vagamon',  '20–25 km/h with pillion. Narrow + steep + wet.',        'Ghats · 20–25 km/h',       'red'],
      ['Return: Vagamon → Home',  '240 km. Break every 70–80 km. Start before 3 PM.',      'Watch fatigue',             'amber'],
    ].forEach(([text, note, tag, color], i) => insertItem.run(routeId, 'route_stop', text, note, tag, color, i))

    // Safety Checklist
    const { lastInsertRowid: checklistId } = insertSection.run(vagamonId, 'checklist', 'Safety Checklist', '✅', 1)
    ;[
      ['check', 'Chain cleaned + lubed',                        'Do this the day before.',                             null,             ''],
      ['check', 'Brake pads ≥ 50% life',                        null,                                                  'critical',       'red'],
      ['check', 'Brake fluid — Motul RBF 600',                  'Fresh fluid = no fade on long descents.',             'critical',       'red'],
      ['check', 'Tyre tread OK — wet grip check',               null,                                                  null,             ''],
      ['check', 'Tyre pressure set correctly',                  'Slightly lower rear helps wet grip.',                 null,             ''],
      ['check', 'Both headlight + tail light working',          null,                                                  null,             ''],
      ['check', 'Full tank at departure',                       'Refuel: Palakkad → Thrissur → Thodupuzha',           null,             ''],
      ['check', 'Full-face helmet — both',                      null,                                                  'non-negotiable', 'red'],
      ['check', 'Anti-fog visor or insert',                     'Vagamon ghats at dawn = thick fog.',                  'important',      'amber'],
      ['check', 'Riding gloves — both',                         null,                                                  'non-negotiable', 'red'],
      ['check', 'Closed shoes — both',                          'No sandals or chappals. Even pillion.',               'non-negotiable', 'red'],
      ['check', 'Rain poncho / jacket — both',                  'Pack accessible, not buried in bag.',                 null,             ''],
      ['check', 'Offline maps downloaded — full route',         'No signal in ghat zones.',                            'critical',       'red'],
      ['check', 'Share live location with someone at home',     'WhatsApp live location, full trip.',                  'critical',       'red'],
      ['check', 'Power bank — fully charged',                   'GPS + camera drains iPhone fast.',                    'important',      'amber'],
      ['check', 'Cash minimum ₹2000 kept separate',             'Remote areas = no UPI.',                              'important',      'amber'],
      ['check', 'RC + DL + Insurance — physical copies',        'Kerala checkposts are active.',                       null,             ''],
      ['check', 'Puncture kit + basic toolkit',                 'Remote ghat roads — no shops.',                       null,             ''],
      ['check', 'Weather check night before + morning of',      'Landslide risk in July.',                             'important',      'amber'],
      ['never', 'Overtake on blind curves or in heavy rain',    null,                                                  null,             ''],
      ['never', 'Ride without helmet or gloves',                null,                                                  null,             ''],
      ['never', 'Skip Thrissur sleep stop to save time',        null,                                                  null,             ''],
      ['never', 'Push through with heavy eyes or lane drift',   'Stop immediately.',                                   null,             ''],
      ['never', 'Ignore landslide or road closure warnings',    "Reschedule, don't risk.",                             null,             ''],
      ['never', 'Ride in sandals or open footwear',             null,                                                  null,             ''],
    ].forEach(([type, text, note, tag, color], i) => insertItem.run(checklistId, type, text, note, tag, color, i))

    // Stay Options
    const { lastInsertRowid: hotelsId } = insertSection.run(vagamonId, 'hotels', 'Stay Options', '🏨', 2)
    ;[
      ['Couple-friendly — confirm before booking',       'Call ahead. Some homestays ask for marriage proof.', 'important', 'amber'],
      ['Inside / covered parking for bike',              'No outside parking in July monsoon.',                'important', 'amber'],
      ['Lit road access to property',                    'Check on maps before booking.',                      null,        ''],
      ['Book in advance — July is peak monsoon season',  'Last-minute availability very low.',                 'critical',  'red'],
    ].forEach(([text, note, tag, color], i) => insertItem.run(hotelsId, 'check', text, note, tag, color, i))

    // Activities + Weather Notes
    const { lastInsertRowid: activitiesId } = insertSection.run(vagamonId, 'activities', 'Activities + Weather Notes', '🏔️', 3)
    ;[
      ['Kurisumala Trek — grip shoes mandatory',          'Wet grass on slopes. Early morning window best.',    'important',    'amber'],
      ['Trek only in dry window — avoid if raining',      'Check sky before starting.',                         null,           ''],
      ['Carry water + snacks for trek',                   'No shops on trail.',                                 null,           ''],
      ['Paragliding — check wind/weather on site',        'July = 70–80% cancellation chance.',                'check on-site', 'amber'],
      ['Backup plan if paragliding cancels',              'Vagamon viewpoints, Pine Forest walk.',              null,           ''],
      ['Adventure park — 9 AM to 5 PM',                  'Cancel if rain or wind picks up.',                   null,           ''],
      ['Plan return ride to start before 3–4 PM',        'Post-activity 240 km in dark = high risk.',          'strict',       'red'],
    ].forEach(([text, note, tag, color], i) => insertItem.run(activitiesId, 'check', text, note, tag, color, i))

    // ── Destination 2: Wayanad ─────────────────────────────────────────────
    const { lastInsertRowid: wayanadId } = insertDest.run(
      'Wayanad',
      'Forests · Waterfalls · Wildlife',
      '🌿', 350, '8–9 hrs one way',
      JSON.stringify(['FOREST', 'WATERFALLS', 'WILDLIFE', 'LONG RIDE'])
    )

    const { lastInsertRowid: planId } = insertSection.run(wayanadId, 'checklist', 'Planning Notes', '📝', 0)
    ;[
      ['info', 'Route via Coimbatore → Palakkad → Mannarkkad → Wayanad', 'Check ghat road conditions before planning.',    null,        ''],
      ['info', '350 km one way — consider train switch or overnight stop', 'Longer than Vagamon. Plan accordingly.',        'important', 'amber'],
      ['info', 'Add more plan details in edit mode once route is decided',  null,                                            null,        ''],
    ].forEach(([type, text, note, tag, color], i) => insertItem.run(planId, type, text, note, tag, color, i))

    db.prepare("INSERT INTO settings (key, value) VALUES ('seeded', '1')").run()
  })()
}
