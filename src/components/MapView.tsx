import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Circle, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { openNow } from '../lib/data'
import type { Pos } from '../lib/geo'
import type { Recurso } from '../lib/types'

const BCN: [number, number] = [41.3874, 2.1686]

const icon = (cls: string, size: number) =>
  L.divIcon({
    className: '',
    html: `<div class="pin ${cls}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  })

const ICONS = {
  ok: icon('', 32),
  closed: icon('closed', 32),
  selected: icon('selected', 40),
}

function Fit({ items, selected }: { items: Recurso[]; selected?: Recurso }) {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    if (selected?.lat != null && selected.lon != null) {
      map.setView([selected.lat, selected.lon], 16)
      return
    }
    if (!items.length) return
    // Un par de recursos fuera de Barcelona alejarían demasiado el zoom: se encuadra el grueso de puntos.
    const med = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
    const mLat = med(items.map((r) => r.lat!))
    const mLon = med(items.map((r) => r.lon!))
    const near = items.filter((r) => Math.abs(r.lat! - mLat) < 0.08 && Math.abs(r.lon! - mLon) < 0.1)
    const base = near.length ? near : items
    map.fitBounds(L.latLngBounds(base.map((r) => [r.lat!, r.lon!] as [number, number])), {
      padding: [32, 32],
      maxZoom: 16,
    })
  }, [map, items, selected])
  return null
}

const ME_ICON = L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] })

/** Radio del círculo que marca la zona aproximada del usuario. */
const ME_RADIUS = 1000

/** Al obtener la ubicación se encuadra el círculo de 1 km. */
function FitMe({ me }: { me: Pos | null }) {
  const map = useMap()
  useEffect(() => {
    if (!me) return
    map.invalidateSize()
    map.fitBounds(L.latLng(me.lat, me.lon).toBounds(ME_RADIUS * 2), { padding: [24, 24] })
  }, [map, me])
  return null
}

interface Props {
  items: Recurso[]
  selectedId: string | null
  onSelect: (id: string) => void
  me?: Pos | null
}

export default function MapView({ items, selectedId, onSelect, me = null }: Props) {
  const { t } = useTranslation()
  const pins = useMemo(() => items.filter((r) => r.lat != null && r.lon != null), [items])
  const selected = pins.find((r) => r.id === selectedId)

  return (
    <MapContainer center={BCN} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Fit items={pins} selected={selected} />
      <FitMe me={me} />
      {me && (
        <>
          <Circle
            center={[me.lat, me.lon]}
            radius={ME_RADIUS}
            interactive={false}
            pathOptions={{ color: '#0077b6', weight: 2, fillColor: '#0077b6', fillOpacity: 0.12 }}
          />
          <Marker position={[me.lat, me.lon]} icon={ME_ICON} interactive={false} keyboard={false} title={t('geo.me')} />
        </>
      )}
      {pins.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat!, r.lon!]}
          icon={r.id === selectedId ? ICONS.selected : openNow(r) === false ? ICONS.closed : ICONS.ok}
          zIndexOffset={r.id === selectedId ? 1000 : 0}
          title={r.nombre}
          eventHandlers={{ click: () => onSelect(r.id) }}
        />
      ))}
    </MapContainer>
  )
}
