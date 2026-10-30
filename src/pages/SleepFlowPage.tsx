import {
  BedSingle,
  CalendarDays,
  ChevronLeft,
  CircleAlert,
  Globe,
  IdCard,
  Lock,
  MapPin,
  Phone,
  Thermometer,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { CONTACT, LINKS, mapsQuery } from '../config/links'

type Step = 'street' | 'padron' | 'eu' | 'soass' | 'r01' | 'r02' | 'r03'

interface Question {
  title: string
  yes: string
  no: string
  onYes: Step
  onNo: Step
  n: number
  total: number | null
  crumb: string
  progress: number
}

// Árbol de decisión del Figma (5 rutas):
//  1) calle → padrón → R01 · 2) calle → sin padrón → fuera UE → R02 · 3) calle → sin padrón → UE → R03
//  4) no calle → expediente SOASS → R03 · 5) no calle → sin expediente → R01
const QUESTIONS: Record<'street' | 'padron' | 'eu' | 'soass', Question> = {
  street: {
    title: 'sleep.qStreet',
    yes: 'sleep.qStreetYes',
    no: 'sleep.qStreetNo',
    onYes: 'padron',
    onNo: 'soass',
    n: 1,
    total: null,
    crumb: 'sleep.start',
    progress: 15,
  },
  padron: {
    title: 'sleep.qPadron',
    yes: 'sleep.qPadronYes',
    no: 'sleep.qPadronNo',
    onYes: 'r01',
    onNo: 'eu',
    n: 2,
    total: 3,
    crumb: 'sleep.crumbStreet',
    progress: 50,
  },
  eu: {
    title: 'sleep.qEu',
    yes: 'sleep.qEuYes',
    no: 'sleep.qEuNo',
    onYes: 'r02',
    onNo: 'r03',
    n: 3,
    total: 3,
    crumb: 'sleep.crumbStreetNoPadron',
    progress: 80,
  },
  soass: {
    title: 'sleep.qSoass',
    yes: 'sleep.qSoassYes',
    no: 'sleep.qSoassNo',
    onYes: 'r03',
    onNo: 'r01',
    n: 2,
    total: 2,
    crumb: 'sleep.crumbNoStreet',
    progress: 50,
  },
}

export default function SleepFlowPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [trail, setTrail] = useState<Step[]>(['street'])
  const step = trail[trail.length - 1]
  const isResult = step.startsWith('r0')
  const q = isResult ? null : QUESTIONS[step as keyof typeof QUESTIONS]

  const go = (s: Step) => setTrail((p) => [...p, s])
  const back = () => (trail.length > 1 ? setTrail((p) => p.slice(0, -1)) : navigate(-1))

  const label = isResult
    ? t('sleep.result')
    : q!.total
      ? t('sleep.questionOf', { n: q!.n, total: q!.total })
      : t('sleep.question', { n: q!.n })

  return (
    <>
      <header className="flow-head">
        <div className="flow-head-inner">
          <button type="button" className="icon-btn" style={{ background: '#fff', alignSelf: 'flex-start' }} aria-label={t('common.back')} onClick={back}>
            <ChevronLeft className="flip" size={20} aria-hidden />
          </button>
          <div className="flow-row">
            <span className="flow-icon">
              <BedSingle size={22} aria-hidden />
            </span>
            <span className="grow">{t('cat.dormir')}</span>
            <span>{label}</span>
          </div>
          <div className="progress" role="progressbar" aria-label={label} aria-valuenow={isResult ? 100 : q!.progress} aria-valuemin={0} aria-valuemax={100}>
            <div style={{ width: `${isResult ? 100 : q!.progress}%` }} />
          </div>
          <p className="flow-crumb">{isResult ? t('sleep.yourResult') : t(q!.crumb)}</p>
        </div>
      </header>

      <div className="flow-body">
        {q ? (
          <Question
            key={step}
            q={q}
            showImportant={step === 'street'}
            showPadron={step === 'street' || step === 'padron'}
            onAnswer={(yes) => go(yes ? q.onYes : q.onNo)}
          />
        ) : (
          <Result key={step} step={step as 'r01' | 'r02' | 'r03'} onReset={() => setTrail(['street'])} />
        )}
      </div>
    </>
  )
}

