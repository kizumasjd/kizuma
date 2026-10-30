import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import CategoryList from '../components/CategoryList'

export default function HomePage() {
  const { t } = useTranslation()
  const [zona, setZona] = useState('')
  return (
    <div className="page">
      <img className="logo" src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="SJD Sant Joan de Déu Solidaritat" />
      <h1 className="display">{t('home.title')}</h1>
      <label className="title-m" htmlFor="zona">
        {t('home.zone')}
      </label>
      <div className="search-pill">
        <MapPin size={20} aria-hidden />
        <input
          id="zona"
          type="search"
          value={zona}
          onChange={(e) => setZona(e.target.value)}
          placeholder={t('home.zonePlaceholder')}
          autoComplete="off"
        />
      </div>
      <CategoryList zona={zona} />
    </div>
  )
}
