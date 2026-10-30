// Capa de acceso a datos. Hoy lee el JSON incluido en la app; cuando exista el backend
// basta con sustituir estas funciones por llamadas a la API (mismas firmas).
import raw from '../data/recursos.json'
import { isOpenNow, parseSchedule, type Schedule } from './hours'
import type { Categoria, Recurso } from './types'

export const recursos = raw as Recurso[]

const byId = new Map(recursos.map((r) => [r.id, r]))
const schedules = new Map<string, Schedule>()

export const getRecurso = (id: string) => byId.get(id)

export function getSchedule(r: Recurso): Schedule {
  let s = schedules.get(r.id)
  if (!s) {
    s = parseSchedule(r.horario)
    schedules.set(r.id, s)
  }
  return s
}

export const openNow = (r: Recurso) => isOpenNow(getSchedule(r))

const norm = (s: string | null | undefined) =>
  (s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

export interface Filtros {
  categoria: Categoria
  zona: string
  abiertoAhora: boolean
  derivacion: 'todas' | 'sin' | 'con'
  subtipo: string | null
}

export function buscar(f: Filtros): Recurso[] {
  const z = norm(f.zona).trim()
  const lista = recursos.filter((r) => {
    if (!r.tipos.includes(f.categoria)) return false
    if (f.subtipo && r.tipo === f.categoria && r.subtipo !== f.subtipo) return false
    if (f.subtipo && r.tipo !== f.categoria) return false
    if (f.derivacion === 'con' && r.derivacion !== true) return false
    if (f.derivacion === 'sin' && r.derivacion === true) return false
    if (f.abiertoAhora && openNow(r) !== true) return false
    if (z) {
      const hay = norm([r.barrio, r.distrito, r.cp, r.direccion, r.municipio, r.zona, r.nombre].join(' '))
      if (!hay.includes(z)) return false
    }
    return true
  })
  // Primero los que se sabe que están abiertos, luego los que tienen ubicación, luego por nombre.
  return lista.sort((a, b) => {
    const oa = openNow(a) === true ? 0 : 1
    const ob = openNow(b) === true ? 0 : 1
    if (oa !== ob) return oa - ob
    const ga = a.lat != null ? 0 : 1
    const gb = b.lat != null ? 0 : 1
    if (ga !== gb) return ga - gb
    return a.nombre.localeCompare(b.nombre, 'es')
  })
}

export const telHref = (tel: string | null) => {
  const m = tel && /(\+?\d[\d\s]{7,}\d)/.exec(tel)
  return m ? `tel:${m[1].replace(/\s/g, '')}` : null
}

export const dirHref = (r: Recurso) =>
  r.lat != null && r.lon != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([r.direccion, r.municipio ?? 'Barcelona'].filter(Boolean).join(', '))}`

/** Etiquetas cortas (claves i18n) deducidas del servicio y de los iconos de la guía. */
export function etiquetas(r: Recurso): string[] {
  const s = (r.servicio ?? '').toLowerCase()
  const t: string[] = []
  const add = (k: string, re: RegExp) => re.test(s) && t.push(k)
  add('breakfast', /desayun/)
  add('lunch', /comida|comedor/)
  add('dinner', /\bcenas?\b/)
  add('sandwich', /bocadillo/)
  add('shower', /ducha/)
  add('laundry', /lavander/)
  add('nurse', /enfermer/)
  add('dental', /odontolog|bucodental/)
  add('mental', /salud mental|psicoterapia/)
  add('urgent24', /24 h/)
  add('harm', /reducci[oó]n de da[nñ]os|jeringuill|sala de consumo/)
  if (r.iconos.includes('Aliments') || /lotes de alimentos|alimentos/.test(s)) t.push('foodParcels')
  if (r.iconos.includes('Roba') || /ropa|ropero/.test(s)) t.push('clothes')
  if (r.iconos.includes('Ajut legal')) t.push('legal')
  return [...new Set(t)].slice(0, 4)
}
