import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const KEY = 'sjd.favoritos'

function load(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

interface Ctx {
  ids: string[]
  has: (id: string) => boolean
  toggle: (id: string) => void
}

const FavCtx = createContext<Ctx>({ ids: [], has: () => false, toggle: () => {} })

// Los favoritos se guardan solo en este dispositivo (localStorage), sin cuenta ni servidor.
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids))
    } catch {
      /* almacenamiento no disponible: los favoritos solo duran la sesión */
    }
  }, [ids])
  const value = useMemo<Ctx>(
    () => ({
      ids,
      has: (id) => ids.includes(id),
      toggle: (id) => setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])),
    }),
    [ids],
  )
  return <FavCtx.Provider value={value}>{children}</FavCtx.Provider>
}

export const useFavorites = () => useContext(FavCtx)
