import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,       // always use 5173
    strictPort: true, // fail if 5173 is taken — don't silently switch
  },
})