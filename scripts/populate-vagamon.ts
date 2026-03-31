// Populate Vagamon itinerary
// Run: bun scripts/populate-vagamon.ts

const BASE = 'http://localhost:3000'

// ── Auth ──────────────────────────────────────────────────────────────────
const { token } = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'kabi2025' }),
}).then(r => r.json())

if (!token) { console.error('Login failed'); process.exit(1) }

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`${method} ${path} → ${data.error || res.status}`)
  return data
}

// ── Find Vagamon ──────────────────────────────────────────────────────────
const dests = await api('GET', '/api/destinations')
const vagamon = dests.find((d: any) => d.name.toLowerCase().includes('vagamon'))
if (!vagamon) { console.error('Vagamon destination not found'); process.exit(1) }
const destId = vagamon.id
console.log(`\n📍 Found Vagamon (id=${destId}) — clearing existing sections…`)

// ── Clear existing sections ───────────────────────────────────────────────
const detail = await api('GET', `/api/destinations/${destId}`)
for (const s of detail.sections) {
  await api('DELETE', `/api/sections/${s.id}`)
  console.log(`  🗑  Deleted: ${s.title}`)
}

// ── Helper ────────────────────────────────────────────────────────────────
type Item = {
  item_type: 'check' | 'never' | 'route_stop' | 'info'
  text: string
  note?: string
  tag?: string
  tag_color?: string
}

let sectionOrder = 0

async function addSection(icon: string, title: string, type: string, items: Item[]) {
  const s = await api('POST', `/api/destinations/${destId}/sections`, {
    icon, title, type, sort_order: sectionOrder++,
  })
  for (let i = 0; i < items.length; i++) {
    await api('POST', `/api/sections/${s.id}/items`, { ...items[i], sort_order: i })
  }
  console.log(`  ✅  ${icon} ${title}  (${items.length} items)`)
}

// ── Update destination meta ───────────────────────────────────────────────
await api('PUT', `/api/destinations/${destId}`, {
  emoji: '🏔️',
  subtitle: 'Ghats · Monsoon · Pine Forests · Kurisimala',
  distance_km: 240,
  duration_hrs: '6–7 hrs (split across 2 legs)',
  tags: ['GHATS', 'MONSOON', 'TREK', 'ADVENTURE', 'NIGHT RIDE'],
  notes: `2-day overnight trip. Depart 02 Jul 2026 at 6:00 PM from office.
Leg 1: Office (MachDatum) → Thrissur (night stay)
Leg 2: Thrissur → Vagamon (night ride, 3:00 AM)
Bike: Pulsar N 150 — Kabi & Deva
Hotels: TBD (see Stay Options section)
Day 3: Kurisimala trek → depart straight home.`,
})
console.log('\n✏️  Updated destination meta\n')

// ══════════════════════════════════════════════════════════════════════════
// SECTION 1 — Route Overview
// ══════════════════════════════════════════════════════════════════════════
await addSection('🛣️', 'Route Overview', 'route', [
  {
    item_type: 'info',
    text: 'Office (MachDatum) → Palakkad → Thrissur outer ring → Chalakudi → Vagamon',
    note: 'Day 1 evening + Day 2 early morning. Total ~350–400 km spread across 2 legs.',
  },
  {
    item_type: 'info',
    text: 'Bike: Pulsar N 150 — single bike, both riders',
    note: 'Tank: ~12L. Range: 350–400 km per fill. Fuel stops planned at Palakkad, Erattupetta.',
  },
  {
    item_type: 'route_stop',
    text: 'Leg 1: Office → Thrissur  (~150 km, ~3 hrs)',
    tag: 'DAY 1',
    tag_color: 'green',
    note: 'Depart 6:00 PM · Arrive ~9:00 PM · NH544 via Palakkad',
  },
  {
    item_type: 'route_stop',
    text: 'Leg 2: Thrissur → Chalakudi → Vagamon  (~115 km, ~3 hrs)',
    tag: 'DAY 2',
    tag_color: 'blue',
    note: 'Depart 3:00 AM · Arrive ~8:00 AM · via Aluva → Muvattupuzha → Erattupetta → Vagamon Ghat',
  },
  {
    item_type: 'route_stop',
    text: 'Return: Vagamon → Erattupetta → Chalakudi → Thrissur → Palakkad → Office',
    tag: 'DAY 3',
    tag_color: 'amber',
    note: 'Post-Kurisimala trek. Flexible timing. Straight home — no planned stops.',
  },
  {
    item_type: 'never',
    text: 'Do NOT speed on ghat sections — July roads are wet and slippery',
    tag: 'CRITICAL',
    tag_color: 'red',
  },
  {
    item_type: 'never',
    text: 'Do NOT skip rain gear — July is peak Kerala monsoon',
    tag: 'CRITICAL',
    tag_color: 'red',
  },
])

