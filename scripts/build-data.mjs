// Filtra y aligera el JSON categorizado: solo recursos de comer / dormir / duchar / curar.
// Uso: node scripts/build-data.mjs <ruta/recursos_categorizados.json>
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = process.argv[2] ?? process.env.RECURSOS_JSON
if (!SRC) {
  console.error('Uso: npm run data -- <ruta/recursos_categorizados.json>  (o variable RECURSOS_JSON)')
  process.exit(1)
}
const OUT = new URL('../src/data/recursos.json', import.meta.url)

const DISTRITOS = {
  "l'eixample": 'Eixample',
  eixample: 'Eixample',
  'sarrià - sant gervasi': 'Sarrià-Sant Gervasi',
  'sarrià-sant gervasi': 'Sarrià-Sant Gervasi',
  'les corts': 'Les Corts',
  'districte vi': 'Les Corts',
}

function subtipo(o) {
  const s = (o.servicio ?? '').toLowerCase()
  switch (o.tipo_categoria) {
    case 'curar':
      if (o.categoria_guia.includes('Hospitales')) return 'hospital'
      if (o.categoria_guia.includes('CUAP')) return 'urgencias'
      if (o.categoria_guia.includes('(CAP)')) return 'cap'
      if (o.categoria_guia === 'Salud mental') return 'saludMental'
      if (o.categoria_guia === 'Drogodependencias') return 'adicciones'
      return 'consulta'
    case 'duchar':
      return /cabina|\bwc\b|lavabos/.test(s) ? 'aseo' : 'ducha'
    case 'comer':
      if (s.includes('por la calle')) return 'calle'
      if (o.categoria_guia === 'Dónde comer') return 'comedor'
      return 'alimentos'
    default:
      return null
  }
}

// Geocodificaciones de recursos de Barcelona que caen fuera del municipio: se descartan para no
// poner un pin en un sitio equivocado (aparecen en la lista, no en el mapa).
const fueraDeBcn = (o) =>
  o.municipio === 'Barcelona' && o.lat != null && (o.lat < 41.32 || o.lat > 41.47 || o.lon < 2.05 || o.lon > 2.23)

const todos = JSON.parse(readFileSync(SRC, 'utf-8'))
const out = todos
  .filter((o) => o.tipo_categoria !== 'otros')
  .map((o) => {
    const dist = o.distrito ? (DISTRITOS[o.distrito.toLowerCase()] ?? o.distrito) : null
    const dir = [o.direccion_original ?? o.direccion?.replace(/, (Barcelona|España).*$/, ''), o.detalle_piso_puerta]
      .filter(Boolean)
      .join(' ')
    return {
      id: o.id,
      tipo: o.tipo_categoria,
      tipos: o.tipos_categoria,
      subtipo: subtipo(o),
      nombre: o.nombre,
      servicio: o.servicio,
      entidad: o.entidad,
      direccion: dir || null,
      cp: o.codigo_postal,
      municipio: o.municipio,
      distrito: dist,
      barrio: o.barrio,
      zona: o.zona,
      lat: fueraDeBcn(o) ? null : o.lat,
      lon: fueraDeBcn(o) ? null : o.lon,
      tel: o.telefono,
      email: o.email,
      web: o.web,
      metro: o.metro,
      bus: o.bus,
      horario: o.horario,
      colectivo: o.colectivo,
      acceso: o.tipo_acceso,
      derivacion: o.derivacion,
      directo: o.acceso_directo,
      cita: o.cita_previa,
      iconos: o.iconos,
    }
  })

writeFileSync(OUT, JSON.stringify(out))
console.log(`${out.length} recursos -> src/data/recursos.json`)
