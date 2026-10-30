import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { FavoritesProvider } from './lib/favorites'
import DetailPage from './pages/DetailPage'
import FavoritesPage from './pages/FavoritesPage'
import HomePage from './pages/HomePage'
import LanguagePage from './pages/LanguagePage'
import MorePage, { LegalPage } from './pages/MorePage'
import SearchPage from './pages/SearchPage'
import SleepFlowPage from './pages/SleepFlowPage'

export default function App() {
  return (
    <FavoritesProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/idioma" element={<LanguagePage />} />
            <Route path="/buscar/:cat?" element={<SearchPage />} />
            <Route path="/dormir" element={<SleepFlowPage />} />
            <Route path="/recurso/:id" element={<DetailPage />} />
            <Route path="/favoritos" element={<FavoritesPage />} />
            <Route path="/mas" element={<MorePage />} />
            <Route path="/legal/:slug" element={<LegalPage />} />
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FavoritesProvider>
  )
}
