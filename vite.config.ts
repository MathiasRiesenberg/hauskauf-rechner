import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: Pfad, unter dem die App bei GitHub Pages liegt
// (https://mathiasriesenberg.github.io/hauskauf-rechner/).
export default defineConfig({
  base: '/hauskauf-rechner/',
  plugins: [react()],
})
