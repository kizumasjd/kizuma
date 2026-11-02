import { useCallback, useState } from 'react'

export interface Pos {
  lat: number
  lon: number
}

export type GeoStatus = 'idle' | 'locating' | 'denied' | 'failed'

// Se redondea a 3 decimales (~100 m): para encontrar sitios a pie no hace falta más precisión.
const round = (n: number) => Math.round(n * 1000) / 1000

/** Una única lectura, con precisión reducida (sin GPS) y sin seguimiento continuo. */
function locate(): Promise<Pos> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject('failed')
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: round(p.coords.latitude), lon: round(p.coords.longitude) }),
      (e) => reject(e.code === e.PERMISSION_DENIED ? 'denied' : 'failed'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 30000 },
    )
  })
}

/**
 * La posición vive solo en memoria de este componente: no se guarda en almacenamiento,
 * ni en la URL, ni se envía a ningún servidor.
 */
export function useGeo() {
  const [pos, setPos] = useState<Pos | null>(null)
  const [status, setStatus] = useState<GeoStatus>('idle')

  const request = useCallback(() => {
    setStatus('locating')
    locate().then(
      (p) => {
        setPos(p)
        setStatus('idle')
      },
      (e) => setStatus(e === 'denied' ? 'denied' : 'failed'),
    )
  }, [])

  const clear = useCallback(() => {
    setPos(null)
    setStatus('idle')
  }, [])

  return { pos, status, request, clear }
}

/** Distancia en metros entre dos puntos (fórmula de Haversine). */
export function distanceM(a: Pos, lat: number, lon: number) {
  const rad = Math.PI / 180
  const dLat = (lat - a.lat) * rad
  const dLon = (lon - a.lon) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(lat * rad) * Math.sin(dLon / 2) ** 2
  return 2 * 6371000 * Math.asin(Math.sqrt(h))
}

export function formatDistance(m: number, lang: string) {
  if (m < 1000) return `${Math.max(50, Math.round(m / 50) * 50)} m`
  return `${(m / 1000).toLocaleString(lang, { maximumFractionDigits: 1 })} km`
}