function Question({
  q,
  onAnswer,
  showImportant,
  showPadron,
}: {
  q: Question
  onAnswer: (yes: boolean) => void
  showImportant: boolean
  showPadron: boolean
}) {
  const { t } = useTranslation()
  return (
    <>
      <h1 className="flow-q">{t(q.title)}</h1>
      <p className="anon">
        <Lock size={14} aria-hidden />
        {t('sleep.anonymous')}
      </p>
      <button type="button" className="answer" onClick={() => onAnswer(true)}>
        <strong>{t('common.yes')}</strong>
        <span>{t(q.yes)}</span>
      </button>
      <button type="button" className="answer" onClick={() => onAnswer(false)}>
        <strong>{t('common.no')}</strong>
        <span>{t(q.no)}</span>
      </button>
      <a className="link-btn" href="tel:010">
        {t('sleep.dontKnow')}
      </a>

      {showImportant && <p className="group-label">{t('sleep.important')}</p>}
      {showImportant && (
        <Info icon={<Thermometer size={20} aria-hidden />} title={t('sleep.coldTitle')}>
          <p>{t('sleep.coldBody')}</p>
        </Info>
      )}
      {showPadron && (
        <Info blue icon={<IdCard size={20} aria-hidden />} title={t('sleep.padronTitle')}>
          <p>{t('sleep.padronBody')}</p>
          <p style={{ marginTop: 12 }}>
            <a className="btn block" href={LINKS.citaOAC} target="_blank" rel="noreferrer">
              {t('sleep.padronButton')}
            </a>
          </p>
        </Info>
      )}
    </>
  )
}

function Info({ icon, title, children, blue }: { icon: ReactNode; title: string; children: ReactNode; blue?: boolean }) {
  return (
    <section className={`card mini${blue ? ' blue' : ''}`}>
      <h3>
        {icon}
        {title}
      </h3>
      {children}
    </section>
  )
}

const RESULTS = {
  r01: {
    title: 'sleep.r01Title',
    body: 'sleep.r01Body',
    phones: [
      { n: '010', tel: '010' },
      { n: CONTACT.ss.tel2Label, tel: CONTACT.ss.tel2 },
    ],
    address: null,
    callName: '010',
    call: '010',
    online: LINKS.citaServeisSocials,
    onlineLine: true,
    howToGet: false,
  },
  r02: {
    title: 'sleep.r02Title',
    body: 'sleep.r02Body',
    phones: [{ n: CONTACT.saier.telLabel, tel: CONTACT.saier.tel }],
    address: CONTACT.saier.address,
    callName: 'SAIER',
    call: CONTACT.saier.tel,
    online: LINKS.citaSAIER,
    onlineLine: true,
    howToGet: true,
  },
  r03: {
    title: 'sleep.r03Title',
    body: 'sleep.r03Body',
    phones: [{ n: CONTACT.soass.telLabel, tel: CONTACT.soass.tel }],
    address: CONTACT.soass.address,
    callName: 'SOASS',
    call: CONTACT.soass.tel,
    online: null,
    onlineLine: false,
    howToGet: true,
  },
} as const

function Result({ step, onReset }: { step: 'r01' | 'r02' | 'r03'; onReset: () => void }) {
  const { t } = useTranslation()
  const r = RESULTS[step]
  return (
    <>
      <h1 className="flow-q">{t(r.title)}</h1>
      <p style={{ fontSize: 16, lineHeight: '24px' }}>{t(r.body)}</p>

      <section className="card mini blue">
        <h3>
          <CalendarDays size={20} aria-hidden />
          {t('sleep.howToRequest')}
        </h3>
        {r.phones.map((p) => (
          <a key={p.tel} className="link-row" href={`tel:${p.tel}`} dir="ltr">
            <Phone size={18} aria-hidden />
            {p.n}
          </a>
        ))}
        {r.address && (
          <p className="kv" style={{ padding: '6px 0' }}>
            <MapPin size={18} aria-hidden />
            {r.address}
          </p>
        )}
        {r.onlineLine && (
          <p className="kv" style={{ padding: '6px 0' }}>
            <Globe size={18} aria-hidden />
            {t('sleep.alsoOnline')}
          </p>
        )}
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <a className="btn green block" href={`tel:${r.call}`}>
            <Phone size={18} aria-hidden />
            {t('sleep.callTo', { n: r.callName })}
          </a>
          {r.online && (
            <a className="btn block" href={r.online} target="_blank" rel="noreferrer">
              {t('sleep.online')}
            </a>
          )}
          {r.howToGet && r.address && (
            <a className="btn block" href={mapsQuery(r.address)} target="_blank" rel="noreferrer">
              {t('sleep.howToGet')}
            </a>
          )}
        </div>
      </section>

      <section className="card mini">
        <p className="kv">
          <Thermometer size={20} color="var(--text-accent)" aria-hidden />
          {t('sleep.coldNote')}
        </p>
      </section>

      <section className="card mini">
        <h3>
          <CircleAlert size={20} aria-hidden />
          {t('sleep.sheltersTitle')}
        </h3>
        <p className="note" style={{ marginBottom: 12 }}>
          {t('sleep.sheltersNote')}
        </p>
        <Link className="btn block" to="/buscar/dormir">
          {t('sleep.seeShelters')}
        </Link>
      </section>

      <button type="button" className="link-btn" onClick={onReset}>
        {t('sleep.change')}
      </button>
    </>
  )
}
