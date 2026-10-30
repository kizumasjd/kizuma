// Teléfonos y enlaces de los servicios que aparecen en el flujo de Dormir.
// Los teléfonos y direcciones salen del Figma. Los enlaces web NO figuran en el diseño:
// hay que sustituirlos por las URLs oficiales de cita previa antes de publicar.
export const CONTACT = {
  emergencias: '112',
  cuesb: '900703030',
  cuesbLabel: '900 703 030',
  violencia: '900900120',
  violenciaLabel: '900 900 120',
  ss: { tel: '010', tel2: '934027000', tel2Label: '934 027 000' },
  saier: { tel: '931532800', telLabel: '931 53 28 00', address: 'C/ Tarragona, 141, Barcelona' },
  soass: { tel: '932566650', telLabel: '932 566 650', address: 'Passeig de Pujades, 29, Barcelona' },
  cuesbAddress: 'C/ Llacuna, 24, Barcelona',
}

// TODO(contenido): sustituir por las URLs oficiales de cita previa.
const AJUNTAMENT = 'https://www.barcelona.cat/'
export const LINKS = {
  citaServeisSocials: AJUNTAMENT,
  citaOAC: AJUNTAMENT,
  citaSAIER: AJUNTAMENT,
}

export const mapsQuery = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
