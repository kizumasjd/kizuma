import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CATEGORIAS } from '../lib/types'
import CategoryIcon from './CategoryIcon'

/** Las 4 filas de categorías. "Dormir" abre el flujo de preguntas; el resto, el buscador. */
export default function CategoryList({ zona = '' }: { zona?: string }) {
  const { t } = useTranslation()
  const q = zona.trim() ? `?zona=${encodeURIComponent(zona.trim())}` : ''
  return (
    <div className="cat-list">
      {CATEGORIAS.map((c) => (
        <Link key={c} className="cat-row" to={c === 'dormir' ? '/dormir' : `/buscar/${c}${q}`}>
          <span className="icon-bg">
            <CategoryIcon cat={c} />
          </span>
          <span className="label">{t(`cat.${c}`)}</span>
          <ChevronRight className="flip" size={20} aria-hidden />
        </Link>
      ))}
    </div>
  )
}