// ══════════════════════════════════════════════════════════════════════════
// SECTION 2 — Day 1: Office to Thrissur
// ══════════════════════════════════════════════════════════════════════════
await addSection('🌆', 'Day 1 — Office to Thrissur  (02 Jul 2026)', 'route', [
  {
    item_type: 'route_stop',
    text: 'Office (MachDatum) — Depart 6:00 PM',
    tag: 'DEPART',
    tag_color: 'green',
    note: 'Pack done the night before. Leave on time — Thrissur hotel might have check-in deadline.',
  },
  {
    item_type: 'route_stop',
    text: 'Palakkad bypass — ~7:00–7:30 PM',
    note: 'Fuel stop here. Top up fully — next planned stop at Erattupetta (Day 2).',
  },
  {
    item_type: 'route_stop',
    text: 'Break #1 — ~7:10 PM (first 1 hr mark)',
    note: '10 min stretch + water. Don\'t skip — night leg starts at 3 AM.',
  },
  {
    item_type: 'route_stop',
    text: 'Break #2 — ~8:10 PM (second 1 hr mark)',
    note: '10 min. Aim to arrive Thrissur by 9:00–9:30 PM.',
  },
  {
    item_type: 'route_stop',
    text: 'Thrissur outer ring — Arrive ~9:00–9:30 PM',
    tag: 'STAY',
    tag_color: 'amber',
    note: 'Check in to hotel (TBD — book in advance, July is busy).',
  },
  {
    item_type: 'check',
    text: 'Check in to Thrissur hotel',
    note: 'See Stay Options section. Confirm 24-hr check-in or late arrival.',
  },
  {
    item_type: 'check',
    text: 'Light dinner — don\'t overeat (3 AM wake-up)',
    note: 'Something easy: rice + curry, or parotta. Avoid heavy non-veg.',
  },
  {
    item_type: 'check',
    text: 'Charge both phones overnight (full charge)',
  },
  {
    item_type: 'check',
    text: 'Pack everything tonight — bags ready to grab at 3 AM',
    note: 'Riding jackets, rain gear, helmets near the door.',
  },
  {
    item_type: 'info',
    text: 'Sleep target: 10:00–10:30 PM — minimum 3.5 hrs sleep before 3 AM departure',
    tag: 'IMPORTANT',
    tag_color: 'amber',
  },
  {
    item_type: 'check',
    text: 'Set TWO alarms — 2:00 AM and 2:15 AM (backup)',
  },
])

