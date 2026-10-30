export type Categoria = 'comer' | 'dormir' | 'duchar' | 'curar'

export const CATEGORIAS: Categoria[] = ['comer', 'dormir', 'duchar', 'curar']

export interface Recurso {
  id: string
  tipo: Categoria
  tipos: Categoria[]
  subtipo: string | null
  nombre: string
  servicio: string
  entidad: string | null
  direccion: string | null
  cp: string | null
  municipio: string | null
  distrito: string | null
  barrio: string | null
  zona: string | null
  lat: number | null
  lon: number | null
  tel: string | null
  email: string | null
  web: string | null
  metro: string | null
  bus: string | null
  horario: string | null
  colectivo: string | null
  acceso: string | null
  derivacion: boolean | null
  directo: boolean | null
  cita: boolean | null
  iconos: string[]
}

export const SUBTIPOS: Record<Categoria, string[]> = {
  comer: ['comedor', 'calle', 'alimentos'],
  dormir: [],
  duchar: ['ducha', 'aseo'],
  curar: ['urgencias', 'hospital', 'cap', 'saludMental', 'adicciones', 'consulta'],
}
