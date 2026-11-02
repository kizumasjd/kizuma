import { LocateFixed } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { GeoStatus } from '../lib/geo'

interface Props {
  active: boolean
  status: GeoStatus
  onLocate: () => void
  onStop: () => void
}

/** Botón explícito + aviso previo: el navegador solo pregunta cuando la persona lo decide. */
export default function GeoControl({ active, status, onLocate, onStop }: Props) {
  const { t } = useTranslation()
  const [asking, setAsking] = useState(false)

  if (active) {
    return (
      <div className="geo">
        <p className="geo-text" role="status">
          {t('geo.active')}
        </p>
        <button type="button" className="btn" onClick={onStop}>
          {t('geo.stop')}
        </button>
      </div>
    )
  }

  if (status === 'locating') {
    return (
      <div className="geo">
        <p className="geo-text" role="status" aria-busy="true">
          {t('geo.locating')}
        </p>
      </div>
    )
  }

  if (asking) {
    return (
      <div className="geo" role="group" aria-label={t('geo.use')}>
        <p className="geo-text">{t('geo.notice')}</p>
        <p className="note">{t('geo.noticeMap')}</p>
        <div className="geo-actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setAsking(false)
              onLocate()
            }}
          >
            {t('geo.continue')}
          </button>
          <button type="button" className="btn" onClick={() => setAsking(false)}>
            {t('geo.notNow')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="geo">
      <button type="button" className="btn" onClick={() => setAsking(true)}>
        <LocateFixed size={18} aria-hidden />
        {t('geo.use')}
      </button>
      {(status === 'denied' || status === 'failed') && (
        <p className="geo-text" role="status">
          {t(status === 'denied' ? 'geo.denied' : 'geo.failed')}
        </p>
      )}
    </div>
  )
}