// ══════════════════════════════════════════════════════════════════════════
// SECTION 3 — Day 2: Night Ride to Vagamon
// ══════════════════════════════════════════════════════════════════════════
await addSection('🌙', 'Day 2 — Night Ride to Vagamon  (03 Jul 2026)', 'route', [
  {
    item_type: 'route_stop',
    text: 'Wake up — 2:00–2:30 AM',
    note: 'Freshen up, light snack (biscuits / banana), check gear. Don\'t leave phone charging.',
  },
  {
    item_type: 'route_stop',
    text: 'Depart Thrissur — 3:00 AM sharp',
    tag: 'DEPART',
    tag_color: 'green',
  },
  {
    item_type: 'route_stop',
    text: 'Chalakudi — ~3:45 AM  (~30 km)',
    tag: 'GREEN',
    tag_color: 'green',
    note: 'Quick pass-through. Route continues south on NH544.',
  },
  {
    item_type: 'route_stop',
    text: 'Aluva — ~4:15–4:30 AM',
    tag: 'GREEN',
    tag_color: 'green',
    note: 'Stay alert — stray animals common on highway pre-dawn. Low-beam on curves.',
  },
  {
    item_type: 'route_stop',
    text: 'Muvattupuzha — ~5:00–5:15 AM',
    tag: 'AMBER',
    tag_color: 'amber',
    note: 'Roughly halfway. 5 min stretch break. Road quality changes here.',
  },
  {
    item_type: 'route_stop',
    text: 'Erattupetta — ~6:15–6:30 AM',
    tag: 'AMBER',
    tag_color: 'amber',
    note: 'Last town before ghat. FUEL UP here. Toilet break. Eat something small if hungry.',
  },
  {
    item_type: 'route_stop',
    text: 'Vagamon Ghat section begins — ~7:00 AM',
    tag: 'RED',
    tag_color: 'red',
    note: 'Reduce speed. Fog/mist likely. Lights on. Watch for oncoming vehicles on blind curves.',
  },
  {
    item_type: 'route_stop',
    text: 'Vagamon uphill viewpoint — ~8:00 AM',
    tag: 'ARRIVE',
    tag_color: 'green',
    note: 'Sunrise views! Pull over, take it in. You made it 🌅',
  },
  {
    item_type: 'info',
    text: 'Night riding tips: maintain steady speed, high beam on straight roads, low beam on curves, watch for cattle',
    tag: 'SAFETY',
    tag_color: 'blue',
  },
  {
    item_type: 'never',
    text: 'Do NOT overtake on blind curves on the Vagamon ghat — monsoon, zero visibility risk',
    tag: 'GHAT',
    tag_color: 'red',
  },
])

// ══════════════════════════════════════════════════════════════════════════
// SECTION 4 — Day 2: Vagamon Morning (Spots)
// ══════════════════════════════════════════════════════════════════════════
await addSection('☀️', 'Day 2 — Vagamon Morning Spots', 'activities', [
  {
    item_type: 'check',
    text: 'Breakfast near Vagamon — light (Maggi, tea, bread)',
    note: 'Done by 8:50 AM max. Don\'t overload — adventure activities ahead.',
  },
  {
    item_type: 'route_stop',
    text: 'SPOT 1 — Vagamon Meadows  (9:00 AM)',
    tag: 'SPOT 1',
    tag_color: 'green',
    note: 'Opens 9 AM. On the way to Adventure Zone. Photos, walk, soak in the mist. 30 min only.',
  },
  {
    item_type: 'check',
    text: 'Photos at Vagamon Meadows',
    note: 'July morning mist makes it look stunning. Worth the stop.',
  },
  {
    item_type: 'route_stop',
    text: 'Depart Meadows — 9:30 AM sharp',
    note: 'Don\'t stretch this — Adventure Zone needs to be done before heat picks up.',
  },
  {
    item_type: 'route_stop',
    text: 'SPOT 2 — Vagamon Adventure Zone  (arrive ~10:00 AM)',
    tag: 'SPOT 2',
    tag_color: 'green',
    note: 'Opens 9–9:30 AM. Glass Bridge + other activities. ~1.5 hrs planned.',
  },
  {
    item_type: 'check',
    text: 'Glass Bridge — must do',
    note: 'Inside Vagamon Adventure Zone. Tick this.',
  },
  {
    item_type: 'check',
    text: 'Other activities if time and mood — zipline, ATV, etc.',
    note: 'Optional. Don\'t overdo it — still have pine forest + Kurisimala trek coming.',
  },
  {
    item_type: 'route_stop',
    text: 'Depart Adventure Zone — 11:30 AM',
    tag: 'LEAVE BY',
    tag_color: 'amber',
  },
  {
    item_type: 'info',
    text: 'Vagamon Adventure Zone — July tip: might be less crowded in monsoon. May need advance booking on weekends.',
    tag: 'NOTE',
    tag_color: 'blue',
  },
])

