import { BedSingle, Cross, ShowerHead, Utensils } from 'lucide-react'
import type { Categoria } from '../lib/types'

const ICONS = { comer: Utensils, dormir: BedSingle, duchar: ShowerHead, curar: Cross }

export default function CategoryIcon({ cat, size = 24 }: { cat: Categoria; size?: number }) {
  const Icon = ICONS[cat]
  return <Icon size={size} aria-hidden />
}
