import { useTranslation } from 'react-i18next'
import { hasChosenLanguage, LANGS, setLanguage, type LangCode } from '../i18n'

export default function LanguageGrid({ onPick }: { onPick?: (c: LangCode) => void }) {
  const { i18n } = useTranslation()
  return (
    <div className="lang-grid">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          className="lang-btn"
          lang={l.code}
          aria-pressed={hasChosenLanguage() && i18n.language === l.code}
          onClick={() => {
            setLanguage(l.code)
            onPick?.(l.code)
          }}
        >
          <span className="code">{l.short}</span>
          {l.label}
        </button>
      ))}
    </div>
  )
}