// ══════════════════════════════════════════════════════════════════════════
// SECTION 5 — Day 2: Check-in & Afternoon Rest
// ══════════════════════════════════════════════════════════════════════════
await addSection('🏨', 'Day 2 — Hotel Check-in & Rest', 'hotels', [
  {
    item_type: 'info',
    text: 'Resort/Hotel: TBD — 5–10 km from Vagamon town. See Stay Options section.',
    note: 'Not yet booked. Book before July 1st — July peak season fills up.',
  },
  {
    item_type: 'route_stop',
    text: 'Depart Adventure Zone towards hotel — 11:30 AM',
  },
  {
    item_type: 'route_stop',
    text: 'Arrive hotel — by 1:30 PM max',
    note: 'Includes a stop for lunch on the way.',
  },
  {
    item_type: 'check',
    text: 'Lunch — proper meal (first real meal of the day)',
    note: 'At hotel or a dhaba on the way. Kerala rice meals are the move.',
  },
  {
    item_type: 'check',
    text: 'Shower + change',
    tag: 'MUST',
    tag_color: 'amber',
  },
  {
    item_type: 'info',
    text: 'Rest window: 1:30 PM – 3:00 PM. Lie down — don\'t skip. Kurisimala trek tomorrow 5 AM.',
    tag: 'IMPORTANT',
    tag_color: 'amber',
  },
])

// ══════════════════════════════════════════════════════════════════════════
// SECTION 6 — Day 2: Pine Forest & Evening
// ══════════════════════════════════════════════════════════════════════════
await addSection('🌲', 'Day 2 — Pine Forest & Evening', 'activities', [
  {
    item_type: 'route_stop',
    text: 'Depart hotel for Pine Forest — 3:00 PM',
    note: 'Vagamon Pine Forest is a short ride from most resorts in the area.',
  },
  {
    item_type: 'check',
    text: 'Pine Forest walk — explore, photos, breathe it in',
    note: 'July: pine forest will be lush and misty. Bring a light jacket — it gets cold.',
  },
  {
    item_type: 'route_stop',
    text: 'Back to hotel — by 6:00 PM max',
    tag: 'HARD LIMIT',
    tag_color: 'red',
    note: 'Early sleep needed — 5:00 AM wake-up tomorrow for Kurisimala.',
  },
  {
    item_type: 'check',
    text: 'Campfire at hotel — if available',
    note: 'Ask when checking in. Not all resorts offer it. If they do — don\'t miss it.',
  },
  {
    item_type: 'check',
    text: 'Dinner',
  },
  {
    item_type: 'info',
    text: 'Sleep target: 9:00–9:30 PM. Wake up 5:00 AM for Kurisimala.',
    tag: 'IMPORTANT',
    tag_color: 'amber',
  },
  {
    item_type: 'check',
    text: 'Set alarm — 5:00 AM (backup: 5:10 AM)',
  },
  {
    item_type: 'check',
    text: 'Keep trek shoes + warm layer ready for morning',
  },
])

// ══════════════════════════════════════════════════════════════════════════
// SECTION 7 — Day 3: Kurisimala Trek
// ══════════════════════════════════════════════════════════════════════════
await addSection('⛰️', 'Day 3 — Kurisimala Trek', 'activities', [
  {
    item_type: 'route_stop',
    text: 'Wake up — 5:00 AM',
  },
  {
    item_type: 'check',
    text: 'Tea / light snack before heading out',
    note: 'Don\'t trek on empty stomach — banana or biscuits at least.',
  },
  {
    item_type: 'route_stop',
    text: 'Depart hotel — ~5:30 AM',
  },
  {
    item_type: 'route_stop',
    text: 'Kurisimala base — Arrive 6:00 AM',
    tag: 'BASE',
    tag_color: 'amber',
    note: 'Tea stall at the base — get chai before the climb ☕',
  },
  {
    item_type: 'route_stop',
    text: 'Start trek — 6:00–6:15 AM',
    note: 'Trek duration: 1–1.5 hrs to summit. Steady pace — monsoon trail is slippery.',
  },
  {
    item_type: 'route_stop',
    text: 'Summit — arrive ~7:00–7:30 AM',
    tag: 'SUMMIT',
    tag_color: 'green',
    note: 'Cross at the top. View of Vagamon valley. Morning mist + sunrise = worth every step.',
  },
  {
    item_type: 'check',
    text: 'Summit photos + soak the view',
    note: 'Stay till ~9:00 AM. Clear mornings in July are rare — enjoy if you get one.',
  },
  {
    item_type: 'route_stop',
    text: 'Begin descent — 9:00 AM',
    note: 'Descend carefully — wet rocks. Use hands on steep bits.',
  },
  {
    item_type: 'info',
    text: 'Wear grip shoes — not sandals. A stick helps on wet trail. Carry water (500ml min).',
    tag: 'TIP',
    tag_color: 'blue',
  },
  {
    item_type: 'never',
    text: 'Do NOT attempt trek if it is actively raining heavily — slippery rock face, zero visibility',
    tag: 'SAFETY',
    tag_color: 'red',
  },
])

