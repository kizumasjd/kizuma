import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './ar'
import ca from './ca'
import en from './en'
import es from './es'
import fr from './fr'

export const LANGS = [
  { code: 'ca', short: 'CA', label: 'Català' },
  { code: 'es', short: 'ES', label: 'Castellano' },
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'fr', short: 'FR', label: 'Français' },
  { code: 'ar', short: 'AR', label: 'العربية' },
] as const

export type LangCode = (typeof LANGS)[number]['code']

const KEY = 'sjd.lang'

const isLang = (v: unknown): v is LangCode => LANGS.some((l) => l.code === v)

function stored(): LangCode | null {
  try {
    const v = localStorage.getItem(KEY)
    return isLang(v) ? v : null
  } catch {
    return null
  }
}

export const hasChosenLanguage = () => stored() !== null

function applyToDocument(code: LangCode) {
  document.documentElement.lang = code
  document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
}

export function setLanguage(code: LangCode) {
  try {
    localStorage.setItem(KEY, code)
  } catch {
    /* sin almacenamiento: el idioma solo dura la sesión */
  }
  void i18n.changeLanguage(code)
  applyToDocument(code)
}

const initial = stored() ?? 'es'

void i18n.use(initReactI18next).init({
  resources: {
    ca: { translation: ca },
    es: { translation: es },
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: initial,
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})
applyToDocument(initial)

export default i18n
