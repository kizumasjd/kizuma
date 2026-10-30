import { ChevronRight, FileText, Globe, MapPinOff, ShieldCheck, Smartphone, UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import LanguageGrid from '../components/LanguageGrid'

const LEGAL = [
  ['aviso-legal', 'more.legalNotice'],
  ['privacidad', 'more.privacyPolicy'],
  ['cookies', 'more.cookies'],
  ['condiciones', 'more.terms'],
  ['accesibilidad', 'more.accessibility'],
] as const

export default function MorePage() {
  const { t } = useTranslation()
  const priv = [
    { icon: UserX, text: t('more.p1') },
    { icon: MapPinOff, text: t('more.p2') },
    { icon: Smartphone, text: t('more.p3') },
  ]
  return (
    <div className="page">
      <h1 className="page-title">{t('more.title')}</h1>

      <h2 className="section-title">
        <Globe size={22} aria-hidden />
        {t('more.language')}
      </h2>
      <LanguageGrid />

      <h2 className="section-title">
        <ShieldCheck size={22} aria-hidden />
        {t('more.privacy')}
      </h2>
      <div className="card">
        {priv.map(({ icon: Icon, text }) => (
          <div className="privacy-item" key={text}>
            <span className="ic">
              <Icon size={20} aria-hidden />
            </span>
            {text}
          </div>
        ))}
      </div>

      <h2 className="section-title">
        <FileText size={22} aria-hidden />
        {t('more.legal')}
      </h2>
      <nav className="card legal-list" aria-label={t('more.legal')}>
        {LEGAL.map(([slug, key]) => (
          <Link key={slug} to={`/legal/${slug}`}>
            {t(key)}
            <ChevronRight className="flip" size={20} aria-hidden />
          </Link>
        ))}
      </nav>
      <p className="note">{t('more.source')}</p>
    </div>
  )
}

export function LegalPage() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const item = LEGAL.find(([s]) => s === slug)
  return (
    <div className="page">
      <h1 className="page-title">{item ? t(item[1]) : t('more.legal')}</h1>
      <div className="card">{t('more.legalPending')}</div>
      <Link className="btn" to="/mas">
        {t('common.back')}
      </Link>
    </div>
  )
}