// ══════════════════════════════════════════════════════════════════════════
// SECTION 8 — Day 3: Return Home
// ══════════════════════════════════════════════════════════════════════════
await addSection('🏠', 'Day 3 — Return Home', 'route', [
  {
    item_type: 'route_stop',
    text: 'Back to hotel after trek — ~10:00–10:30 AM',
  },
  {
    item_type: 'check',
    text: 'Shower + pack up + check out',
  },
  {
    item_type: 'check',
    text: 'Breakfast / brunch before leaving Vagamon',
    note: 'Last Kerala meal — make it a proper one.',
  },
  {
    item_type: 'check',
    text: 'Fuel up before leaving Vagamon / Erattupetta',
    note: 'Don\'t start the return on a half-tank.',
  },
  {
    item_type: 'route_stop',
    text: 'Depart Vagamon — post-breakfast (flexible)',
    tag: 'RETURN',
    tag_color: 'amber',
    note: 'Route: Vagamon → Erattupetta → Aluva → Chalakudi → Thrissur → Palakkad → Office. Plan may adjust based on time + energy.',
  },
  {
    item_type: 'info',
    text: 'Return is ~240 km, ~5–6 hrs with breaks. Plan 10 min break every hour.',
    note: 'No hard stops planned — straight home.',
  },
  {
    item_type: 'check',
    text: 'Take a break if tired — don\'t push on the return. Safety over speed.',
    tag: 'SAFETY',
    tag_color: 'amber',
  },
])

// ══════════════════════════════════════════════════════════════════════════
// SECTION 9 — Stay Options (TBD)
// ══════════════════════════════════════════════════════════════════════════
await addSection('🛏️', 'Stay Options  (To Be Decided)', 'hotels', [
  {
    item_type: 'info',
    text: 'THRISSUR NIGHT STAY — Hotel TBD near outer ring road',
    note: 'Need: late check-in (arriving ~9:30 PM) or 24-hr reception. Budget: TBD. Booking.com / OYO / MakeMyTrip.',
  },
  {
    item_type: 'check',
    text: 'Book Thrissur hotel before July 1st',
    tag: 'TODO',
    tag_color: 'amber',
  },
  {
    item_type: 'info',
    text: 'VAGAMON RESORT — TBD. 5–10 km from Vagamon town. 1 night.',
    note: 'Want: campfire, peaceful, not too far from Pine Forest + Kurisimala base. Options: Misty Mountain Resort, Pine Valley Resorts, Vagamon Pine Resort, The Fog Vagamon.',
  },
  {
    item_type: 'check',
    text: 'Book Vagamon resort before July 1st — July peak season fills up fast',
    tag: 'TODO',
    tag_color: 'red',
  },
  {
    item_type: 'check',
    text: 'Confirm: campfire available? when booking Vagamon resort',
  },
  {
    item_type: 'check',
    text: 'Ask resort: early check-in possible? (arriving ~1:30 PM after adventure zone)',
  },
  {
    item_type: 'check',
    text: 'Ask resort: distance to Kurisimala base? (want under 15 km)',
  },
])

