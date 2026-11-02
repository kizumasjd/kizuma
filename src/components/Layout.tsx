import { Heart, House, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { hasChosenLanguage } from '../i18n'

export default function Layout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  if (!hasChosenLanguage() && pathname !== '/idioma') return <Navigate to="/idioma" replace />

  const section = pathname === '/' ? 'home' : pathname.startsWith('/favoritos') ? 'fav' : pathname.startsWith('/mas') || pathname.startsWith('/legal') ? 'more' : 'search'

  const items = [
    { id: 'home', to: '/', icon: House, label: t('nav.home') },
    { id: 'fav', to: '/favoritos', icon: Heart, label: t('nav.favorites') },
    { id: 'more', to: '/mas', icon: Menu, label: t('nav.more') },
  ]

  return (
    <div className="shell">
      <main>
        <Outlet />
      </main>
      {pathname !== '/idioma' && (
        <nav className="nav" aria-label="Principal">
          {items.map(({ id, to, icon: Icon, label }) => (
            <Link key={id} to={to} aria-current={section === id ? 'page' : undefined}>
              <span className="pill">
                <Icon size={24} aria-hidden />
              </span>
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
