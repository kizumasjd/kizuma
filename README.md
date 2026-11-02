# SJD Serveis Socials · WebApp

React + Vite + TypeScript, mobile-first y adaptada a escritorio. Diseño: Figma `SJDD_WebApp_v1`.

```bash
npm install
npm run dev          # desarrollo
npm run build        # producción (dist/)
npm run data -- <ruta>  # regenera src/data/recursos.json desde el JSON categorizado
```

- **Datos**: `src/data/recursos.json` (solo recursos comer / dormir / duchar / curar; los `otros` se excluyen).
  El acceso está aislado en `src/lib/data.ts` para cambiarlo por una API cuando exista el backend.
- **Idiomas**: `src/i18n/{ca,es,en,fr,ar}.ts` (borradores a revisar). El árabe activa RTL.
- **Geolocalización** (en los resultados de Comer, Ducharme y Curarme), pensada para respetar la privacidad:
  - `src/lib/geo.ts`: hook `useGeo` (una sola lectura de precisión reducida, redondeada a ~100 m, solo en memoria; nunca en
    almacenamiento, URL ni servidor), distancia (Haversine) y formato de distancia.
  - `src/components/GeoControl.tsx`: botón explícito "Usar mi ubicación" + aviso previo; el navegador solo pregunta tras "Continuar".
    Si se deniega o falla, se siguen mostrando todos los sitios.
  - `src/components/MapView.tsx`: círculo de 1 km (`ME_RADIUS`) con zoom a la posición.
  - `src/pages/SearchPage.tsx` y `src/components/ResourceCard.tsx`: orden por cercanía y distancia en cada tarjeta.
  - Textos en la clave `geo` de `src/i18n/*.ts`. Exige HTTPS (o `localhost`).
- **Navegación**: Inicio, Favoritos y Más. Se quitaron el botón "Buscar" y el cuadro de zona de la home
  (`src/components/Layout.tsx`, `src/pages/HomePage.tsx`); la ruta `/buscar` sigue existiendo.
- **Pendiente de contenido**: URLs oficiales de cita previa (`src/config/links.ts`), textos legales,
  tipografía Ciutadella (se usa Titillium Web como sustituta) y fondo `#F4E9D8` opcional (`--surface-page`).

## Publicación (GitHub Pages)

- `main` se publica solo, con el flujo `.github/workflows/deploy.yml`, en <https://kizunasjd.github.io/kizuna/>.
- Otras ramas (p. ej. `develop`) solo se compilan para comprobar que no se rompe nada (`ci.yml`).
- La ruta base se define con la variable `BASE_PATH` (`/<nombre-del-repositorio>/` en Pages, calculada por el flujo; `/` en local).
- Los enlaces directos funcionan porque en la compilación `index.html` se copia como `404.html`.
- La web incluye `noindex` mientras el contenido esté pendiente: quitar la etiqueta `robots` de `index.html` al publicar de forma definitiva.