// ══════════════════════════════════════════════════════════════════════════
// SECTION 10 — Bike + Safety Checklist
// ══════════════════════════════════════════════════════════════════════════
await addSection('🔧', 'Bike + Safety Checklist  (Pulsar N 150)', 'checklist', [
  {
    item_type: 'check',
    text: 'Full tank before departure from office',
    tag: 'BIKE',
    tag_color: 'green',
  },
  {
    item_type: 'check',
    text: 'Tyre pressure — front + rear',
    note: 'Check the day before departure. Correct PSI for two-up riding.',
  },
  {
    item_type: 'check',
    text: 'Chain lubrication',
  },
  {
    item_type: 'check',
    text: 'Brakes — front + rear. Spongy = fix before trip.',
  },
  {
    item_type: 'check',
    text: 'All lights — headlight, tail light, indicators',
    note: 'Night leg starts at 3 AM — lights must be 100%.',
  },
  {
    item_type: 'check',
    text: 'Carry 1L spare fuel (small can in side bag)',
    note: 'Ghat section has no petrol bunks. Erattupetta is last stop.',
    tag: 'TIP',
    tag_color: 'blue',
  },
  {
    item_type: 'check',
    text: 'Both helmets — ISI certified, fit properly',
    tag: 'LEGAL',
    tag_color: 'amber',
  },
  {
    item_type: 'check',
    text: 'Rain jackets / ponchos for both',
    tag: 'MUST',
    tag_color: 'red',
    note: 'July = heavy monsoon. Non-negotiable. Pack in an easily reachable spot.',
  },
  {
    item_type: 'check',
    text: 'Riding gloves — full finger, for wet grip',
  },
  {
    item_type: 'check',
    text: 'First aid kit in side bag',
    note: 'Bandage, antiseptic, pain relief, ORS sachets.',
  },
  {
    item_type: 'check',
    text: 'Tool kit + puncture repair kit',
  },
  {
    item_type: 'check',
    text: 'Bungee cords / cargo net for luggage',
  },
  {
    item_type: 'check',
    text: 'Offline maps downloaded — Google Maps or OsmAnd',
    note: 'Ghat + Vagamon area has patchy signal. Download Kerala region offline.',
    tag: 'TIP',
    tag_color: 'blue',
  },
  {
    item_type: 'check',
    text: 'Powerbank — 10,000 mAh min',
  },
  {
    item_type: 'check',
    text: 'Phone mount on handlebar',
  },
  {
    item_type: 'check',
    text: 'Dry bags / zip-lock for valuables (wallets, documents, phones)',
    note: 'Monsoon = everything gets wet. Waterproof everything.',
  },
  {
    item_type: 'never',
    text: 'Do NOT ride without rain gear in July Kerala',
    tag: 'CRITICAL',
    tag_color: 'red',
  },
  {
    item_type: 'never',
    text: 'Do NOT speed over 50 kmph on ghat sections',
    tag: 'CRITICAL',
    tag_color: 'red',
  },
])

// ══════════════════════════════════════════════════════════════════════════
// SECTION 11 — Monsoon Weather Notes
// ══════════════════════════════════════════════════════════════════════════
await addSection('🌧️', 'Monsoon Notes  (July — Peak Season)', 'custom', [
  {
    item_type: 'info',
    text: 'Vagamon in July: heavy rain, thick morning mist, lush green hills. Roads wet and slippery — especially on ghats.',
  },
  {
    item_type: 'info',
    text: 'Best riding window: 3–7 AM. Rain probability is lowest in early morning in July.',
    tag: 'TIP',
    tag_color: 'green',
  },
  {
    item_type: 'info',
    text: 'Vagamon Meadows in monsoon: foggy and misty — still photogenic. Don\'t expect clear blue skies.',
    tag: 'WEATHER',
    tag_color: 'blue',
  },
  {
    item_type: 'info',
    text: 'Kurisimala trek: slippery rocks after rain. Check forecast the night before.',
    tag: 'WEATHER',
    tag_color: 'amber',
  },
  {
    item_type: 'never',
    text: 'Do NOT attempt ghat roads during active heavy rainfall — wait for it to ease',
    tag: 'SAFETY',
    tag_color: 'red',
  },
  {
    item_type: 'check',
    text: 'Check Windy.com or Ventusky for Vagamon 2 days before trip',
    note: 'Plan adjustments if heavy rain is forecast for July 2–3.',
  },
  {
    item_type: 'check',
    text: 'Have a Plan B if Kurisimala is rained out',
    note: 'Alternatives: Vagamon Lake, Bamburumchi Viewpoint, Thangalpara.',
  },
  {
    item_type: 'info',
    text: 'Emergency contact: Save Vagamon Police Station number + hotel contact before leaving',
    tag: 'SAFETY',
    tag_color: 'amber',
  },
])

console.log('\n🎉 Vagamon itinerary fully populated!\n')
