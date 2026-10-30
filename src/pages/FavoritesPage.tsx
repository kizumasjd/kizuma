import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import ResourceCard from '../components/ResourceCard'
import { getRecurso } from '../lib/data'
import { useFavorites } from '../lib/favorites'

export default function FavoritesPage() {
  const { t } = useTranslation()
  const { ids } = useFavorites()
  const items = ids.map(getRecurso).filter((r) => r !== undefined)
  return (
    <div className="page">
      <h1 className="page-title">{t('fav.title')}</h1>
      {items.length > 0 ? (
        <>
          <p className="note" style={{ textAlign: 'center' }}>
            {t('fav.saved', { count: items.length })}
          </p>
          {items.map((r) => (
            <ResourceCard key={r.id} r={r} />
          ))}
        </>
      ) : (
        <div className="empty">
          <h2>{t('fav.emptyTitle')}</h2>
          <p style={{ marginBottom: 16 }}>{t('fav.emptyHint')}</p>
          <Link className="btn primary" to="/buscar">
            {t('fav.find')}
          </Link>
        </div>
      )}
    </div>
  )
}
