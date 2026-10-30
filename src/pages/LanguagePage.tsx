import { CircleAlert, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LanguageGrid from '../components/LanguageGrid'
import { CONTACT } from '../config/links'

export default function LanguagePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const urgent = [
    { n: '112', tel: CONTACT.emergencias, text: t('lang.e112') },
    { n: CONTACT.cuesbLabel, tel: CONTACT.cuesb, text: t('lang.cuesb') },
    { n: CONTACT.violenciaLabel, tel: CONTACT.violencia, text: t('lang.violence') },
  ]
  return (
    <div className="page">
      <img className="logo" src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="SJD Sant Joan de Déu Solidaritat" />
      <h1 className="display">{t('lang.welcome')}</h1>
      <div>
        <h2 className="title-m" style={{ color: 'var(--text-primary)' }}>
          {t('lang.choose')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: '24px', marginTop: 4 }}>{t('lang.hint')}</p>
      </div>
      <LanguageGrid onPick={() => navigate('/')} />
      <section className="card urgent" aria-labelledby="urgent-t">
        <h2 id="urgent-t">
          <CircleAlert size={22} aria-hidden />
          {t('lang.urgentTitle')}
        </h2>
        {urgent.map((u) => (
          <div className="urgent-row" key={u.tel}>
            <div>
              <strong dir="ltr">{u.n}</strong>
              <span>{u.text}</span>
            </div>
            <a className="round-call" href={`tel:${u.tel}`} aria-label={t('lang.callTo', { n: u.n })}>
              <Phone size={22} aria-hidden />
            </a>
          </div>
        ))}
      </section>
    </div>
  )
}
