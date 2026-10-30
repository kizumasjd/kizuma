// Interpretación prudente del texto de horario de la guía.
// Solo se considera "interpretado" cuando TODOS los tramos se entienden; en otro caso se muestra el texto original.

export type Span = [number, number] // minutos desde las 00:00
export type Week = Span[][] // índice 0 = lunes … 6 = domingo

export type Schedule =
  | { kind: 'always' }
  | { kind: 'weekly'; week: Week }
  | { kind: 'text' }
  | { kind: 'none' }

const DAYS = 'LMXJVSD'

function expandDays(spec: string): number[] | null {
  const s = spec
    .toLowerCase()
    .replace(/festivos?( incluidos)?/g, '')
    .replace(/laborables/g, 'l-v')
    .replace(/s[aá]bados?/g, 's')
    .replace(/domingos?/g, 'd')
    .trim()
  const out = new Set<number>()
  const parts = s.split(/\s*(?:,|\by\b|\bo\b)\s*|\s+/).filter(Boolean)
  if (!parts.length) return null
  for (const p of parts) {
    const m = /^([lmxjvsd])(?:-([lmxjvsd]))?$/.exec(p)
    if (!m) return null
    const a = DAYS.indexOf(m[1].toUpperCase())
    const b = m[2] ? DAYS.indexOf(m[2].toUpperCase()) : a
    for (let i = a; i !== (b + 1) % 7; i = (i + 1) % 7) out.add(i)
  }
  return [...out]
}

const toMin = (h: string, m?: string) => Number(h) * 60 + Number(m ?? 0)

function addSpan(week: Week, day: number, from: number, to: number) {
  if (to > from) {
    week[day].push([from, to])
  } else {
    // cruza la medianoche (p. ej. 20:00-9:00)
    week[day].push([from, 1440])
    week[(day + 1) % 7].push([0, to])
  }
}

const SEG =
  /^(?:desayuno|cena|comida|ducha)?\s*((?:laborables|s[aá]bados?|domingos?|[lmxjvsd])(?:[\s,\-]|\by\b|\bo\b|[lmxjvsd]|festivos?(?: incluidos)?|laborables)*?)\s+(?:a partir de\s+)?(\d{1,2})(?::(\d{2}))?\s*(?:-\s*(\d{1,2})(?::(\d{2}))?)?(?:\s+y\s+(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2}))?\s*$/i

export function parseSchedule(raw: string | null): Schedule {
  if (!raw || !raw.trim()) return { kind: 'none' }
  const txt = raw.trim()
  if (/^(horario permanente|24 h(, todos los d[ií]as del a[nñ]o)?|permanente)$/i.test(txt)) return { kind: 'always' }
  const week: Week = [[], [], [], [], [], [], []]
  const segs = txt
    .split(';')
    .map((s) => s.trim().replace(/\s*\(festivos cerrado\)/i, ''))
    .filter((s) => s && !/^festivos( incluidos)?$/i.test(s))
  let ok = 0
  for (const seg of segs) {
    const clean = seg.replace(/,?\s*festivos incluidos$/i, '')
    const m = SEG.exec(clean)
    if (!m) return { kind: 'text' }
    const days = expandDays(m[1])
    if (!days) return { kind: 'text' }
    const from = toMin(m[2], m[3])
    const to = m[4] ? toMin(m[4], m[5]) : 1440
    for (const d of days) {
      addSpan(week, d, from, to)
      if (m[6]) addSpan(week, d, toMin(m[6], m[7]), toMin(m[8], m[9]))
    }
    ok++
  }
  return ok ? { kind: 'weekly', week } : { kind: 'text' }
}

/** true / false si se puede saber; null si no se puede interpretar. */
export function isOpenNow(s: Schedule, now = new Date()): boolean | null {
  if (s.kind === 'always') return true
  if (s.kind !== 'weekly') return null
  const day = (now.getDay() + 6) % 7
  const min = now.getHours() * 60 + now.getMinutes()
  return s.week[day].some(([a, b]) => min >= a && min < b)
}

export const todayIndex = (now = new Date()) => (now.getDay() + 6) % 7

export function fmtSpan([a, b]: Span, h = 'h') {
  const f = (m: number) => {
    const hh = Math.floor(m / 60) % 24
    const mm = m % 60
    return mm ? `${hh}:${String(mm).padStart(2, '0')}` : `${hh}`
  }
  return `${f(a)}${h} – ${f(b)}${h}`
}
