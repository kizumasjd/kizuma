import { Check, Heart, Info, Navigation, Phone } from 'lucide-react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { dirHref, etiquetas, openNow, telHref } from '../lib/data'
import { useFavorites } from '../lib/favorites'
import { formatDistance } from '../lib/geo'
import type { Recurso } from '../lib/types'

export function accessBadge(r: Recurso): { key: string; tone: 'ok' | 'warn' } | null {
  if (r.directo === true) return { key: 'badge.direct', tone: 'ok' }
  if (r.derivacion === true) return { key: 'badge.withReferral', tone: 'warn' }
  if (r.derivacion === false) return { key: 'badge.noReferral', tone: 'ok' }
  return null
}

export function FavButton({ id }: { id: string }) {
  const { t } = useTranslation()
  const { has, toggle } = useFavorites()
  const on = has(id)
  return (
    <button
      type="button"
      className="heart-btn"
      aria-pressed={on}
      aria-label={t(on ? 'common.favRemove' : 'common.favAdd')}
      onClick={() => toggle(id)}
    >
      <Heart size={22} aria-hidden />
    </button>
  )
}

interface Props {
  r: Recurso
  selected?: boolean
  onFocus?: () => void
  /** Distancia en metros desde la ubicación del usuario, si la ha compartido. */
  distance?: number
}

const ResourceCard = forwardRef<HTMLElement, Props>(function ResourceCard({ r, selected, onFocus, distance }, ref) {
  const { t, i18n } = useTranslation()
  const badge = accessBadge(r)
  const open = openNow(r)
  const tel = telHref(r.tel)
  const tags = etiquetas(r)
  const place = r.direccion ?? r.zona
  const area = [r.cp, r.barrio ?? r.distrito].filter(Boolean).join(' · ')

  return (
    <article
      ref={ref}
      className={`rcard${selected ? ' selected' : ''}`}
      onClick={(e) => {
        // Los enlaces y botones de la tarjeta hacen lo suyo; solo el resto de la tarjeta selecciona el pin.
        if (!(e.target as HTMLElement).closest('a, button')) onFocus?.()
      }}
    >
      <header className="rcard-head">
        <h2>{r.nombre}</h2>
        <FavButton id={r.id} />
      </header>
      <div className="rcard-body">
        <div className="addr-row">
          <div>
            <p className="addr">{place}</p>
            {area && <p className="addr-sub">{area}</p>}
            {distance != null && <p className="distance">{t('geo.away', { d: formatDistance(distance, i18n.language) })}</p>}
          </div>
          {(r.direccion || r.lat != null) && (
            <a className="go-btn" href={dirHref(r)} target="_blank" rel="noreferrer" aria-label={t('common.directions')}>
              <Navigation size={18} aria-hidden />
            </a>
          )}
        </div>

        {(badge || open !== null) && (
          <div className="badge-row">
            {badge && (
              <span className={`badge ${badge.tone}`}>
                {badge.tone === 'ok' ? <Check size={16} aria-hidden /> : <Info size={16} aria-hidden />}
                {t(badge.key)}
              </span>
            )}
            {open !== null && <span className={`status${open ? ' open' : ''}`}>{t(open ? 'badge.open' : 'badge.closed')}</span>}
          </div>
        )}

        {tags.length > 0 && (
          <div className="tags">
            {tags.map((k) => (
              <span key={k} className="tag">
                <Info size={14} aria-hidden />
                {t(`tag.${k}`)}
              </span>
            ))}
          </div>
        )}

        <div className="rcard-actions">
          {tel && (
            <a className="btn" href={tel}>
              <Phone size={18} aria-hidden />
              {t('common.call')}
            </a>
          )}
          <Link className={`btn primary${tel ? '' : ' only'}`} to={`/recurso/${r.id}`}>
            {t('common.moreInfo')}
          </Link>
        </div>
      </div>
    </article>
  )
})

export default ResourceCard
