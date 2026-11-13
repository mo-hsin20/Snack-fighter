import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes all asset paths relative, so the built app works
// on GitHub Pages under https://<username>.github.io/<repo-name>/
export default defineConfig({
  plugins: [react()],
  base: './',
  // React, Bootstrap and the animation library together are a bit over
  // Vite's default 500 kB warning. The big extras (charts, scanner) are
  // already split into their own files, so we accept this size.
  build: { chunkSizeWarningLimit: 650 },
})
