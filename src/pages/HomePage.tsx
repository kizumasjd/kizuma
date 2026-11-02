import { useTranslation } from 'react-i18next'
import CategoryList from '../components/CategoryList'

export default function HomePage() {
  const { t } = useTranslation()
  return (
    <div className="page">
      <img className="logo" src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="SJD Sant Joan de Déu Solidaritat" />
      <h1 className="display">{t('home.title')}</h1>
      <CategoryList />
    </div>
  )
}
