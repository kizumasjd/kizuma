import { Check, ChevronLeft, Search, X } from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import CategoryList from '../components/CategoryList'
import GeoControl from '../components/GeoControl'
import ResourceCard from '../components/ResourceCard'
import { buscar, getRecurso } from '../lib/data'
import { distanceM, useGeo } from '../lib/geo'
import { useIsDesktop } from '../lib/useIsDesktop'
import { CATEGORIAS, SUBTIPOS, type Categoria } from '../lib/types'

const PAGE = 8

// El mapa (Leaflet) se descarga solo cuando se necesita.
const MapView = lazy(() => import('../components/MapView'))

export default function SearchPage() {
  const { cat } = useParams()
  const { t } = useTranslation()

  if (!cat) {
    return (
      <div className="page">
        <h1 className="display">{t('search.chooseTitle')}</h1>
        <CategoryList />
      </div>
    )
  }
  if (!CATEGORIAS.includes(cat as Categoria)) return <Navigate to="/buscar" replace />
  return <Results categoria={cat as Categoria} />
}

function Results({ categoria }: { categoria: Categoria }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const desktop = useIsDesktop()
  const [params, setParams] = useSearchParams()
  const [limit, setLimit] = useState(PAGE)
  const refs = useRef(new Map<string, HTMLElement>())

  const zona = params.get('zona') ?? ''
  const abierto = params.get('abierto') === '1'
  const der = (params.get('der') ?? 'todas') as 'todas' | 'sin' | 'con'
  const sub = params.get('sub')
  const vista = params.get('vista') === 'mapa' ? 'mapa' : 'lista'
  const sel = params.get('sel')

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) (v ? next.set(k, v) : next.delete(k))
    setParams(next, { replace: true })
    setLimit(PAGE)
  }

  const { pos, status, request, clear } = useGeo()

  const found = useMemo(
    () => buscar({ categoria, zona, abiertoAhora: abierto, derivacion: der, subtipo: sub }),
    [categoria, zona, abierto, der, sub],
  )
  // Con ubicación, los sitios se ordenan por cercanía (los que no tienen coordenadas, al final). Se calcula en local.
  const distances = useMemo(() => {
    const m = new Map<string, number>()
    if (pos) for (const r of found) if (r.lat != null && r.lon != null) m.set(r.id, distanceM(pos, r.lat, r.lon))
    return m
  }, [found, pos])
  const items = useMemo(
    () => (pos ? [...found].sort((a, b) => (distances.get(a.id) ?? Infinity) - (distances.get(b.id) ?? Infinity)) : found),
    [found, distances, pos],
  )
  const sinUbicacion = items.filter((r) => r.lat == null).length
  const selected = sel ? getRecurso(sel) : undefined

  // En escritorio, al elegir un pin se lleva la tarjeta correspondiente a la vista.
  useEffect(() => {
    if (desktop && sel) refs.current.get(sel)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [sel, desktop])

  const shown = items.slice(0, limit)
  // Si el recurso seleccionado cae fuera de la página visible, se amplía para mostrarlo.
  const selIdx = sel ? items.findIndex((r) => r.id === sel) : -1
  const visible = selIdx >= limit ? items.slice(0, selIdx + 1) : shown

  const subs = SUBTIPOS[categoria]
  const showList = desktop || vista === 'lista'
  const showMap = desktop || vista === 'mapa'

  const countText = t(zona.trim() ? `results.${categoria}_zone` : `results.${categoria}`, {
    count: items.length,
    zone: zona.trim(),
  })

  return (
    <>
      <div className="results-head">
        <div className="results-head-inner">
          <div className="pill-input">
            <button type="button" className="icon-btn" aria-label={t('common.back')} onClick={() => navigate(-1)}>
              <ChevronLeft className="flip" size={22} aria-hidden />
            </button>
            <span className="cat-name">{t(`cat.${categoria}`)} ·</span>
            <input
              type="search"
              value={zona}
              onChange={(e) => set({ zona: e.target.value || null })}
              placeholder={t('search.zonePlaceholder')}
              aria-label={t('search.zonePlaceholder')}
            />
            <Search size={20} color="#005eb8" aria-hidden />
          </div>
          <div className="segmented view-toggle" role="group">
            <button type="button" aria-pressed={vista === 'lista'} onClick={() => set({ vista: null })}>
              {t('search.list')}
            </button>
            <button type="button" aria-pressed={vista === 'mapa'} onClick={() => set({ vista: 'mapa' })}>
              {t('search.map')}
            </button>
          </div>
        </div>
      </div>

      <div className="page wide">
        <p className="count-line" role="status">
          {countText}
        </p>

        <GeoControl active={pos != null} status={status} onLocate={request} onStop={clear} />

        <div className="chips" role="group">
          <button type="button" className="chip" aria-pressed={abierto} onClick={() => set({ abierto: abierto ? null : '1' })}>
            {abierto && <Check size={16} aria-hidden />}
            {t('filters.openNow')}
          </button>
          <button type="button" className="chip" aria-pressed={der === 'sin'} onClick={() => set({ der: der === 'sin' ? null : 'sin' })}>
            {t('filters.noReferral')}
          </button>
          <button type="button" className="chip" aria-pressed={der === 'con'} onClick={() => set({ der: der === 'con' ? null : 'con' })}>
            {t('filters.withReferral')}
          </button>
        </div>
        {subs.length > 0 && (
          <div className="chips sub" role="group">
            {subs.map((s) => (
              <button key={s} type="button" className="chip" aria-pressed={sub === s} onClick={() => set({ sub: sub === s ? null : s })}>
                {t(`sub.${s}`)}
              </button>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <div className="empty">
            <h2>{t('search.emptyTitle')}</h2>
            <p style={{ marginBottom: 16 }}>{t('search.emptyHint')}</p>
            <button type="button" className="btn primary" onClick={() => set({ zona: null, abierto: null, der: null, sub: null, sel: null })}>
              {t('search.clearFilters')}
            </button>
          </div>
        ) : (
          <div className="results-layout">
            {showList && (
              <div className="list-col">
                {visible.map((r) => (
                  <ResourceCard
                    key={r.id}
                    r={r}
                    selected={r.id === sel}
                    distance={distances.get(r.id)}
                    ref={(el) => {
                      if (el) refs.current.set(r.id, el)
                      else refs.current.delete(r.id)
                    }}
                    onFocus={() => r.lat != null && set({ sel: r.id })}
                  />
                ))}
                {items.length > visible.length && (
                  <button type="button" className="btn block" onClick={() => setLimit((l) => l + PAGE)}>
                    {t('common.loadMore', { n: items.length - visible.length })}
                  </button>
                )}
              </div>
            )}
            {showMap && (
              <div>
                <div className="map-wrap">
                  <Suspense fallback={<div aria-busy="true" style={{ height: '100%' }} />}>
                    <MapView items={items} selectedId={sel} onSelect={(id) => set({ sel: id })} me={pos} />
                  </Suspense>
                  {!desktop && selected && items.some((r) => r.id === selected.id) && (
                    <div className="map-card">
                      <button type="button" className="map-card-close" aria-label={t('common.close')} onClick={() => set({ sel: null })}>
                        <X size={22} aria-hidden />
                      </button>
                      <ResourceCard r={selected} distance={distances.get(selected.id)} />
                    </div>
                  )}
                </div>
                {sinUbicacion > 0 && (
                  <p className="note" style={{ marginTop: 8 }}>
                    {t('search.noCoords', { n: sinUbicacion })}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        {categoria === 'dormir' && (
          <p className="note">
            {t('sleep.sheltersNote')} <Link to="/dormir">{t('sleep.start')}</Link>
          </p>
        )}
      </div>
    </>
  )
}
