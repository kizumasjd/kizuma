import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { openNow } from '../lib/data'
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

interface Props {
  items: Recurso[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function MapView({ items, selectedId, onSelect }: Props) {
  const pins = useMemo(() => items.filter((r) => r.lat != null && r.lon != null), [items])
  const selected = pins.find((r) => r.id === selectedId)

  return (
    <MapContainer center={BCN} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Fit items={pins} selected={selected} />
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
