import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// BASE_PATH permite publicar bajo una subruta (GitHub Pages: /kizuna/). En local queda en '/'.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
})
