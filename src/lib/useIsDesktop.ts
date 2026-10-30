import { useEffect, useState } from 'react'

const Q = '(min-width: 900px)'

export function useIsDesktop() {
  const [v, setV] = useState(() => window.matchMedia(Q).matches)
  useEffect(() => {
    const m = window.matchMedia(Q)
    const on = () => setV(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return v
}
