import { Check, ChevronLeft, Globe, Info, Mail, MapPin, Navigation, Phone, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { accessBadge, FavButton } from '../components/ResourceCard'
import { dirHref, getRecurso, getSchedule, telHref } from '../lib/data'
import { fmtSpan, todayIndex } from '../lib/hours'

export default function DetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const r = getRecurso(id)

  if (!r)
    return (
      <div className="page">
        <p>{t('detail.notFound')}</p>
        <Link className="btn" to="/">
          {t('nav.home')}
        </Link>
      </div>
    )

  const badge = accessBadge(r)
  const tel = telHref(r.tel)
  const sch = getSchedule(r)
  const today = todayIndex()
  const place = r.direccion ?? r.zona
  const web = r.web ? (/^https?:/i.test(r.web) ? r.web : `https://${r.web}`) : null

  return (
    <>
      <header className="detail-head">
        <div className="detail-head-inner">
          <div className="detail-top">
            <button type="button" className="back" aria-label={t('common.back')} onClick={() => navigate(-1)}>
              <ChevronLeft className="flip" size={22} aria-hidden />
            </button>
            <FavButton id={r.id} />
          </div>
          <h1>{r.nombre}</h1>
          <p className="sub">{r.servicio}</p>
          <div className="detail-actions">
            <a className="btn dark" href={dirHref(r)} target="_blank" rel="noreferrer">
              <Navigation size={18} aria-hidden />
              {t('common.go')}
            </a>
            {tel && (
              <a className="btn" href={tel}>
                <Phone size={18} aria-hidden />
                {t('common.call')}
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="page">
        <section className="card sec small">
          <h2>{t('detail.howToEnter')}</h2>
          {badge && (
            <p>
              <span className={`badge ${badge.tone}`}>
                {badge.tone === 'ok' ? <Check size={16} aria-hidden /> : <Info size={16} aria-hidden />}
                {t(badge.key)}
              </span>
            </p>
          )}
          <p>
            {r.derivacion === true
              ? t('detail.enterReferral')
              : r.derivacion === false || r.directo
                ? t('detail.enterNoReferral')
                : t('detail.enterUnknown')}
          </p>
          {r.cita && <p>{t('detail.appointment')}</p>}
          {r.acceso && (
            <p className="note">
              {t('detail.guideNote')} {r.acceso}
            </p>
          )}
        </section>

        <section className="card sec">
          <h2>{t('detail.schedule')}</h2>
          {sch.kind === 'weekly' && (
            <ul className="sched">
              {sch.week.map((spans, i) => (
                <li key={i} className={i === today ? 'today' : undefined}>
                  <span>
                    {t(`days.${i}`)}
                    {i === today && ` · ${t('detail.today')}`}
                  </span>
                  <span dir="ltr">{spans.length ? spans.map((s) => fmtSpan(s)).join(', ') : '—'}</span>
                </li>
              ))}
            </ul>
          )}
          {sch.kind === 'always' && <p style={{ fontWeight: 800 }}>24 h</p>}
          {sch.kind === 'text' && (
            <>
              <p className="note">{t('detail.scheduleGuide')}</p>
              {r.horario!.split(';').map((l, i) => (
                <p key={i}>{l.trim()}</p>
              ))}
            </>
          )}
          {sch.kind === 'none' && <p>{t('detail.noSchedule')}</p>}
        </section>

        <section className="card sec">
          <h2>{t('detail.whoFor')}</h2>
          <p className="kv">
            <Users size={18} aria-hidden />
            {r.colectivo ?? t('detail.pending')}
          </p>
        </section>

        <section className="card sec">
          <h2>{t('detail.whatToBring')}</h2>
          <p className="kv">
            <Check size={18} color="#2d5a16" aria-hidden />
            {t('detail.pending')}
          </p>
        </section>

        <section className="card sec">
          <h2>{t('detail.howToGet')}</h2>
          {place && <p style={{ fontWeight: 700 }}>{place}</p>}
          {(r.cp || r.barrio || r.distrito) && (
            <p className="note">{[r.cp, r.barrio, r.distrito].filter(Boolean).join(' · ')}</p>
          )}
          {r.metro && (
            <p className="note">
              {t('detail.metro')}: {r.metro}
            </p>
          )}
          {r.bus && (
            <p className="note">
              {t('detail.bus')}: {r.bus}
            </p>
          )}
          {r.lat != null && (
            <p style={{ marginTop: 12 }}>
              <Link className="btn block" to={`/buscar/${r.tipo}?vista=mapa&sel=${r.id}`}>
                <MapPin size={18} aria-hidden />
                {t('common.seeOnMap')}
              </Link>
            </p>
          )}
        </section>

        {(r.tel || r.email || web || r.entidad) && (
          <section className="card sec">
            <h2>{t('detail.contact')}</h2>
            {r.tel && (
              <a className="link-row" href={tel ?? undefined} dir="ltr">
                <Phone size={18} aria-hidden />
                {r.tel}
              </a>
            )}
            {r.email && (
              <a className="link-row" href={`mailto:${r.email}`}>
                <Mail size={18} aria-hidden />
                {r.email}
              </a>
            )}
            {web && (
              <a className="link-row" href={web} target="_blank" rel="noreferrer">
                <Globe size={18} aria-hidden />
                {r.web}
              </a>
            )}
            {r.entidad && (
              <p className="note" style={{ marginTop: 8 }}>
                {t('detail.entity')}: {r.entidad}
              </p>
            )}
          </section>
        )}
      </div>
    </>
  )
}
